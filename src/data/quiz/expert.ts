import type { Answers, QuizConfig, Results, ScoreDimension } from '@/components/quiz/types';
import { clamp01, getString, getStringArray, textSpecificity } from '@/components/quiz/scoring';
import { SERVICE_RECOMMENDATIONS, type ServiceKey } from './recommendations';

const NO_CODE_FRONTENDS = ['webflow', 'no-code'];
const NO_CODE_BACKENDS = ['no-code', 'firebase', 'airtable'];

function frontendHealth(answers: Answers): number {
  const fe = getString(answers, 'stack_frontend');
  if (!fe) return 0.4;
  if (['react', 'next', 'vue'].includes(fe)) return 0.9;
  if (NO_CODE_FRONTENDS.includes(fe)) return 0.25;
  return 0.55;
}

function backendHealth(answers: Answers): number {
  const be = getString(answers, 'stack_backend');
  const ceilingText = getString(answers, 'ceiling_text');
  const base =
    !be
      ? 0.4
      : ['node', 'python', 'rails'].includes(be)
        ? 0.8
        : NO_CODE_BACKENDS.includes(be)
          ? 0.3
          : 0.6;
  // Long, specific ceiling descriptions pull the score down (more pain → less health)
  const pain = textSpecificity(ceilingText);
  return clamp01(base - pain * 0.3);
}

function aiReadiness(answers: Answers): number {
  const tools = getStringArray(answers, 'ai_tools');
  const vibe = getString(answers, 'vibe_coding');
  const base = clamp01(tools.length * 0.25);
  // "yes" to vibe coding lowers readiness for production AI; "kind-of" is neutral
  const adj = vibe === 'yes' ? -0.2 : vibe === 'no' ? 0.1 : 0;
  return clamp01(base + adj);
}

function teamCapacity(answers: Answers): number {
  const depth = getString(answers, 'team_depth');
  const size = getString(answers, 'team_size');
  const depthScore =
    depth === 'senior' ? 1 : depth === 'mid' ? 0.7 : depth === 'mixed' ? 0.6 : depth === 'junior' ? 0.4 : 0.2;
  const sizeScore = size === '5plus' ? 1 : size === '2-4' ? 0.66 : size === 'solo' ? 0.4 : 0.2;
  return clamp01(depthScore * 0.7 + sizeScore * 0.3);
}

function architectureMaturity(answers: Answers): number {
  const hosting = getString(answers, 'stack_hosting');
  const fe = getString(answers, 'stack_frontend');
  const be = getString(answers, 'stack_backend');
  const vibe = getString(answers, 'vibe_coding');
  let score = 0.5;
  if (['aws', 'gcp', 'vercel'].includes(hosting)) score += 0.2;
  if (NO_CODE_FRONTENDS.includes(fe)) score -= 0.15;
  if (NO_CODE_BACKENDS.includes(be)) score -= 0.15;
  if (vibe === 'yes') score -= 0.2;
  if (vibe === 'no') score += 0.1;
  return clamp01(score);
}

function rankServices(answers: Answers, dims: Record<string, number>): ServiceKey[] {
  const direct = getString(answers, 'service_fit') as ServiceKey | '';
  const scores: Record<ServiceKey, number> = {
    frontend: 1 - dims.frontend,
    backend: 1 - dims.backend,
    'ai-strategy': 1 - dims.ai,
    'vibe-to-prod': getString(answers, 'vibe_coding') === 'yes' ? 1 : getString(answers, 'vibe_coding') === 'kind-of' ? 0.6 : 0,
    'full-review': dims.architecture < 0.4 ? 0.9 : 0.5,
    'fractional-cto': dims.team < 0.4 ? 0.8 : 0.3,
  };
  if (direct && scores[direct] !== undefined) {
    scores[direct] = Math.min(1, scores[direct] + 0.35);
  }
  return (Object.keys(scores) as ServiceKey[]).sort((a, b) => scores[b] - scores[a]);
}

function scoreExpert(answers: Answers): Results {
  const dims = {
    frontend: frontendHealth(answers),
    backend: backendHealth(answers),
    ai: aiReadiness(answers),
    team: teamCapacity(answers),
    architecture: architectureMaturity(answers),
  };

  const dimensions: ScoreDimension[] = [
    { id: 'frontend', label: 'Frontend health', score: dims.frontend },
    { id: 'backend', label: 'Backend health', score: dims.backend },
    { id: 'ai', label: 'AI readiness', score: dims.ai },
    { id: 'team', label: 'Team capacity', score: dims.team },
    { id: 'architecture', label: 'Architecture maturity', score: dims.architecture },
  ];

  const ranked = rankServices(answers, dims);
  const top = ranked[0];
  const alternates = ranked.slice(1, 3).map((k) => SERVICE_RECOMMENDATIONS[k]);

  const urgency = getString(answers, 'urgency');
  const summary =
    urgency === 'this-week'
      ? 'You need someone in the room this week.'
      : urgency === 'this-month'
        ? 'You\'re ready to move this month.'
        : urgency === 'next-quarter'
          ? 'You\'re scoping for next quarter.'
          : 'You\'re exploring — no rush.';

  return {
    summary,
    recommendation: SERVICE_RECOMMENDATIONS[top],
    dimensions,
    alternates,
  };
}

const expertConfig: QuizConfig = {
  key: 'expert',
  storageVersion: 1,
  title: 'Technical Audit & Consulting Fit',
  description: 'Diagnose where your tech is holding you back and what kind of help fits.',
  score: scoreExpert,
  sections: [
    {
      id: 'stage',
      title: 'Where are you now?',
      questions: [
        {
          id: 'product_stage',
          kind: 'single-card',
          label: 'What stage is your product?',
          required: true,
          options: [
            { value: 'pre-launch', label: 'Pre-launch' },
            { value: 'mvp', label: 'MVP live' },
            { value: 'post-pmf', label: 'Post-PMF' },
            { value: 'scaling', label: 'Scaling' },
            { value: 'enterprise', label: 'Enterprise' },
          ],
        },
        {
          id: 'mau',
          kind: 'segmented',
          label: 'Monthly active users',
          required: true,
          options: [
            { value: '<100', label: '< 100' },
            { value: '100-1k', label: '100–1k' },
            { value: '1k-10k', label: '1k–10k' },
            { value: '10k-100k', label: '10k–100k' },
            { value: '100k+', label: '100k+' },
          ],
        },
        {
          id: 'team_size',
          kind: 'segmented',
          label: 'Team size',
          required: true,
          options: [
            { value: 'solo', label: 'Solo' },
            { value: '2-4', label: '2–4' },
            { value: '5plus', label: '5+' },
          ],
        },
      ],
    },
    {
      id: 'stack',
      title: 'Your current stack',
      subtitle: 'A rough read is enough. We\'ll dig in on the call.',
      questions: [
        {
          id: 'stack_frontend',
          kind: 'single-card',
          label: 'Frontend',
          required: true,
          options: [
            { value: 'react', label: 'React' },
            { value: 'next', label: 'Next.js' },
            { value: 'vue', label: 'Vue' },
            { value: 'webflow', label: 'Webflow' },
            { value: 'no-code', label: 'No-code / other' },
            { value: 'other', label: 'Something else' },
          ],
        },
        {
          id: 'stack_backend',
          kind: 'single-card',
          label: 'Backend',
          required: true,
          options: [
            { value: 'node', label: 'Node / TypeScript' },
            { value: 'python', label: 'Python (Django/FastAPI)' },
            { value: 'rails', label: 'Rails' },
            { value: 'firebase', label: 'Firebase' },
            { value: 'airtable', label: 'Airtable / no-code' },
            { value: 'other', label: 'Something else' },
          ],
        },
        {
          id: 'stack_hosting',
          kind: 'single-card',
          label: 'Hosting',
          required: true,
          options: [
            { value: 'vercel', label: 'Vercel' },
            { value: 'aws', label: 'AWS' },
            { value: 'gcp', label: 'GCP' },
            { value: 'digitalocean', label: 'DigitalOcean' },
            { value: 'shared', label: 'Shared hosting' },
            { value: 'other', label: 'Other' },
          ],
        },
        {
          id: 'ai_tools',
          kind: 'multi-card',
          label: 'Which AI tools are in your stack today?',
          options: [
            { value: 'openai', label: 'OpenAI API' },
            { value: 'anthropic', label: 'Anthropic API' },
            { value: 'cursor', label: 'Cursor' },
            { value: 'copilot', label: 'Copilot' },
            { value: 'claude-code', label: 'Claude Code' },
            { value: 'none', label: 'None yet' },
          ],
        },
      ],
    },
    {
      id: 'ceiling',
      title: 'The ceiling you\'ve hit',
      subtitle: 'The most important section — be specific.',
      questions: [
        {
          id: 'ceiling_text',
          kind: 'long-text',
          label: 'What\'s breaking, slow, or blocked?',
          placeholder: 'API response times spike past 5s when more than ~200 users hit /search…',
          required: true,
          rows: 4,
        },
        {
          id: 'ceiling_scale',
          kind: 'short-text',
          label: 'At what scale does it break?',
          placeholder: '~200 concurrent users, 50k rows in the table…',
          required: true,
        },
        {
          id: 'ceiling_cost',
          kind: 'multi-card',
          label: 'What is it costing you?',
          options: [
            { value: 'revenue', label: 'Revenue' },
            { value: 'users', label: 'Users / churn' },
            { value: 'velocity', label: 'Engineering velocity' },
            { value: 'sleep', label: 'Sleep / oncall' },
          ],
          required: true,
        },
      ],
    },
    {
      id: 'team',
      title: 'Team & capacity',
      questions: [
        {
          id: 'team_depth',
          kind: 'single-card',
          label: 'Internal technical depth',
          required: true,
          options: [
            { value: 'no-devs', label: 'No developers' },
            { value: 'junior', label: 'Junior' },
            { value: 'mid', label: 'Mid-level' },
            { value: 'senior', label: 'Senior' },
            { value: 'mixed', label: 'Mixed' },
          ],
        },
        {
          id: 'vibe_coding',
          kind: 'segmented',
          label: 'Are you "vibe coding"?',
          helpText: 'Vibe coding = building fast with AI assistance, light on structured architecture.',
          required: true,
          options: [
            { value: 'yes', label: 'Yes' },
            { value: 'kind-of', label: 'Kind of' },
            { value: 'no', label: 'No' },
          ],
        },
      ],
    },
    {
      id: 'tried',
      title: 'What you\'ve already tried',
      questions: [
        {
          id: 'attempts',
          kind: 'long-text',
          label: 'What have you tried that didn\'t work?',
          placeholder: 'Switched DBs, added caching, rewrote the worker…',
          rows: 3,
          required: false,
        },
        {
          id: 'consultants',
          kind: 'segmented',
          label: 'Have you worked with consultants before?',
          required: false,
          options: [
            { value: 'never', label: 'Never' },
            { value: 'tried', label: 'Tried, mixed results' },
            { value: 'great', label: 'Yes, it worked well' },
          ],
        },
      ],
    },
    {
      id: 'service-fit',
      title: 'Service fit',
      subtitle: 'Which kind of help feels right? (We may suggest different.)',
      questions: [
        {
          id: 'service_fit',
          kind: 'single-card',
          label: 'I\'m looking for…',
          required: true,
          options: [
            { value: 'frontend', label: 'Frontend audit & rebuild' },
            { value: 'backend', label: 'Backend architecture & scaling' },
            { value: 'ai-strategy', label: 'AI strategy & integration' },
            { value: 'vibe-to-prod', label: 'Vibe-code → production refactor' },
            { value: 'full-review', label: 'Full technical review & roadmap' },
            { value: 'fractional-cto', label: 'Fractional CTO' },
          ],
        },
      ],
    },
    {
      id: 'timeline',
      title: 'Timeline & investment',
      questions: [
        {
          id: 'urgency',
          kind: 'segmented',
          label: 'How urgent is this?',
          required: true,
          options: [
            { value: 'this-week', label: 'This week' },
            { value: 'this-month', label: 'This month' },
            { value: 'next-quarter', label: 'Next quarter' },
            { value: 'exploring', label: 'Exploring' },
          ],
        },
        {
          id: 'budget',
          kind: 'slider',
          label: 'Estimated budget',
          required: true,
          min: 0,
          max: 50000,
          step: 1000,
          formatValue: (n) => (n >= 50000 ? '$50k+' : `$${(n / 1000).toFixed(0)}k`),
          quickPicks: [
            { label: 'Under $10k', value: 5000 },
            { label: '$10–25k', value: 17500 },
            { label: '$25–50k', value: 37500 },
            { label: '$50k+', value: 50000 },
          ],
        },
        {
          id: 'decision_maker',
          kind: 'segmented',
          label: 'Who makes the final call?',
          required: true,
          options: [
            { value: 'founder', label: 'Founder' },
            { value: 'cto', label: 'CTO' },
            { value: 'board', label: 'Board' },
            { value: 'committee', label: 'Committee' },
          ],
        },
        {
          id: 'contact',
          kind: 'contact-info',
          label: 'Send me my gap report',
          required: true,
        },
      ],
    },
  ],
};

export default expertConfig;
