import { describe, expect, it } from 'vitest';
import { BUILT_IN_GLOSSARY, glossaryKey, glossaryLetter, sortGlossary } from './glossary';

describe('glossary', () => {
  it('has no duplicate terms', () => {
    const keys = BUILT_IN_GLOSSARY.map((t) => glossaryKey(t.term));
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('treats plural and "(…)" variants as the same term', () => {
    expect(glossaryKey('Fixed Costs')).toBe(glossaryKey('fixed cost'));
    expect(glossaryKey('Profit (Net Profit)')).toBe(glossaryKey('Profit'));
  });

  it('is sorted A–Z', () => {
    expect(BUILT_IN_GLOSSARY.map((t) => t.term)).toEqual(sortGlossary(BUILT_IN_GLOSSARY).map((t) => t.term));
    const i = BUILT_IN_GLOSSARY.findIndex((t) => t.term === 'Assets');
    const j = BUILT_IN_GLOSSARY.findIndex((t) => t.term === 'Zebra');
    expect(i).toBeGreaterThanOrEqual(0);
    expect(j).toBe(-1);
  });

  it('files a new term into its alphabetical spot', () => {
    const sorted = sortGlossary([...BUILT_IN_GLOSSARY, { id: 'x', term: 'Kiosk', category: 'Entrepreneurship', definition: 'd' }]);
    const k = sorted.findIndex((t) => t.term === 'Kiosk');
    expect(sorted[k - 1]!.term.localeCompare('Kiosk')).toBeLessThan(0);
    expect(sorted[k + 1]!.term.localeCompare('Kiosk')).toBeGreaterThan(0);
  });

  it('includes terms from posted assignments and the Brain Smart Start', () => {
    const terms = BUILT_IN_GLOSSARY.map((t) => t.term);
    for (const t of ['Assumption', 'Evidence', 'Brain Smart Start', 'Root Cause', 'Hypothesis', 'Rebus', 'SCAMPER', 'Need', 'Want']) expect(terms).toContain(t);
    expect(glossaryLetter('4 Ps')).toBe('#');
  });
});
