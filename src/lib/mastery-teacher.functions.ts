import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';

export type ClassAttempt = {
  studentId: string;
  assessmentId: string;
  tier: 'section' | 'module' | 'chapter';
  nodeId: string;
  attemptNumber: number;
  scorePct: number;
  passed: boolean;
  lowEffort: boolean;
  medianSeconds: number;
  createdAt: string;
  responses: { itemId: string; concept: string; chosen: number; correct: boolean; seconds: number }[];
};

export type ClassStudent = {
  userId: string;
  name: string;
  email: string;
  xp: number;
  thresholdOverride: number | null;
  sectionsDone: number;
  completedSections: string[];
  activeSeconds: number;
  idleSeconds: number;
  lastActiveAt: string | null;
  sessionDays: string[];
  flags: { id: string; type: string; nodeId: string; createdAt: string; dismissedAt: string | null }[];
  overrides: { nodeId: string; state: 'teacher_unlocked' | 'retake_required'; thresholdOverride: number | null }[];
  adminActions: { id: string; action: string; scope: string; nodeId: string; xpRemoved: number; reason: string; createdAt: string }[];
  attempts: ClassAttempt[];
};

export type ClassSettingsRow = {
  masteryGateEnabled: boolean;
  defaultThreshold: number;
  dailyXpCap: number;
  minSectionSeconds: number;
};

export type ClassMasteryPayload = { settings: ClassSettingsRow; students: ClassStudent[] };

async function requireTeacher(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', context.userId)
    .eq('role', 'teacher');
  if (error) throw new Error(error.message);
  if (!data || data.length === 0) throw new Error('This view is available to teachers only.');
}

/** Everything the teacher dashboard needs: mastery, effort, time and flags. */
export const getClassMastery = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ClassMasteryPayload> => {
    await requireTeacher(context as any);

    const [profiles, progress, attempts, sessions, flags, overrides, admin, setting] = await Promise.all([
      context.supabase.from('student_profile').select('user_id, display_name, email, xp, threshold_override, updated_at'),
      context.supabase.from('launchpad_progress').select('user_id, section_id, completed'),
      context.supabase.from('assessment_attempt').select('*'),
      context.supabase.from('engagement_session').select('student_id, node_id, active_seconds, idle_seconds, started_at'),
      context.supabase.from('anomaly_flag').select('id, student_id, type, node_id, created_at, dismissed_at'),
      context.supabase.from('gate_override').select('student_id, node_id, state, threshold_override'),
      context.supabase.from('xp_admin_action').select('id, student_id, action, scope, node_id, xp_removed, reason, created_at'),
      context.supabase.from('class_setting').select('*').eq('id', 'default').maybeSingle(),
    ]);

    const students = new Map<string, ClassStudent>();
    const ensure = (userId: string): ClassStudent => {
      let row = students.get(userId);
      if (!row) {
        row = {
          userId,
          name: 'Student',
          email: '',
          xp: 0,
          thresholdOverride: null,
          sectionsDone: 0,
          completedSections: [],
          activeSeconds: 0,
          idleSeconds: 0,
          lastActiveAt: null,
          sessionDays: [],
          flags: [],
          overrides: [],
          adminActions: [],
          attempts: [],
        };
        students.set(userId, row);
      }
      return row;
    };

    for (const profile of profiles.data ?? []) {
      const row = ensure(profile.user_id);
      row.name = profile.display_name || 'Student';
      row.email = profile.email || '';
      row.xp = Number(profile.xp) || 0;
      row.thresholdOverride = profile.threshold_override === null ? null : Number(profile.threshold_override);
      row.lastActiveAt = profile.updated_at ?? null;
    }
    for (const entry of progress.data ?? []) {
      const row = ensure(entry.user_id);
      if (entry.completed) {
        row.sectionsDone += 1;
        row.completedSections.push(entry.section_id);
      }
    }
    for (const attempt of attempts.data ?? []) {
      const row = ensure(attempt.student_id);
      row.attempts.push({
        studentId: attempt.student_id,
        assessmentId: attempt.assessment_id,
        tier: attempt.tier as 'section' | 'module' | 'chapter',
        nodeId: attempt.node_id,
        attemptNumber: Number(attempt.attempt_number) || 1,
        scorePct: Number(attempt.score_pct) || 0,
        passed: !!attempt.passed,
        lowEffort: !!attempt.low_effort,
        medianSeconds: Number(attempt.median_seconds) || 0,
        createdAt: attempt.created_at,
        responses: Array.isArray(attempt.responses) ? (attempt.responses as never) : [],
      });
    }
    for (const session of sessions.data ?? []) {
      const row = ensure(session.student_id);
      row.activeSeconds += Number(session.active_seconds) || 0;
      row.idleSeconds += Number(session.idle_seconds) || 0;
      row.sessionDays.push(session.started_at);
    }
    for (const flag of flags.data ?? []) {
      ensure(flag.student_id).flags.push({
        id: flag.id,
        type: flag.type,
        nodeId: flag.node_id,
        createdAt: flag.created_at,
        dismissedAt: flag.dismissed_at,
      });
    }
    for (const override of overrides.data ?? []) {
      ensure(override.student_id).overrides.push({
        nodeId: override.node_id,
        state: override.state as 'teacher_unlocked' | 'retake_required',
        thresholdOverride: override.threshold_override === null ? null : Number(override.threshold_override),
      });
    }
    for (const action of admin.data ?? []) {
      ensure(action.student_id).adminActions.push({
        id: action.id,
        action: action.action,
        scope: action.scope,
        nodeId: action.node_id,
        xpRemoved: Number(action.xp_removed) || 0,
        reason: action.reason ?? '',
        createdAt: action.created_at,
      });
    }

    students.delete(context.userId);

    return {
      settings: {
        masteryGateEnabled: setting.data ? !!setting.data.mastery_gate_enabled : true,
        defaultThreshold: setting.data ? Number(setting.data.default_threshold) : 80,
        dailyXpCap: setting.data ? Number(setting.data.daily_xp_cap) : 150,
        minSectionSeconds: setting.data ? Number(setting.data.min_section_seconds) : 90,
      },
      students: Array.from(students.values()).sort((a, b) => a.name.localeCompare(b.name)),
    };
  });

/** Teacher-only: class mastery gate settings. */
export const saveClassSettings = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: ClassSettingsRow) => ({
    masteryGateEnabled: !!input?.masteryGateEnabled,
    defaultThreshold: Math.min(100, Math.max(60, Number(input?.defaultThreshold) || 80)),
    dailyXpCap: Math.min(1000, Math.max(0, Number(input?.dailyXpCap) || 150)),
    minSectionSeconds: Math.min(900, Math.max(0, Number(input?.minSectionSeconds) || 90)),
  }))
  .handler(async ({ data, context }): Promise<ClassSettingsRow> => {
    await requireTeacher(context as any);
    const { error } = await context.supabase.from('class_setting').upsert(
      {
        id: 'default',
        mastery_gate_enabled: data.masteryGateEnabled,
        default_threshold: data.defaultThreshold,
        daily_xp_cap: data.dailyXpCap,
        min_section_seconds: data.minSectionSeconds,
        updated_by: context.userId,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' },
    );
    if (error) throw new Error(error.message);
    return data;
  });

/**
 * Teacher-only XP reset. Removes XP inside a scope, writes an audit row the
 * student can see, and never touches mastery scores or attempt history unless
 * a retake is explicitly required.
 */
export const resetStudentXp = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: { studentId: string; scope: 'all' | 'chapter' | 'module'; nodeId?: string; reason: string; requireRetake?: boolean }) => {
      const studentId = String(input?.studentId ?? '').trim();
      const scope = input?.scope === 'chapter' || input?.scope === 'module' ? input.scope : 'all';
      const nodeId = String(input?.nodeId ?? '').trim();
      const reason = String(input?.reason ?? '').trim();
      if (!studentId) throw new Error('Pick a student first.');
      if (scope !== 'all' && !nodeId) throw new Error('Pick the chapter or module to reset.');
      if (reason.length < 3) throw new Error('Add a short reason for this reset.');
      return { studentId, scope, nodeId, reason, requireRetake: !!input?.requireRetake };
    },
  )
  .handler(async ({ data, context }): Promise<{ xpRemoved: number; newTotal: number }> => {
    await requireTeacher(context as any);
    if (data.studentId === context.userId) throw new Error('You cannot reset your own XP here.');

    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');

    const { data: ledger, error: ledgerError } = await supabaseAdmin
      .from('xp_ledger')
      .select('node_id, xp_delta')
      .eq('student_id', data.studentId);
    if (ledgerError) throw new Error(ledgerError.message);

    const inScope = (nodeId: string) => {
      if (data.scope === 'all') return true;
      if (data.scope === 'chapter') return nodeId.startsWith(data.nodeId);
      return nodeId === data.nodeId || nodeId.startsWith(`${data.nodeId}-`) || nodeId.startsWith(`${data.nodeId}.`);
    };
    const scopedXp = (ledger ?? [])
      .filter((row: any) => inScope(String(row.node_id ?? '')))
      .reduce((sum: number, row: any) => sum + (Number(row.xp_delta) || 0), 0);

    const { data: profile } = await supabaseAdmin
      .from('student_profile')
      .select('xp')
      .eq('user_id', data.studentId)
      .maybeSingle();
    const currentXp = Number(profile?.xp) || 0;
    const xpRemoved = Math.max(0, Math.min(currentXp, data.scope === 'all' ? currentXp : scopedXp));
    const newTotal = Math.max(0, currentXp - xpRemoved);

    await supabaseAdmin
      .from('student_profile')
      .upsert({ user_id: data.studentId, xp: newTotal, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });

    await supabaseAdmin.from('xp_ledger').insert({
      student_id: data.studentId,
      node_id: data.scope === 'all' ? '' : data.nodeId,
      event_type: 'teacher_reset',
      xp_delta: -xpRemoved,
      blocked_reason: data.reason,
    });

    await supabaseAdmin.from('xp_admin_action').insert({
      student_id: data.studentId,
      teacher_id: context.userId,
      action: 'reset_xp',
      scope: data.scope,
      node_id: data.nodeId,
      xp_removed: xpRemoved,
      require_retake: data.requireRetake,
      reason: data.reason,
    });

    if (data.requireRetake && data.nodeId) {
      await supabaseAdmin.from('gate_override').upsert(
        {
          student_id: data.studentId,
          node_id: data.nodeId,
          state: 'retake_required',
          reason: data.reason,
          unlocked_by: context.userId,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'student_id,node_id' },
      );
    }

    return { xpRemoved, newTotal };
  });

/** Teacher-only: require a retake, unlock a gate, or clear an override. */
export const setGateState = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: { studentId: string; nodeId: string; state: 'teacher_unlocked' | 'retake_required' | 'clear'; reason?: string; thresholdOverride?: number | null }) => {
      const studentId = String(input?.studentId ?? '').trim();
      const nodeId = String(input?.nodeId ?? '').trim();
      const state = input?.state;
      if (!studentId || !nodeId) throw new Error('Pick a student and a chapter or module first.');
      if (state !== 'teacher_unlocked' && state !== 'retake_required' && state !== 'clear') {
        throw new Error('Unknown gate action.');
      }
      const raw = input?.thresholdOverride;
      const thresholdOverride =
        raw === null || raw === undefined || raw === ('' as never) ? null : Math.min(100, Math.max(50, Number(raw)));
      return { studentId, nodeId, state, reason: String(input?.reason ?? '').trim(), thresholdOverride };
    },
  )
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    await requireTeacher(context as any);
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');

    if (data.state === 'clear') {
      await supabaseAdmin.from('gate_override').delete().eq('student_id', data.studentId).eq('node_id', data.nodeId);
      return { ok: true };
    }

    const { error } = await supabaseAdmin.from('gate_override').upsert(
      {
        student_id: data.studentId,
        node_id: data.nodeId,
        state: data.state,
        threshold_override: data.thresholdOverride,
        reason: data.reason,
        unlocked_by: context.userId,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'student_id,node_id' },
    );
    if (error) throw new Error(error.message);

    await supabaseAdmin.from('xp_admin_action').insert({
      student_id: data.studentId,
      teacher_id: context.userId,
      action: data.state === 'teacher_unlocked' ? 'unlock_gate' : 'require_retake',
      scope: data.nodeId.includes('-m') ? 'module' : 'chapter',
      node_id: data.nodeId,
      reason: data.reason,
    });
    return { ok: true };
  });

/** Teacher-only: per-student mastery threshold accommodation. */
export const setStudentThreshold = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { studentId: string; threshold: number | null }) => {
    const studentId = String(input?.studentId ?? '').trim();
    if (!studentId) throw new Error('Pick a student first.');
    const threshold =
      input?.threshold === null || input?.threshold === undefined
        ? null
        : Math.min(100, Math.max(50, Number(input.threshold)));
    return { studentId, threshold };
  })
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    await requireTeacher(context as any);
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const { error } = await supabaseAdmin
      .from('student_profile')
      .upsert(
        { user_id: data.studentId, threshold_override: data.threshold, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' },
      );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Teacher-only: dismiss an engagement flag with a note. */
export const dismissFlag = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { flagId: string; note?: string }) => {
    const flagId = String(input?.flagId ?? '').trim();
    if (!flagId) throw new Error('Pick a flag first.');
    return { flagId, note: String(input?.note ?? '').trim() };
  })
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    await requireTeacher(context as any);
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const { error } = await supabaseAdmin
      .from('anomaly_flag')
      .update({ dismissed_by: context.userId, dismissed_at: new Date().toISOString(), dismiss_note: data.note })
      .eq('id', data.flagId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
