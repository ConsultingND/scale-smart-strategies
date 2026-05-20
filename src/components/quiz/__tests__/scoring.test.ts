import { describe, it, expect } from 'vitest';
import { clamp01, getNumber, getString, getStringArray, isAnswered, textSpecificity } from '../scoring';
import beginner from '@/data/quiz/beginner';
import expert from '@/data/quiz/expert';
import { MECHANISM_RECOMMENDATIONS, NO_APP_RECOMMENDATION } from '@/data/quiz/recommendations';

describe('textSpecificity', () => {
  it('returns 0 for empty / non-string', () => {
    expect(textSpecificity(undefined)).toBe(0);
    expect(textSpecificity('')).toBe(0);
    expect(textSpecificity('   ')).toBe(0);
    expect(textSpecificity(null)).toBe(0);
    expect(textSpecificity(42)).toBe(0);
  });

  it('scores by length bucket', () => {
    expect(textSpecificity('short')).toBeCloseTo(0.33);
    expect(textSpecificity('a'.repeat(40))).toBeCloseTo(0.66);
    expect(textSpecificity('a'.repeat(120))).toBe(1);
  });
});

describe('isAnswered', () => {
  it('handles all value shapes', () => {
    expect(isAnswered(null)).toBe(false);
    expect(isAnswered(undefined)).toBe(false);
    expect(isAnswered('')).toBe(false);
    expect(isAnswered('  ')).toBe(false);
    expect(isAnswered('hi')).toBe(true);
    expect(isAnswered([])).toBe(false);
    expect(isAnswered(['a'])).toBe(true);
    expect(isAnswered(0)).toBe(true);
    expect(isAnswered(NaN)).toBe(false);
    expect(isAnswered({ firstName: 'a' } as never)).toBe(true);
  });
});

describe('getters', () => {
  it('coerces missing values safely', () => {
    expect(getString({}, 'k')).toBe('');
    expect(getStringArray({}, 'k')).toEqual([]);
    expect(getNumber({}, 'k', 5)).toBe(5);
    expect(getNumber({ k: 'x' }, 'k', 5)).toBe(5);
  });
});

describe('clamp01', () => {
  it('clamps and rejects non-finite', () => {
    expect(clamp01(-1)).toBe(0);
    expect(clamp01(2)).toBe(1);
    expect(clamp01(0.5)).toBe(0.5);
    expect(clamp01(NaN)).toBe(0);
    // Non-finite values are rejected to 0 (safer than clamping to 1)
    expect(clamp01(Infinity)).toBe(0);
  });
});

describe('beginner quiz score()', () => {
  it('returns NO_APP recommendation when app_needed === "no"', () => {
    const results = beginner.score({
      app_needed: 'no',
      mechanism: 'teach',
      problem_statement: 'a'.repeat(150),
    });
    expect(results.recommendation).toBe(NO_APP_RECOMMENDATION);
  });

  it('maps mechanism → recommendation', () => {
    const r = beginner.score({ app_needed: 'yes', mechanism: 'track' });
    expect(r.recommendation).toBe(MECHANISM_RECOMMENDATIONS.track);
  });

  it('falls back to a custom recommendation when mechanism is unknown', () => {
    const r = beginner.score({ app_needed: 'yes', mechanism: 'nonsense' });
    expect(r.recommendation.tag).toBe('Custom Web App');
  });

  it('produces 5 dimensions in [0,1]', () => {
    const r = beginner.score({});
    expect(r.dimensions).toHaveLength(5);
    for (const d of r.dimensions) {
      expect(d.score).toBeGreaterThanOrEqual(0);
      expect(d.score).toBeLessThanOrEqual(1);
    }
  });
});

describe('expert quiz score()', () => {
  it('prefers the directly selected service when signal is otherwise neutral', () => {
    const r = expert.score({
      service_fit: 'ai-strategy',
      vibe_coding: 'no',
      team_depth: 'senior',
      team_size: '5plus',
      stack_frontend: 'next',
      stack_backend: 'node',
      stack_hosting: 'vercel',
    });
    expect(r.recommendation.tag).toBe('AI Strategy & Integration');
  });

  it('ranks vibe-to-prod high when vibe_coding === "yes"', () => {
    const r = expert.score({
      service_fit: 'frontend',
      vibe_coding: 'yes',
      team_depth: 'junior',
      team_size: 'solo',
      stack_frontend: 'no-code',
      stack_backend: 'firebase',
    });
    // Vibe-to-prod should appear in top recommendation or alternates
    const all = [r.recommendation, ...(r.alternates ?? [])];
    expect(all.some((rec) => rec.tag === 'Vibe-Code → Production')).toBe(true);
  });

  it('produces 5 dimensions in [0,1] and an urgency-aware summary', () => {
    const r = expert.score({ urgency: 'this-week' });
    expect(r.dimensions).toHaveLength(5);
    expect(r.summary.toLowerCase()).toContain('this week');
  });
});
