import type { Answers, QuizConfig, Recommendation, Results, ScoreDimension } from '@/components/quiz/types';
import { clamp01, getString, getStringArray, textSpecificity } from '@/components/quiz/scoring';
import { MECHANISM_RECOMMENDATIONS, NO_APP_RECOMMENDATION } from './recommendations';

const APP_NEEDED_ID = 'app_needed';

function describeScore(score: number): string {
  if (score >= 0.85) return 'very strong';
  if (score >= 0.6) return 'solid';
  if (score >= 0.35) return 'mid';
  return 'thin';
}

function scoreBeginner(answers: Answers): Results {
  const problemClarity = textSpecificity(answers['problem_statement']);
  const customerSpecificity = textSpecificity(answers['ideal_customer']);
  const businessValue = textSpecificity(answers['transformation']);

  const appNeeded = getString(answers, APP_NEEDED_ID);
  const appJustification = clamp01(
    (appNeeded === 'yes' ? 1 : appNeeded === 'maybe' ? 0.5 : 0) * 0.5 +
      textSpecificity(answers['app_advantage']) * 0.5,
  );

  const willingnessToPay = getString(answers, 'willingness_to_pay');
  const revenueModel = getString(answers, 'revenue_model');
  const marketSignal = clamp01(
    (willingnessToPay === 'paying' ? 1 : willingnessToPay === 'asked' ? 0.66 : willingnessToPay === 'interested' ? 0.33 : 0) * 0.6 +
      (revenueModel ? 0.4 : 0),
  );

  const dimensions: ScoreDimension[] = [
    { id: 'problem', label: 'Problem clarity', score: problemClarity },
    { id: 'customer', label: 'Customer specificity', score: customerSpecificity },
    { id: 'value', label: 'Business value', score: businessValue },
    { id: 'app', label: 'App justification', score: appJustification },
    { id: 'market', label: 'Market signal', score: marketSignal },
  ];

  const total = dimensions.reduce((acc, d) => acc + d.score, 0) / dimensions.length;
  const summary =
    total >= 0.7
      ? 'You\'re ready for an MVP conversation.'
      : total >= 0.4
        ? 'You\'re close — a couple of sharper answers and we can scope an MVP.'
        : 'Let\'s validate the idea before any code gets written.';

  // Mechanism is now multi-select (up to 3). The first selection drives the
  // primary recommendation; the rest become alternates.
  const mechanisms = getStringArray(answers, 'mechanism');
  const primaryMechanism = mechanisms[0] ?? '';

  const fallbackRec: Recommendation = {
    tag: 'Custom Web App',
    headline: 'You\'re building something custom.',
    body: 'Your mechanism doesn\'t map to a single template. That\'s fine — it just means scoping starts with a 30-minute conversation, not a pattern match.',
  };

  const recommendation =
    appNeeded === 'no'
      ? NO_APP_RECOMMENDATION
      : MECHANISM_RECOMMENDATIONS[primaryMechanism] ?? fallbackRec;

  const alternates =
    appNeeded === 'no'
      ? undefined
      : mechanisms
          .slice(1)
          .map((m) => MECHANISM_RECOMMENDATIONS[m])
          .filter((r): r is Recommendation => Boolean(r));

  const adminNotes: string[] = [
    `Total score: ${Math.round(total * 100)}/100 (${describeScore(total)}).`,
    `Problem clarity: ${describeScore(problemClarity)} — driven by ${(getString(answers, 'problem_statement') || '(empty)').trim().length} chars in problem_statement.`,
    `Customer specificity: ${describeScore(customerSpecificity)} — driven by ${(getString(answers, 'ideal_customer') || '(empty)').trim().length} chars in ideal_customer.`,
    `Business value: ${describeScore(businessValue)} — driven by ${(getString(answers, 'transformation') || '(empty)').trim().length} chars in transformation.`,
    `App justification: app_needed="${appNeeded || 'n/a'}", app_advantage length=${(getString(answers, 'app_advantage') || '').trim().length}.`,
    `Market signal: willingness="${willingnessToPay || 'n/a'}", revenue_model="${revenueModel || 'n/a'}".`,
    mechanisms.length
      ? `Selected mechanisms: ${mechanisms.join(', ')}. Primary recommendation derived from "${primaryMechanism}".`
      : 'No mechanism selected — falling back to "Custom Web App".',
    appNeeded === 'no'
      ? 'User flagged that no software is needed → routed to Consulting-Fit (no app) recommendation.'
      : '',
  ].filter(Boolean);

  return { summary, recommendation, dimensions, alternates: alternates?.length ? alternates : undefined, adminNotes };
}

const beginnerConfig: QuizConfig = {
  key: 'beginner',
  storageVersion: 2,
  title: 'Business → App Discovery',
  description: 'A 10-minute quiz that turns a fuzzy business idea into a clear app plan.',
  score: scoreBeginner,
  sections: [
    {
      id: 'starting-point',
      title: 'Where are you starting?',
      subtitle: 'Pick whichever feels closest. There\'s no wrong answer.',
      questions: [
        {
          id: 'starting_point',
          kind: 'single-card',
          label: 'What best describes you right now?',
          required: true,
          options: [
            { value: 'just-idea', label: 'I have an idea', description: 'Just a concept, not much else yet.' },
            { value: 'side-project', label: 'I have a side project', description: 'I\'ve started something but it isn\'t live.' },
            { value: 'live-business', label: 'I run a business', description: 'I have customers — and a question about what to build next.' },
            { value: 'exploring', label: 'I\'m exploring', description: 'I\'m not sure I need an app at all.' },
          ],
        },
      ],
    },
    {
      id: 'business-idea',
      title: 'The business idea',
      subtitle: 'Tell us what you\'re building, in plain language.',
      questions: [
        {
          id: 'idea_one_liner',
          kind: 'short-text',
          label: 'In one sentence, what are you building?',
          placeholder: 'A scheduling tool for solo personal trainers…',
          required: true,
          maxLength: 200,
        },
        {
          id: 'why_you_care',
          kind: 'long-text',
          label: 'Why does this matter to you personally?',
          placeholder: 'I burned out trying to coordinate this myself…',
          helpText: 'Founders who can\'t answer this usually can\'t finish the build either.',
          required: true,
          rows: 3,
        },
      ],
    },
    {
      id: 'problem',
      title: 'The problem',
      subtitle: 'Specificity here drives everything that follows.',
      questions: [
        {
          id: 'problem_statement',
          kind: 'long-text',
          label: 'What specific problem does this solve?',
          placeholder: 'Personal trainers waste 5–7 hours a week rescheduling clients over text…',
          helpText: 'Include who, what, and how often it happens.',
          required: true,
          rows: 4,
        },
        {
          id: 'current_alternatives',
          kind: 'short-text',
          label: 'What do people do today instead?',
          placeholder: 'Text threads, paper calendars, Calendly…',
          required: true,
        },
      ],
    },
    {
      id: 'customer',
      title: 'The customer',
      subtitle: 'Describe one real person, not a market segment.',
      questions: [
        {
          id: 'ideal_customer',
          kind: 'long-text',
          label: 'Describe your ideal customer.',
          placeholder: 'Age, role, daily habits, tech comfort level…',
          required: true,
          rows: 4,
        },
        {
          id: 'transformation',
          kind: 'long-text',
          label: 'If this works, what specifically changes for them?',
          placeholder: 'They save 4 hrs/week, stop missing sessions, raise rates 15%…',
          helpText: 'Name something measurable — time, money, decisions made, stress level.',
          required: true,
          rows: 4,
        },
      ],
    },
    {
      id: 'mechanism',
      title: 'How you help',
      subtitle: 'Pick up to three verbs that best describe what your product does. Your first pick drives the main recommendation.',
      questions: [
        {
          id: 'mechanism',
          kind: 'multi-card',
          label: 'My product mostly…',
          required: true,
          maxSelections: 3,
          helpText: 'Choose 1–3. Order matters: the first one you pick is treated as your primary mechanism.',
          options: [
            { value: 'teach', label: 'Teaches', description: 'Delivers structured learning or skill-building.' },
            { value: 'track', label: 'Tracks', description: 'Surfaces progress, metrics, or status over time.' },
            { value: 'connect', label: 'Connects', description: 'Pairs two groups of people who need each other.' },
            { value: 'organize', label: 'Organizes', description: 'Turns scattered information into structure.' },
            { value: 'automate', label: 'Automates', description: 'Does something for the user so they don\'t have to.' },
            { value: 'remind', label: 'Reminds', description: 'Triggers actions at the right moment.' },
          ],
        },
      ],
    },
    {
      id: 'app-need',
      title: 'Does this need an app?',
      subtitle: 'The strongest question in the quiz. Be honest.',
      questions: [
        {
          id: APP_NEEDED_ID,
          kind: 'segmented',
          label: 'Could this deliver value without software?',
          required: true,
          options: [
            { value: 'yes', label: 'No — software is essential' },
            { value: 'maybe', label: 'Maybe — could start manual' },
            { value: 'no', label: 'Yes — no software needed' },
          ],
          helpText: 'If you can deliver the value with a spreadsheet and email, that\'s probably your real MVP.',
        },
        {
          id: 'app_advantage',
          kind: 'long-text',
          label: 'What specific bottleneck does software remove?',
          placeholder: 'Manual coordination across 20+ clients/week becomes the constraint…',
          rows: 3,
          required: true,
        },
        {
          id: 'device_pref',
          kind: 'single-card',
          label: 'Where does your customer use it?',
          options: [
            { value: 'mobile', label: 'On their phone', description: 'Quick check-ins, on-the-go.' },
            { value: 'desktop', label: 'At a desk', description: 'Focused work, long sessions.' },
            { value: 'both', label: 'Both, equally', description: 'They expect parity across devices.' },
          ],
          required: true,
        },
      ],
    },
    {
      id: 'app-shape',
      title: 'Idea → App',
      subtitle: 'A rough shape — we\'ll refine this on a call.',
      skipIf: (a) => getString(a, APP_NEEDED_ID) === 'no',
      questions: [
        {
          id: 'app_does',
          kind: 'long-text',
          label: 'In one paragraph, what does the app do?',
          placeholder: 'When a client books, the app…',
          required: true,
          rows: 4,
        },
        {
          id: 'app_remembers',
          kind: 'short-text',
          label: 'What does the app need to remember between sessions?',
          placeholder: 'Client list, schedules, payment history…',
          required: true,
        },
        {
          id: 'usage_frequency',
          kind: 'segmented',
          label: 'How often will the average user open it?',
          required: true,
          options: [
            { value: 'daily', label: 'Daily' },
            { value: 'weekly', label: 'Weekly' },
            { value: 'monthly', label: 'Monthly' },
            { value: 'occasional', label: 'Occasionally' },
          ],
        },
      ],
    },
    {
      id: 'reality',
      title: 'Reality & signals',
      subtitle: 'And finally — how confident is the market?',
      questions: [
        {
          id: 'willingness_to_pay',
          kind: 'single-card',
          label: 'Has anyone told you they\'d pay for this?',
          required: true,
          options: [
            { value: 'paying', label: 'Yes — someone is already paying', description: 'You have revenue, even if it\'s small.' },
            { value: 'asked', label: 'Yes — they\'ve said so', description: 'Verbal commitments, no money yet.' },
            { value: 'interested', label: 'They\'re interested', description: 'Positive reactions, no pricing conversations.' },
            { value: 'unknown', label: 'I haven\'t asked yet', description: 'It\'s still mostly an internal hypothesis.' },
          ],
        },
        {
          id: 'revenue_model',
          kind: 'single-card',
          label: 'How will you charge?',
          required: true,
          options: [
            { value: 'subscription', label: 'Subscription', description: 'Recurring monthly or annual fee.' },
            { value: 'one-time', label: 'One-time purchase', description: 'A single fee to use it.' },
            { value: 'transactional', label: 'Per-transaction', description: 'You take a cut of activity inside the product.' },
            { value: 'free-then', label: 'Free now, paid later', description: 'You\'re building an audience first.' },
          ],
        },
      ],
    },
    {
      id: 'subscribe',
      title: 'Get your scorecard',
      subtitle: 'Where should we send your personalized results?',
      questions: [
        {
          id: 'contact',
          kind: 'contact-info',
          label: 'Subscribe to get your scorecard',
          required: true,
        },
      ],
    },
  ],
};

export default beginnerConfig;
