import type { Answers, QuizKey } from './types';

const PREFIX = 'ndss.quiz';

const storageKey = (quiz: QuizKey, version: number) => `${PREFIX}.${quiz}.v${version}`;

type Persisted = {
  version: number;
  sectionIndex: number;
  answers: Answers;
};

const hasWindow = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

export function loadAnswers(quiz: QuizKey, version: number): Persisted | null {
  if (!hasWindow()) return null;
  try {
    const raw = window.localStorage.getItem(storageKey(quiz, version));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Persisted;
    if (parsed?.version !== version) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveAnswers(
  quiz: QuizKey,
  version: number,
  sectionIndex: number,
  answers: Answers,
): void {
  if (!hasWindow()) return;
  try {
    const payload: Persisted = { version, sectionIndex, answers };
    window.localStorage.setItem(storageKey(quiz, version), JSON.stringify(payload));
  } catch {
    // localStorage can throw in private mode / quota — fail silently
  }
}

export function clearAnswers(quiz: QuizKey, version: number): void {
  if (!hasWindow()) return;
  try {
    window.localStorage.removeItem(storageKey(quiz, version));
  } catch {
    // ignore
  }
}
