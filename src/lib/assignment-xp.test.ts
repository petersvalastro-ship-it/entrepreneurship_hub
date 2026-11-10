import { describe, expect, it } from 'vitest';
import { assignmentWorth, earnedXp, xpToAward } from './assignment-xp';

describe('assignment XP', () => {
  it('short assignments are worth less than long ones', () => expect(assignmentWorth(4)).toBeLessThan(assignmentWorth(20)));
  it('a 20-box assignment is worth 100 XP', () => expect(assignmentWorth(20)).toBe(100));
  it('multi-day lessons are worth more', () => expect(assignmentWorth(20, 5)).toBe(200));
  it('never below 20 XP', () => expect(assignmentWorth(1)).toBe(20));
  it('never above 200 XP', () => expect(assignmentWorth(100)).toBe(200));
  it('half the boxes filled earns half the XP', () => expect(earnedXp(100, 10, 20)).toBe(50));
  it('resubmitting the same work earns nothing more', () => expect(xpToAward(50, 50)).toBe(0));
  it('resubmitting with more answers earns only the difference', () => expect(xpToAward(80, 50)).toBe(30));
});
