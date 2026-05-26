import type { Answers, AnswerValue } from './types';

/**
 * Map free-text length to a 0..1 specificity score. Thresholds chosen so a
 * one-sentence answer scores ~mid and a paragraph scores near max.
 */
export function textSpecificity(text: AnswerValue | undefined): number {
  if (typeof text !== 'string') return 0;
  const len = text.trim().length;
  if (len === 0) return 0;
  if (len < 20) return 0.33;
  if (len < 80) return 0.66;
  return 1;
}

export function isAnswered(value: AnswerValue | undefined): boolean {
  if (value == null) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'number') return Number.isFinite(value);
  if (typeof value === 'object') return true;
  return false;
}

export function getString(answers: Answers, id: string): string {
  const v = answers[id];
  return typeof v === 'string' ? v : '';
}

export function getStringArray(answers: Answers, id: string): string[] {
  const v = answers[id];
  return Array.isArray(v) ? v : [];
}

export function getNumber(answers: Answers, id: string, fallback = 0): number {
  const v = answers[id];
  return typeof v === 'number' && Number.isFinite(v) ? v : fallback;
}

/** Clamp 0..1 inclusive */
export function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(1, n));
}
