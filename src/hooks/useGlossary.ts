import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BUILT_IN_GLOSSARY, glossaryKey, sortGlossary, type GlossaryEntry } from '@/lib/glossary';

let custom: GlossaryEntry[] = [];
let loaded = false;
let inflight: Promise<void> | null = null;
const listeners = new Set<() => void>();

export function reloadGlossary(): Promise<void> {
  inflight = (async () => {
    const { data } = await supabase.from('glossary_term').select('id, term, definition, example, category');
    custom = (data ?? []).map((r) => ({
      id: `custom-${r.id}`,
      term: r.term,
      definition: r.definition,
      example: r.example || undefined,
      category: r.category,
      icon: '📖',
      seenIn: 'Added by Pietro',
      custom: { id: r.id },
    }));
    loaded = true;
    listeners.forEach((l) => l());
  })();
  return inflight;
}

/** Built-in terms plus teacher-added ones, de-duplicated and sorted A–Z. */
export function useGlossary() {
  const [version, bump] = useState(0);
  useEffect(() => {
    const l = () => bump((n) => n + 1);
    listeners.add(l);
    if (!loaded && !inflight) reloadGlossary();
    return () => { listeners.delete(l); };
  }, []);
  const terms = useMemo(() => {
    const keys = new Set(BUILT_IN_GLOSSARY.map((t) => glossaryKey(t.term)));
    const extra = custom.filter((t) => !keys.has(glossaryKey(t.term)));
    return sortGlossary([...BUILT_IN_GLOSSARY, ...extra]);
  }, [version]); // eslint-disable-line react-hooks/exhaustive-deps
  return { terms, reload: reloadGlossary };
}
