import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';

export type StudentRow = {
  userId: string;
  name: string;
  email: string;
  xp: number;
  masteredCount: number;
  scenariosCount: number;
  sectionsDone: number;
  completedSections: string[];
  updatedAt: string | null;
  notes: { sectionId: string; note: string }[];
};

export type GradeOverride = { studentId: string; itemKey: string; score: number };

/**
 * Teacher-only class roster: XP, completed sections and section notes for every
 * signed-in student. The caller must hold the 'teacher' role.
 */
export const getClassProgress = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<StudentRow[]> => {
    const { data: roles, error: rolesError } = await context.supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', context.userId)
      .eq('role', 'teacher');
    if (rolesError) throw new Error(rolesError.message);
    if (!roles || roles.length === 0) {
      throw new Error('This dashboard is available to teachers only.');
    }

    const [{ data: profiles, error: profileError }, { data: progress, error: progressError }] =
      await Promise.all([
        context.supabase
          .from('student_profile')
          .select('user_id, display_name, email, xp, mastered_terms, completed_scenarios, updated_at'),
        context.supabase
          .from('launchpad_progress')
          .select('user_id, section_id, completed, notes'),
      ]);
    if (profileError) throw new Error(profileError.message);
    if (progressError) throw new Error(progressError.message);

    const byUser = new Map<string, StudentRow>();
    const ensure = (userId: string): StudentRow => {
      let row = byUser.get(userId);
      if (!row) {
        row = {
          userId,
          name: 'Student',
          email: '',
          xp: 0,
          masteredCount: 0,
          scenariosCount: 0,
          sectionsDone: 0,
          completedSections: [],
          updatedAt: null,
          notes: [],
        };
        byUser.set(userId, row);
      }
      return row;
    };

    for (const profile of profiles ?? []) {
      const row = ensure(profile.user_id as string);
      row.name = (profile.display_name as string) || 'Student';
      row.email = (profile.email as string) || '';
      row.xp = Number(profile.xp) || 0;
      row.masteredCount = Array.isArray(profile.mastered_terms) ? profile.mastered_terms.length : 0;
      row.scenariosCount =
        profile.completed_scenarios && typeof profile.completed_scenarios === 'object'
          ? Object.keys(profile.completed_scenarios as Record<string, unknown>).length
          : 0;
      row.updatedAt = (profile.updated_at as string) ?? null;
    }

    for (const entry of progress ?? []) {
      const row = ensure(entry.user_id as string);
      if (entry.completed) {
        row.sectionsDone += 1;
        row.completedSections.push(entry.section_id as string);
      }
      const note = ((entry.notes as string) || '').trim();
      if (note) row.notes.push({ sectionId: entry.section_id as string, note });
    }

    // The teacher is not a student: never list their own activity in the roster.
    byUser.delete(context.userId);
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const { data: teachers } = await supabaseAdmin.from('user_roles').select('user_id').eq('role', 'teacher');
    for (const t of teachers ?? []) byUser.delete(t.user_id as string);

    return Array.from(byUser.values()).sort((a, b) => a.name.localeCompare(b.name));
  });

/**
 * Teacher-only password reset: sets a new password for one student account so a
 * student who forgot theirs can get back in. Verified against the caller's
 * 'teacher' role before any privileged call.
 */
export const resetStudentPassword = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { userId: string; newPassword: string }) => {
    const userId = String(input?.userId ?? '').trim();
    const newPassword = String(input?.newPassword ?? '');
    if (!userId) throw new Error('Pick a student first.');
    if (newPassword.length < 6) throw new Error('The new password must be at least 6 characters.');
    return { userId, newPassword };
  })
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    const { data: roles, error: rolesError } = await context.supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', context.userId)
      .eq('role', 'teacher');
    if (rolesError) throw new Error(rolesError.message);
    if (!roles || roles.length === 0) {
      throw new Error('Resetting passwords is available to teachers only.');
    }
    if (data.userId === context.userId) {
      throw new Error('Use your own Google account settings to change your own password.');
    }

    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const { error } = await supabaseAdmin.auth.admin.updateUserById(data.userId, {
      password: data.newPassword,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const requireTeacher = async (context: { supabase: any; userId: string }) => {
  const { data: roles, error } = await context.supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', context.userId)
    .eq('role', 'teacher');
  if (error) throw new Error(error.message);
  if (!roles || roles.length === 0) throw new Error('The gradebook is available to teachers only.');
};

/** Teacher-only: every manual grade override the teacher has saved. */
export const getGradeOverrides = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<GradeOverride[]> => {
    await requireTeacher(context as any);
    const { data, error } = await context.supabase
      .from('grade_override')
      .select('student_id, item_key, score');
    if (error) throw new Error(error.message);
    return (data ?? []).map((row: any) => ({
      studentId: row.student_id as string,
      itemKey: row.item_key as string,
      score: Number(row.score),
    }));
  });

/** Teacher-only: save one manual grade override (0-100). */
export const saveGradeOverride = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { studentId: string; itemKey: string; score: number }) => {
    const studentId = String(input?.studentId ?? '').trim();
    const itemKey = String(input?.itemKey ?? '').trim();
    const score = Number(input?.score);
    if (!studentId || !itemKey) throw new Error('Pick a student and a grade first.');
    if (!Number.isFinite(score) || score < 0 || score > 100) {
      throw new Error('Enter a grade between 0 and 100.');
    }
    return { studentId, itemKey, score };
  })
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    await requireTeacher(context as any);
    const { error } = await context.supabase.from('grade_override').upsert(
      {
        student_id: data.studentId,
        item_key: data.itemKey,
        score: data.score,
        updated_by: context.userId,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'student_id,item_key' },
    );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Teacher-only: remove a manual override so the grade goes back to automatic. */
export const clearGradeOverride = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { studentId: string; itemKey: string }) => ({
    studentId: String(input?.studentId ?? '').trim(),
    itemKey: String(input?.itemKey ?? '').trim(),
  }))
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    await requireTeacher(context as any);
    const { error } = await context.supabase
      .from('grade_override')
      .delete()
      .eq('student_id', data.studentId)
      .eq('item_key', data.itemKey);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/**
 * Teacher-only: permanently remove a student from the roster. Deletes their
 * saved progress, grades and account. Cannot be used on the teacher's own id.
 */
export const deleteStudent = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { userId: string }) => {
    const userId = String(input?.userId ?? '').trim();
    if (!userId) throw new Error('Pick a student first.');
    return { userId };
  })
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    await requireTeacher(context as any);
    if (data.userId === context.userId) {
      throw new Error('You cannot remove your own teacher account.');
    }

    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const { data: isTeacher } = await supabaseAdmin.from('user_roles').select('id').eq('user_id', data.userId).eq('role', 'teacher').maybeSingle();
    if (isTeacher) throw new Error('That account is a teacher and cannot be removed here.');
    for (const table of ['grade_override', 'assignment_submission', 'xp_ledger', 'engagement_session', 'assessment_attempt', 'anomaly_flag', 'gate_override', 'xp_admin_action'] as const) {
      await supabaseAdmin.from(table).delete().eq('student_id', data.userId);
    }
    await supabaseAdmin.from('user_roles').delete().eq('user_id', data.userId);
    await supabaseAdmin.from('launchpad_progress').delete().eq('user_id', data.userId);
    await supabaseAdmin.from('student_profile').delete().eq('user_id', data.userId);
    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Teacher-only: correct a student's display name on the roster. */
export const renameStudent = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { userId: string; name: string }) => {
    const userId = String(input?.userId ?? '').trim();
    const name = String(input?.name ?? '').trim().replace(/\s+/g, ' ');
    if (!userId) throw new Error('Pick a student first.');
    if (name.length < 2) throw new Error('Enter a name with at least 2 characters.');
    if (name.length > 60) throw new Error('Keep the name under 60 characters.');
    return { userId, name };
  })
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    await requireTeacher(context as any);
    if (data.userId === context.userId) {
      throw new Error('You cannot rename your own teacher account here.');
    }

    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const { error } = await supabaseAdmin
      .from('student_profile')
      .update({ display_name: data.name, updated_at: new Date().toISOString() })
      .eq('user_id', data.userId);
    if (error) throw new Error(error.message);
    await supabaseAdmin.auth.admin.updateUserById(data.userId, {
      user_metadata: { display_name: data.name },
    });
    return { ok: true };
  });
