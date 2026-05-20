import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import QuestionRenderer from './QuestionRenderer';
import QuizProgress from './QuizProgress';
import ResultsPanel from './ResultsPanel';
import { trackEvent } from './analytics';
import { clearAnswers, loadAnswers, saveAnswers } from './persistence';
import { isAnswered } from './scoring';
import { readUTM } from './utm';
import { emptyContact } from './inputs/contactDefaults';
import { submitQuizLead } from '@/utils/quiz';
import type {
  Answers,
  AnswerValue,
  ContactInfoValue,
  QuizConfig,
  Question,
  Results,
  Section,
  UTM,
} from './types';

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

type Props = {
  config: QuizConfig;
};

function isQuestionAnswered(q: Question, value: AnswerValue | undefined): boolean {
  if (q.kind === 'contact-info') {
    const c = value as ContactInfoValue | undefined;
    return Boolean(
      c &&
        c.firstName.trim() &&
        c.lastName.trim() &&
        c.email.trim() &&
        c.company.trim() &&
        c.consent &&
        !c.honeypot,
    );
  }
  return isAnswered(value);
}

function sectionIsComplete(section: Section, answers: Answers): boolean {
  return section.questions.every((q) => !q.required || isQuestionAnswered(q, answers[q.id]));
}

function visibleSectionIndexes(sections: Section[], answers: Answers): number[] {
  const result: number[] = [];
  sections.forEach((section, idx) => {
    if (!section.skipIf || !section.skipIf(answers)) {
      result.push(idx);
    }
  });
  return result;
}

export default function Quiz({ config }: Props) {
  const [answers, setAnswers] = useState<Answers>({});
  const [rawSectionIndex, setRawSectionIndex] = useState<number>(0);
  const [hydrated, setHydrated] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<Results | null>(null);
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [submitError, setSubmitError] = useState<string | undefined>();
  const [utm, setUtm] = useState<UTM>({});
  const startTrackedRef = useRef(false);
  const topRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const persisted = loadAnswers(config.key, config.storageVersion);
    if (persisted) {
      setAnswers(persisted.answers);
      setRawSectionIndex(persisted.sectionIndex);
    }
    setUtm(readUTM());
    setHydrated(true);
  }, [config.key, config.storageVersion]);

  useEffect(() => {
    if (!hydrated) return;
    saveAnswers(config.key, config.storageVersion, rawSectionIndex, answers);
  }, [answers, rawSectionIndex, hydrated, config.key, config.storageVersion]);

  useEffect(() => {
    if (!hydrated || startTrackedRef.current) return;
    startTrackedRef.current = true;
    trackEvent('quiz_started', { quiz: config.key });
  }, [hydrated, config.key]);

  const visible = useMemo(
    () => visibleSectionIndexes(config.sections, answers),
    [config.sections, answers],
  );

  const currentRawIndex = useMemo(() => {
    if (visible.includes(rawSectionIndex)) return rawSectionIndex;
    return visible[0] ?? 0;
  }, [rawSectionIndex, visible]);

  const currentVisibleIndex = visible.indexOf(currentRawIndex);
  const currentSection = config.sections[currentRawIndex];
  const isLastSection = currentVisibleIndex === visible.length - 1;

  const setAnswer = useCallback((id: string, value: AnswerValue) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }, []);

  const goNext = useCallback(() => {
    if (!currentSection) return;
    if (!sectionIsComplete(currentSection, answers)) return;

    trackEvent('quiz_section_completed', {
      quiz: config.key,
      section: currentSection.id,
      step: currentVisibleIndex + 1,
    });

    if (isLastSection) {
      const computed = config.score(answers);
      setResults(computed);
      setShowResults(true);
      trackEvent('quiz_completed', { quiz: config.key });
      topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    const nextVisible = visible[currentVisibleIndex + 1];
    setRawSectionIndex(nextVisible);
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [answers, config, currentSection, currentVisibleIndex, isLastSection, visible]);

  const goBack = useCallback(() => {
    if (showResults) {
      setShowResults(false);
      topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    if (currentVisibleIndex <= 0) return;
    const prev = visible[currentVisibleIndex - 1];
    setRawSectionIndex(prev);
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [currentVisibleIndex, showResults, visible]);

  const contactValue = useMemo<ContactInfoValue>(() => {
    const c = answers['contact'];
    if (c && typeof c === 'object' && !Array.isArray(c)) return c as ContactInfoValue;
    return emptyContact;
  }, [answers]);

  const sendLead = useCallback(async () => {
    if (!results) return;
    if (!contactValue.consent || contactValue.honeypot) {
      setSubmitState('error');
      setSubmitError('Please accept the consent checkbox to send your results.');
      return;
    }
    setSubmitState('submitting');
    setSubmitError(undefined);
    try {
      await submitQuizLead({
        quiz: config.key,
        answers,
        results,
        contact: contactValue,
        utm,
        submittedAt: new Date().toISOString(),
      });
      setSubmitState('success');
      trackEvent('quiz_email_captured', { quiz: config.key });
      clearAnswers(config.key, config.storageVersion);
    } catch (err) {
      setSubmitState('error');
      setSubmitError(err instanceof Error ? err.message : 'Submission failed');
    }
  }, [answers, config.key, config.storageVersion, contactValue, results, utm]);

  useEffect(() => {
    if (
      showResults &&
      results &&
      submitState === 'idle' &&
      contactValue.consent &&
      !contactValue.honeypot &&
      contactValue.email
    ) {
      void sendLead();
    }
  }, [showResults, results, submitState, contactValue, sendLead]);

  const restart = useCallback(() => {
    clearAnswers(config.key, config.storageVersion);
    setAnswers({});
    setRawSectionIndex(0);
    setResults(null);
    setShowResults(false);
    setSubmitState('idle');
    setSubmitError(undefined);
    startTrackedRef.current = false;
  }, [config.key, config.storageVersion]);

  if (!hydrated || !currentSection) {
    return (
      <div
        ref={topRef}
        aria-busy="true"
        className="min-h-[400px] flex items-center justify-center text-muted-foreground"
      >
        Loading…
      </div>
    );
  }

  if (showResults && results) {
    return (
      <div ref={topRef} className="max-w-3xl mx-auto">
        <Card>
          <CardContent className="pt-6">
            <ResultsPanel
              quiz={config.key}
              results={results}
              contact={contactValue}
              submitState={submitState}
              errorMessage={submitError}
            />
            <div className="mt-8 flex flex-wrap gap-3 justify-between items-center border-t pt-6">
              <button type="button" onClick={goBack} className="text-sm font-medium hover:underline">
                ← Edit my answers
              </button>
              <button
                type="button"
                onClick={restart}
                className="text-sm text-muted-foreground hover:underline"
              >
                Start over
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const canAdvance = sectionIsComplete(currentSection, answers);
  const totalVisible = visible.length;

  return (
    <div ref={topRef} className="max-w-3xl mx-auto">
      <Card>
        <CardContent className="pt-6">
          <QuizProgress current={currentVisibleIndex} total={totalVisible} title={currentSection.title} />

          <div>
            <h2 className="text-2xl font-display font-bold mb-2">{currentSection.title}</h2>
            {currentSection.subtitle ? (
              <p className="text-muted-foreground mb-6">{currentSection.subtitle}</p>
            ) : null}

            <div className="space-y-6">
              {currentSection.questions.map((q, qIdx) => (
                <QuestionRenderer
                  key={q.id}
                  question={q}
                  answers={answers}
                  onChange={setAnswer}
                  autoFocus={qIdx === 0}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between mt-8 pt-6 border-t">
            <Button
              type="button"
              variant="ghost"
              onClick={goBack}
              disabled={currentVisibleIndex === 0}
            >
              ← Back
            </Button>
            <Button onClick={goNext} disabled={!canAdvance}>
              {isLastSection ? 'See my results' : 'Next →'}
            </Button>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Not ready?{' '}
            <a
              href="mailto:solutions@ndscalesmart.com"
              className="font-medium underline-offset-4 hover:underline"
            >
              Email us directly
            </a>
            .
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
