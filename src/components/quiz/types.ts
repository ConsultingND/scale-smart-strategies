export type AnswerValue = string | string[] | number | ContactInfoValue | null;

export type ContactInfoValue = {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  website: string;
  consent: boolean;
  honeypot: string;
};

export type Answers = Record<string, AnswerValue>;

export type Option = {
  value: string;
  label: string;
  description?: string;
  icon?: string;
};

type BaseQuestion = {
  id: string;
  label: string;
  helpText?: string;
  required?: boolean;
};

export type Question =
  | (BaseQuestion & { kind: 'short-text'; placeholder?: string; maxLength?: number })
  | (BaseQuestion & { kind: 'long-text'; placeholder?: string; rows?: number; maxLength?: number })
  | (BaseQuestion & { kind: 'single-card'; options: Option[] })
  | (BaseQuestion & { kind: 'multi-card'; options: Option[] })
  | (BaseQuestion & {
      kind: 'slider';
      min: number;
      max: number;
      step: number;
      formatValue?: (n: number) => string;
      quickPicks?: { label: string; value: number }[];
    })
  | (BaseQuestion & { kind: 'segmented'; options: Option[] })
  | (BaseQuestion & { kind: 'contact-info' });

export type Section = {
  id: string;
  title: string;
  subtitle?: string;
  questions: Question[];
  /**
   * Return true to skip this section based on prior answers. Used for branching
   * (e.g. skip "app shape" questions when the user says no software is needed).
   */
  skipIf?: (answers: Answers) => boolean;
};

export type QuizKey = 'beginner' | 'expert';

export type ScoreDimension = {
  id: string;
  label: string;
  /** 0..1 fraction of the dimension's max */
  score: number;
};

export type Recommendation = {
  /** Short headline shown in the results card */
  headline: string;
  /** 1–2 sentence explanation */
  body: string;
  /** Optional tag word like "Learning Platform" or "Backend Audit" */
  tag?: string;
};

export type Results = {
  summary: string;
  recommendation: Recommendation;
  dimensions: ScoreDimension[];
  /** Optional secondary recommendations (e.g. expert quiz ranks multiple services) */
  alternates?: Recommendation[];
};

export type ScoreFn = (answers: Answers) => Results;

export type QuizConfig = {
  key: QuizKey;
  /** Storage key suffix; bump when schema changes to invalidate stale local state */
  storageVersion: number;
  title: string;
  description: string;
  sections: Section[];
  /** Pure scoring function — keep dependency-free so it's trivially unit-testable */
  score: ScoreFn;
};

export type UTM = {
  source?: string;
  medium?: string;
  campaign?: string;
  term?: string;
  content?: string;
};

export type LeadPayload = {
  quiz: QuizKey;
  answers: Answers;
  results: Results;
  contact: ContactInfoValue;
  utm: UTM;
  submittedAt: string;
};
