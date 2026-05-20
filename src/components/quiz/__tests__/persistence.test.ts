import { describe, it, expect, beforeEach } from 'vitest';
import { clearAnswers, loadAnswers, saveAnswers } from '../persistence';

describe('persistence', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('round-trips answers + sectionIndex for the matching version', () => {
    saveAnswers('beginner', 1, 3, { foo: 'bar', list: ['a', 'b'] });
    const got = loadAnswers('beginner', 1);
    expect(got?.sectionIndex).toBe(3);
    expect(got?.answers.foo).toBe('bar');
    expect(got?.answers.list).toEqual(['a', 'b']);
  });

  it('returns null on version mismatch', () => {
    saveAnswers('beginner', 1, 0, { foo: 'bar' });
    expect(loadAnswers('beginner', 2)).toBeNull();
  });

  it('returns null on JSON corruption', () => {
    window.localStorage.setItem('ndss.quiz.beginner.v1', '{not json');
    expect(loadAnswers('beginner', 1)).toBeNull();
  });

  it('returns null when nothing saved', () => {
    expect(loadAnswers('expert', 1)).toBeNull();
  });

  it('clearAnswers removes the key', () => {
    saveAnswers('beginner', 1, 0, { foo: 'bar' });
    clearAnswers('beginner', 1);
    expect(loadAnswers('beginner', 1)).toBeNull();
  });
});
