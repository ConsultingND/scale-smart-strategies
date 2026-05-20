import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { ContactInfoValue, QuizKey, Results } from './types';
import RadarChart from './RadarChart';

type Props = {
  quiz: QuizKey;
  results: Results;
  contact: ContactInfoValue;
  submitState: 'idle' | 'submitting' | 'success' | 'error';
  errorMessage?: string;
};

const CTAS: Record<
  QuizKey,
  { primary: string; subjectPrimary: string; secondary: string; subjectSecondary: string }
> = {
  beginner: {
    primary: 'Book a Discovery Call',
    subjectPrimary: 'Discovery Call — quiz follow-up',
    secondary: 'Get my MVP First Draft',
    subjectSecondary: 'MVP First Draft — quiz follow-up',
  },
  expert: {
    primary: 'Book a Technical Strategy Session',
    subjectPrimary: 'Technical Strategy Session — expert quiz follow-up',
    secondary: 'Request a Written Audit',
    subjectSecondary: 'Written Audit Request — expert quiz follow-up',
  },
};

function mailtoHref(subject: string, contact: ContactInfoValue): string {
  const product = subject.split(' —')[0];
  const body = `Hi — I just completed the ${product} on ndscalesmart.com.\n\nName: ${contact.firstName} ${contact.lastName}\nCompany: ${contact.company}\nEmail: ${contact.email}\n`;
  return `mailto:solutions@ndscalesmart.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export default function ResultsPanel({ quiz, results, contact, submitState, errorMessage }: Props) {
  const ctas = CTAS[quiz];
  return (
    <div className="space-y-8">
      <div>
        <Badge variant="default" className="mb-3 uppercase tracking-wider">
          {results.recommendation.tag ?? 'Recommendation'}
        </Badge>
        <h2 className="text-2xl md:text-3xl font-display font-bold mb-3">
          {results.recommendation.headline}
        </h2>
        <p className="text-muted-foreground leading-relaxed">{results.recommendation.body}</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">Your scorecard</h3>
          <RadarChart dimensions={results.dimensions} title="Quiz scorecard" />
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
            {results.dimensions.map((d) => (
              <li
                key={d.id}
                className="flex items-center justify-between bg-muted/40 rounded-md px-3 py-2 text-sm"
              >
                <span className="font-medium">{d.label}</span>
                <span className="text-muted-foreground tabular-nums">{Math.round(d.score * 100)} / 100</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {results.alternates?.length ? (
        <div>
          <h3 className="text-lg font-semibold mb-3">Also worth considering</h3>
          <ul className="space-y-3">
            {results.alternates.map((alt) => (
              <li key={alt.headline} className="border rounded-lg p-4 bg-background">
                <div className="font-semibold">{alt.headline}</div>
                <div className="text-sm text-muted-foreground mt-1">{alt.body}</div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-2">{results.summary}</h3>
        <p className="text-muted-foreground mb-5">
          Your results have been saved. Pick a next step that fits where you are.
        </p>

        {submitState === 'success' ? (
          <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-900 rounded-md p-4 mb-4">
            <p className="text-green-800 dark:text-green-200 font-medium">
              We&apos;ve sent your results to {contact.email}. Check your inbox.
            </p>
          </div>
        ) : null}
        {submitState === 'error' ? (
          <div className="bg-destructive/10 border border-destructive/30 rounded-md p-4 mb-4">
            <p className="text-destructive">{errorMessage ?? 'Something went wrong. Please try again.'}</p>
          </div>
        ) : null}

        <div className="flex flex-col sm:flex-row gap-3">
          <Button asChild size="lg">
            <a href={mailtoHref(ctas.subjectPrimary, contact)}>{ctas.primary}</a>
          </Button>
          <Button asChild size="lg" variant="outline">
            <a href={mailtoHref(ctas.subjectSecondary, contact)}>{ctas.secondary}</a>
          </Button>
        </div>
      </div>
    </div>
  );
}
