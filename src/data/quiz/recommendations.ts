import type { Recommendation } from '@/components/quiz/types';

/**
 * Mechanism (Section 4 of the beginner quiz) → recommended app archetype.
 * The mapping is intentionally explicit so the recommendation is auditable.
 */
export const MECHANISM_RECOMMENDATIONS: Record<string, Recommendation> = {
  teach: {
    tag: 'Learning Platform',
    headline: 'You\'re building a learning platform.',
    body: 'Structured content + progress tracking + cohort or self-paced flow. Start with a content-first MVP and layer interactivity once you see what learners actually finish.',
  },
  track: {
    tag: 'Dashboard / Analytics',
    headline: 'You\'re building a tracker or dashboard.',
    body: 'Your users want visibility into something — habits, metrics, money, projects. The first version is usually one well-instrumented chart, not five mediocre ones.',
  },
  connect: {
    tag: 'Marketplace / Community',
    headline: 'You\'re building a marketplace or community.',
    body: 'Two-sided products are the hardest to bootstrap. Pick one side to over-serve first; the other side follows.',
  },
  organize: {
    tag: 'CRM / Workflow',
    headline: 'You\'re building a workflow or CRM tool.',
    body: 'Your value is structure: turning chaos into a system. Start by templating the workflow your customer is already doing in spreadsheets.',
  },
  automate: {
    tag: 'AI / Automation',
    headline: 'You\'re building an automation or AI agent.',
    body: 'Save people time on a task they already do. The riskiest part is making the AI reliable enough to trust — design the off-ramp before the autopilot.',
  },
  remind: {
    tag: 'Scheduling / Notifications',
    headline: 'You\'re building a reminder or scheduling tool.',
    body: 'Trigger-based products live or die on signal-to-noise. The first version should send fewer notifications, not more.',
  },
};

export const NO_APP_RECOMMENDATION: Recommendation = {
  tag: 'Consulting Fit',
  headline: 'You may not need an app yet.',
  body: 'Software is one tool — and not always the right one. Your idea may scale better through positioning, distribution, or a non-tech offer first. Let\'s talk through it on a discovery call.',
};

/**
 * Expert quiz: service-fit ordering. Returns recommendations ranked by signal
 * strength so the strongest match is shown first.
 */
export type ServiceKey =
  | 'frontend'
  | 'backend'
  | 'ai-strategy'
  | 'vibe-to-prod'
  | 'full-review'
  | 'fractional-cto';

export const SERVICE_RECOMMENDATIONS: Record<ServiceKey, Recommendation> = {
  frontend: {
    tag: 'Frontend Audit & Rebuild',
    headline: 'Your frontend is the next bottleneck.',
    body: 'Performance, design system rot, or a no-code ceiling. We\'ll audit the current UI, identify quick wins, and scope a rebuild if needed.',
  },
  backend: {
    tag: 'Backend Architecture & Scaling',
    headline: 'Your backend is the next bottleneck.',
    body: 'Scaling pain — slow queries, throughput limits, brittle integrations. We\'ll map the request path, find the actual chokepoint, and lay out a sequenced refactor.',
  },
  'ai-strategy': {
    tag: 'AI Strategy & Integration',
    headline: 'You\'re ready to integrate AI properly.',
    body: 'Beyond a chatbot bolted onto support. We\'ll identify which workflows give the highest leverage and design integration points that don\'t compromise your data model.',
  },
  'vibe-to-prod': {
    tag: 'Vibe-Code → Production',
    headline: 'Your fast-built code needs a production-ready spine.',
    body: 'AI-assisted code can outrun the architecture beneath it. We\'ll bring structure — modules, tests, deploy hygiene — without throwing away what works.',
  },
  'full-review': {
    tag: 'Full Technical Review',
    headline: 'You need a 360° read on your tech.',
    body: 'A 2-week review across frontend, backend, AI readiness, team capacity, and architecture. Outcome: a ranked roadmap of what to fix and what to leave alone.',
  },
  'fractional-cto': {
    tag: 'Fractional CTO',
    headline: 'You need senior technical leadership without a full-time hire.',
    body: 'Ongoing engagement: weekly strategy, code review, hiring help, vendor calls. Best when you have at least one product engineer on the team.',
  },
};
