import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const submitQuizLead = vi.fn().mockResolvedValue({ saved: true, emailed: true });
vi.mock('@/utils/quiz', () => ({
  submitQuizLead: (payload: unknown) => submitQuizLead(payload),
}));

import Quiz from '../Quiz';
import type { Answers, QuizConfig, Results, ScoreDimension } from '../types';

function makeResults(answers: Answers): Results {
  const dims: ScoreDimension[] = [
    { id: 'a', label: 'Alpha', score: 0.5 },
    { id: 'b', label: 'Bravo', score: 0.5 },
    { id: 'c', label: 'Charlie', score: 0.5 },
    { id: 'd', label: 'Delta', score: 0.5 },
    { id: 'e', label: 'Echo', score: typeof answers.idea === 'string' && answers.idea.length > 0 ? 1 : 0 },
  ];
  return {
    summary: 'Test summary',
    recommendation: { headline: 'Test rec', body: 'Body', tag: 'Test Tag' },
    dimensions: dims,
  };
}

const testConfig: QuizConfig = {
  key: 'beginner',
  storageVersion: 99,
  title: 'Test Quiz',
  description: 'test',
  score: makeResults,
  sections: [
    {
      id: 'idea',
      title: 'Idea',
      questions: [
        { id: 'idea', kind: 'short-text', label: 'What is it?', required: true },
      ],
    },
    {
      id: 'pick',
      title: 'Pick',
      questions: [
        {
          id: 'pick',
          kind: 'single-card',
          label: 'Pick one',
          required: true,
          options: [
            { value: 'a', label: 'Alpha' },
            { value: 'b', label: 'Bravo' },
          ],
        },
      ],
    },
    {
      id: 'contact',
      title: 'Contact',
      questions: [
        { id: 'contact', kind: 'contact-info', label: 'Send results', required: true },
      ],
    },
  ],
};

beforeEach(() => {
  window.localStorage.clear();
  submitQuizLead.mockClear();
});

describe('Quiz controller', () => {
  it('renders the first section after hydration', async () => {
    render(<Quiz config={testConfig} />);
    expect(await screen.findByRole('heading', { level: 2, name: 'Idea' })).toBeInTheDocument();
    expect(screen.getByText(/Step 1 of 3/i)).toBeInTheDocument();
  });

  it('blocks Next when required field empty, advances when filled', async () => {
    const user = userEvent.setup();
    render(<Quiz config={testConfig} />);
    const nextBtn = await screen.findByRole('button', { name: /next/i });
    expect(nextBtn).toBeDisabled();

    await user.type(screen.getByLabelText(/what is it\?/i), 'a cool idea');
    expect(nextBtn).not.toBeDisabled();
    await user.click(nextBtn);

    expect(await screen.findByRole('heading', { level: 2, name: 'Pick' })).toBeInTheDocument();
    expect(screen.getByText(/Step 2 of 3/i)).toBeInTheDocument();
  });

  it('persists progress to localStorage', async () => {
    const user = userEvent.setup();
    render(<Quiz config={testConfig} />);
    await user.type(await screen.findByLabelText(/what is it\?/i), 'persist me');
    const raw = window.localStorage.getItem('ndss.quiz.beginner.v99');
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);
    expect(parsed.answers.idea).toBe('persist me');
  });

  it('completes the quiz, shows ResultsPanel, and calls submitQuizLead with valid contact', async () => {
    const user = userEvent.setup();
    render(<Quiz config={testConfig} />);

    await user.type(await screen.findByLabelText(/what is it\?/i), 'the idea');
    await user.click(screen.getByRole('button', { name: /next/i }));

    // Section 2 — card select
    await user.click(screen.getByRole('radio', { name: /alpha/i }));
    await user.click(screen.getByRole('button', { name: /next/i }));

    // Section 3 — subscribe-to-see-results gate (first/last/email + consent)
    await user.type(screen.getByLabelText(/first name/i), 'Ada');
    await user.type(screen.getByLabelText(/last name/i), 'Lovelace');
    await user.type(screen.getByLabelText(/^email/i), 'ada@example.com');
    await user.click(screen.getByRole('checkbox', { name: /agree/i }));

    await user.click(screen.getByRole('button', { name: /see my results/i }));

    expect(await screen.findByText('Test rec')).toBeInTheDocument();
    expect(submitQuizLead).toHaveBeenCalledTimes(1);
    const payload = submitQuizLead.mock.calls[0][0];
    expect(payload.quiz).toBe('beginner');
    expect(payload.contact.email).toBe('ada@example.com');
    expect(payload.contact.consent).toBe(true);
    expect(payload.results.recommendation.headline).toBe('Test rec');
  });
});
