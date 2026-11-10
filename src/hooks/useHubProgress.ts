import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';


export type GoalMetric = 'xp' | 'terms' | 'scenarios' | 'sections' | 'custom';

export type StudentGoal = {
  id: string;
  title: string;
  metric: GoalMetric;
  target: number;
  done: boolean;
  createdAt: string;
};

export type HubState = {
  xp: number;
  masteredTerms: string[];
  completedScenarios: Record<string, unknown>;
  goals: StudentGoal[];
};

const LOCAL_KEY = 'hub-state-v1';

const EMPTY: HubState = { xp: 0, masteredTerms: [], completedScenarios: {}, goals: [] };

function readLocal(): HubState {
  if (typeof window === 'undefined') return EMPTY;
  try {
    const raw = JSON.parse(window.localStorage.getItem(LOCAL_KEY) || 'null');
    if (!raw || typeof raw !== 'object') return EMPTY;
    return {
      xp: Number(raw.xp) || 0,
      masteredTerms: Array.isArray(raw.masteredTerms) ? raw.masteredTerms : [],
      completedScenarios: raw.completedScenarios && typeof raw.completedScenarios === 'object' ? raw.completedScenarios : {},
      goals: Array.isArray(raw.goals) ? raw.goals : [],
    };
  } catch {
    return EMPTY;
  }
}

function writeLocal(state: HubState) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LOCAL_KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable */
  }
}

/**
 * Keeps XP, mastered glossary terms, solved scenarios and learning goals in
 * sync: always on the device, and in the student's account when signed in.
 */
export function useHubProgress(
  userId: string | null | undefined,
  identity?: { displayName?: string | null; email?: string | null },
) {
  const [state, setState] = useState<HubState>(EMPTY);
  const [hydrated, setHydrated] = useState(false);
  const [cloudSaving, setCloudSaving] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadedForUser = useRef<string | null>(null);

  useEffect(() => {
    setState(readLocal());
    setHydrated(true);
  }, []);

  // Merge cloud progress in when the student signs in.
  useEffect(() => {
    if (!userId || loadedForUser.current === userId) return;
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('student_profile')
        .select('xp, mastered_terms, completed_scenarios, goals')
        .eq('user_id', userId)
        .maybeSingle();
      if (cancelled || error) return;
      loadedForUser.current = userId;
      setState((local) => {
        if (!data) return local;
        const remoteTerms = Array.isArray(data.mastered_terms) ? (data.mastered_terms as string[]) : [];
        const remoteScenarios = (data.completed_scenarios || {}) as Record<string, unknown>;
        const remoteGoals = Array.isArray(data.goals) ? (data.goals as StudentGoal[]) : [];
        const merged: HubState = {
          xp: Math.max(local.xp, Number(data.xp) || 0),
          masteredTerms: Array.from(new Set([...local.masteredTerms, ...remoteTerms])),
          completedScenarios: { ...local.completedScenarios, ...remoteScenarios },
          goals: remoteGoals.length ? remoteGoals : local.goals,
        };
        writeLocal(merged);
        return merged;
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    if (!userId) loadedForUser.current = null;
  }, [userId]);

  // Persist locally immediately and to the account (debounced).
  useEffect(() => {
    if (!hydrated) return;
    writeLocal(state);
    if (!userId) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setCloudSaving(true);
      await supabase.from('student_profile').upsert(
        {
          user_id: userId,
          xp: state.xp,
          mastered_terms: state.masteredTerms,
          completed_scenarios: state.completedScenarios as unknown as Json,
          goals: state.goals as unknown as Json,
          ...(identity?.displayName ? { display_name: identity.displayName } : {}),
          ...(identity?.email ? { email: identity.email } : {}),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' },
      );
      setCloudSaving(false);
    }, 700);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [state, userId, hydrated]);

  const setXp = useCallback((value: number | ((prev: number) => number)) => {
    setState((prev) => ({ ...prev, xp: typeof value === 'function' ? value(prev.xp) : value }));
  }, []);

  const setMasteredTerms = useCallback((value: string[] | ((prev: string[]) => string[])) => {
    setState((prev) => ({ ...prev, masteredTerms: typeof value === 'function' ? value(prev.masteredTerms) : value }));
  }, []);

  const setCompletedScenarios = useCallback(
    (value: Record<string, unknown> | ((prev: Record<string, unknown>) => Record<string, unknown>)) => {
      setState((prev) => ({
        ...prev,
        completedScenarios: typeof value === 'function' ? value(prev.completedScenarios) : value,
      }));
    },
    [],
  );

  const setGoals = useCallback((value: StudentGoal[] | ((prev: StudentGoal[]) => StudentGoal[])) => {
    setState((prev) => ({ ...prev, goals: typeof value === 'function' ? value(prev.goals) : value }));
  }, []);

  return {
    xp: state.xp,
    masteredTerms: state.masteredTerms,
    completedScenarios: state.completedScenarios,
    goals: state.goals,
    setXp,
    setMasteredTerms,
    setCompletedScenarios,
    setGoals,
    cloudSaving,
  };
}
