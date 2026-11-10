import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

/** True when the signed-in user holds the teacher role. */
export function useIsTeacher(userId: string | null | undefined) {
  const [isTeacher, setIsTeacher] = useState(false);

  useEffect(() => {
    if (!userId) {
      setIsTeacher(false);
      return;
    }
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'teacher')
        .maybeSingle();
      if (!cancelled) setIsTeacher(Boolean(data));
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  return isTeacher;
}
