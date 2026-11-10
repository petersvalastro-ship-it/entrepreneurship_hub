import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { assessmentById, type Assessment } from '@/lib/assessments';
import {
  DEFAULT_SETTINGS,
  detectRapidClick,
  isLowEffortAttempt,
  xpForEvent,
  type Attempt,
  type ClassSettings,
  type GateOverrideRow,
  type XpEvent,
} from '@/lib/mastery';

export type AttemptResponse = {
  itemId: string;
  concept: string;
  chosen: number;
  correct: boolean;
  seconds: number;
};

export type AnomalyRow = {
  id: string;
  type: string;
  nodeId: string;
  createdAt: string;
  dismissedAt: string | null;
};

export type AdminActionRow = {
  id: string;
  action: string;
  scope: string;
  nodeId: string;
  xpRemoved: number;
  requireRetake: boolean;
  reason: string;
  createdAt: string;
};

const TIME_KEY = 'launchpad-active-time-v1';
const IDLE_AFTER_MS = 120_000;

function readTimes(): Record<string, number> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(window.localStorage.getItem(TIME_KEY) || '{}') as Record<string, number>;
  } catch {
    return {};
  }
}

/**
 * Loads a student's mastery state (settings, attempts, gate overrides, XP
 * ledger, flags) and enforces the anti-farming rules when XP is awarded.
 */
export function useMastery(
  userId: string | null | undefined,
  options: { onEarnXp?: (amount: number) => void } = {},
) {
  const [settings, setSettings] = useState<ClassSettings>(DEFAULT_SETTINGS);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [overrides, setOverrides] = useState<GateOverrideRow[]>([]);
  const [flags, setFlags] = useState<AnomalyRow[]>([]);
  const [adminActions, setAdminActions] = useState<AdminActionRow[]>([]);
  const [xpToday, setXpToday] = useState(0);
  const [totalActiveSeconds, setTotalActiveSeconds] = useState(0);
  const [studyDays, setStudyDays] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastNotice, setLastNotice] = useState<string | null>(null);

  const times = useRef<Record<string, number>>({});
  const [timeTick, setTimeTick] = useState(0);
  const currentNode = useRef<string | null>(null);
  const lastInput = useRef<number>(Date.now());
  const interactions = useRef<number>(0);
  const idleSeconds = useRef<number>(0);
  const actionStamps = useRef<number[]>([]);
  const onEarnXp = options.onEarnXp;

  useEffect(() => {
    times.current = readTimes();
    setTimeTick((t) => t + 1);
  }, []);

  const persistTimes = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(TIME_KEY, JSON.stringify(times.current));
    } catch {
      /* storage unavailable */
    }
  }, []);

  // 1s active-time clock; stops counting after 2 minutes with no input.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const bump = () => {
      lastInput.current = Date.now();
      interactions.current += 1;
    };
    const events: (keyof WindowEventMap)[] = ['keydown', 'pointerdown', 'wheel', 'scroll'];
    events.forEach((event) => window.addEventListener(event, bump, { passive: true }));
    const timer = window.setInterval(() => {
      const node = currentNode.current;
      if (!node || document.hidden) return;
      if (Date.now() - lastInput.current > IDLE_AFTER_MS) {
        idleSeconds.current += 1;
        return;
      }
      times.current[node] = (times.current[node] ?? 0) + 1;
      if (times.current[node] % 5 === 0) {
        persistTimes();
        setTimeTick((t) => t + 1);
      }
    }, 1000);
    return () => {
      events.forEach((event) => window.removeEventListener(event, bump));
      window.clearInterval(timer);
      persistTimes();
    };
  }, [persistTimes]);

  const reload = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const today = new Date().toISOString().slice(0, 10);
    const [settingRes, attemptRes, overrideRes, ledgerRes, flagRes, adminRes, sessionRes] = await Promise.all([
      supabase.from('class_setting').select('*').eq('id', 'default').maybeSingle(),
      supabase
        .from('assessment_attempt')
        .select('id, assessment_id, tier, node_id, attempt_number, score_pct, passed, low_effort, median_seconds, created_at')
        .eq('student_id', userId),
      supabase.from('gate_override').select('node_id, state, threshold_override, reason').eq('student_id', userId),
      supabase.from('xp_ledger').select('xp_delta, created_at').eq('student_id', userId).neq('event_type', 'assignment_submit'),
      supabase.from('anomaly_flag').select('id, type, node_id, created_at, dismissed_at').eq('student_id', userId),
      supabase
        .from('xp_admin_action')
        .select('id, action, scope, node_id, xp_removed, require_retake, reason, created_at')
        .eq('student_id', userId),
      supabase.from('engagement_session').select('active_seconds, started_at').eq('student_id', userId),
    ]);

    if (settingRes.data) {
      setSettings({
        masteryGateEnabled: !!settingRes.data.mastery_gate_enabled,
        defaultThreshold: Number(settingRes.data.default_threshold) || 80,
        dailyXpCap: Number(settingRes.data.daily_xp_cap) || 150,
        minSectionSeconds: Number(settingRes.data.min_section_seconds) || 90,
      });
    }
    setAttempts(
      (attemptRes.data ?? []).map((row: any) => ({
        id: row.id,
        assessmentId: row.assessment_id,
        tier: row.tier,
        nodeId: row.node_id,
        attemptNumber: Number(row.attempt_number) || 1,
        scorePct: Number(row.score_pct) || 0,
        passed: !!row.passed,
        lowEffort: !!row.low_effort,
        medianSeconds: Number(row.median_seconds) || 0,
        createdAt: row.created_at,
      })),
    );
    setOverrides(
      (overrideRes.data ?? []).map((row: any) => ({
        nodeId: row.node_id,
        state: row.state,
        thresholdOverride: row.threshold_override === null ? null : Number(row.threshold_override),
        reason: row.reason ?? '',
      })),
    );
    setXpToday(
      (ledgerRes.data ?? [])
        .filter((row: any) => String(row.created_at).slice(0, 10) === today)
        .reduce((sum: number, row: any) => sum + (Number(row.xp_delta) || 0), 0),
    );
    setFlags(
      (flagRes.data ?? []).map((row: any) => ({
        id: row.id,
        type: row.type,
        nodeId: row.node_id,
        createdAt: row.created_at,
        dismissedAt: row.dismissed_at,
      })),
    );
    setAdminActions(
      (adminRes.data ?? []).map((row: any) => ({
        id: row.id,
        action: row.action,
        scope: row.scope,
        nodeId: row.node_id,
        xpRemoved: Number(row.xp_removed) || 0,
        requireRetake: !!row.require_retake,
        reason: row.reason ?? '',
        createdAt: row.created_at,
      })),
    );
    const sessions = sessionRes.data ?? [];
    setTotalActiveSeconds(sessions.reduce((sum: number, row: any) => sum + (Number(row.active_seconds) || 0), 0));
    setStudyDays(sessions.map((row: any) => row.started_at));
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    reload();
  }, [reload]);

  const logLedger = useCallback(
    async (nodeId: string, event: XpEvent, award: { xp: number; capped: boolean; multiplier: number; blockedReason: string }) => {
      if (!userId) return;
      await supabase.from('xp_ledger').insert({
        student_id: userId,
        node_id: nodeId,
        event_type: event,
        xp_delta: award.xp,
        multiplier_applied: award.multiplier,
        capped: award.capped,
        blocked_reason: award.blockedReason,
      });
      setXpToday((current) => current + award.xp);
    },
    [userId],
  );

  const flagAnomaly = useCallback(
    async (type: string, nodeId: string, evidence: Record<string, unknown>) => {
      if (!userId) return;
      const { data } = await supabase
        .from('anomaly_flag')
        .insert({ student_id: userId, node_id: nodeId, type, evidence: evidence as never })
        .select('id, type, node_id, created_at, dismissed_at')
        .maybeSingle();
      if (data) {
        setFlags((current) => [
          { id: data.id, type: data.type, nodeId: data.node_id, createdAt: data.created_at, dismissedAt: data.dismissed_at },
          ...current,
        ]);
      }
    },
    [userId],
  );

  /** Marks which node the active-time clock belongs to, and closes the last one. */
  const setActiveNode = useCallback(
    async (nodeId: string | null) => {
      const previous = currentNode.current;
      if (previous === nodeId) return;
      if (previous && userId) {
        const active = times.current[previous] ?? 0;
        if (active > 0) {
          await supabase.from('engagement_session').insert({
            student_id: userId,
            node_id: previous,
            active_seconds: active,
            idle_seconds: idleSeconds.current,
            interaction_count: interactions.current,
          });
        }
      }
      idleSeconds.current = 0;
      interactions.current = 0;
      currentNode.current = nodeId;
      lastInput.current = Date.now();
    },
    [userId],
  );

  const activeSecondsFor = useCallback((nodeId: string) => times.current[nodeId] ?? 0, []);

  /** XP for a non-assessment event, with every guardrail applied. */
  const awardXp = useCallback(
    async (
      event: XpEvent,
      nodeId: string,
      ctx: { hasEvidence?: boolean; alreadyAwarded?: boolean } = {},
    ) => {
      const activeSeconds = activeSecondsFor(nodeId);
      const flagged = event === 'section_complete' && detectRapidClick(actionStamps.current, activeSeconds);
      actionStamps.current = [...actionStamps.current.filter((t) => Date.now() - t < 60_000), Date.now()];
      const award = xpForEvent(event, {
        activeSeconds,
        hasEvidence: ctx.hasEvidence ?? false,
        alreadyAwarded: ctx.alreadyAwarded ?? false,
        xpToday,
        flagged,
        settings,
      });
      if (flagged) {
        await flagAnomaly('rapid_click', nodeId, { activeSeconds, actions: actionStamps.current.length });
        setLastNotice('Slow down a little — this section needs about 2 minutes of real reading before it counts. Your progress is saved.');
      } else if (award.blockedReason) {
        setLastNotice(award.blockedReason);
      } else {
        setLastNotice(null);
      }
      if (award.xp > 0) onEarnXp?.(award.xp);
      await logLedger(nodeId, event, award);
      return award;
    },
    [activeSecondsFor, flagAnomaly, logLedger, onEarnXp, settings, xpToday],
  );

  /** Records a finished assessment attempt and any XP it earns. */
  const recordAttempt = useCallback(
    async (assessment: Assessment, responses: AttemptResponse[], elapsedSeconds: number) => {
      const correct = responses.filter((r) => r.correct).length;
      const scorePct = responses.length ? Math.round((correct / responses.length) * 100) : 0;
      const sorted = responses.map((r) => r.seconds).sort((a, b) => a - b);
      const median = sorted.length ? (sorted[Math.floor(sorted.length / 2)] ?? 0) : 0;
      const lowEffort = isLowEffortAttempt(median);
      const priorAttempts = attempts.filter((a) => a.assessmentId === assessment.id).length;
      const attemptNumber = priorAttempts + 1;
      const threshold = settings.defaultThreshold;
      const passed = scorePct >= threshold;

      const local: Attempt = {
        id: `local-${Date.now()}`,
        assessmentId: assessment.id,
        tier: assessment.tier,
        nodeId: assessment.nodeId,
        attemptNumber,
        scorePct,
        passed,
        lowEffort,
        medianSeconds: median,
        createdAt: new Date().toISOString(),
      };
      setAttempts((current) => [...current, local]);

      if (userId) {
        await supabase.from('assessment_attempt').insert({
          student_id: userId,
          assessment_id: assessment.id,
          tier: assessment.tier,
          node_id: assessment.nodeId,
          attempt_number: attemptNumber,
          score_pct: scorePct,
          passed,
          low_effort: lowEffort,
          median_seconds: median,
          active_seconds: elapsedSeconds,
          responses: responses as never,
        });
        if (lowEffort) {
          await flagAnomaly('low_effort_attempt', assessment.nodeId, { median, scorePct });
        }
      }

      let award = { xp: 0, capped: false, multiplier: 0, blockedReason: '' };
      if (passed) {
        const event: XpEvent =
          assessment.tier === 'chapter' ? 'chapter_passed' : assessment.tier === 'module' ? 'module_passed' : 'section_check_passed';
        const firstPass = !attempts.some((a) => a.assessmentId === assessment.id && a.passed);
        award = xpForEvent(event, {
          attemptNumber,
          alreadyAwarded: !firstPass,
          xpToday,
          lowEffort,
          settings,
        });
        if (award.xp > 0) onEarnXp?.(award.xp);
        if (userId) await logLedger(assessment.nodeId, event, award);

        if (assessment.tier === 'chapter' && scorePct >= 95 && !lowEffort) {
          const bonus = xpForEvent('mastery_bonus', { xpToday: xpToday + award.xp, settings });
          if (bonus.xp > 0) onEarnXp?.(bonus.xp);
          if (userId) await logLedger(assessment.nodeId, 'mastery_bonus', bonus);
          award = { ...award, xp: award.xp + bonus.xp };
        }
      }

      setLastNotice(award.blockedReason || null);
      return { scorePct, passed, lowEffort, attemptNumber, award, responses };
    },
    [attempts, flagAnomaly, logLedger, onEarnXp, settings, userId, xpToday],
  );

  const assessmentsPassed = useMemo(
    () => new Set(attempts.filter((a) => a.passed).map((a) => a.assessmentId)),
    [attempts],
  );

  return {
    settings,
    attempts,
    overrides,
    flags,
    adminActions,
    xpToday,
    totalActiveSeconds,
    studyDays,
    loading,
    lastNotice,
    setLastNotice,
    assessmentsPassed,
    activeSecondsFor,
    setActiveNode,
    awardXp,
    recordAttempt,
    reload,
    timeTick,
    getAssessment: assessmentById,
  };
}
