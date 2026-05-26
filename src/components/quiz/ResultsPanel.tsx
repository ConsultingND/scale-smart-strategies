import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ArrowRight, Calendar } from 'lucide-react';
import type { ContactInfoValue, QuizKey, Results } from './types';
import RadarChart from './RadarChart';

type Props = {
  quiz: QuizKey;
  results: Results;
  contact: ContactInfoValue;
  submitState: 'idle' | 'submitting' | 'success' | 'error';
  errorMessage?: string;
};

const CALENDLY_URL = 'https://calendly.com/solutions-ndscalesmart/30min';

export default function ResultsPanel({ quiz, results, contact, submitState, errorMessage }: Props) {
  const [mvpDialogOpen, setMvpDialogOpen] = useState(false);
  const [messyPrompt, setMessyPrompt] = useState('');

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
                {alt.tag ? (
                  <div className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-1">
                    {alt.tag}
                  </div>
                ) : null}
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
          Interested in learning more about your results? Book a discovery call today.
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
            <p className="text-destructive text-sm">
              {errorMessage ?? 'Something went wrong. Please try again.'}
            </p>
          </div>
        ) : null}

        <div className="flex flex-col sm:flex-row gap-3">
          {quiz === 'beginner' ? (
            <>
              <Button asChild size="lg" className="gap-2">
                <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer">
                  <Calendar className="h-4 w-4" />
                  Book a Discovery Call
                </a>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="gap-2"
                onClick={() => setMvpDialogOpen(true)}
              >
                Get my MVP First Draft
                <ArrowRight className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button asChild size="lg" className="gap-2">
                <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer">
                  <Calendar className="h-4 w-4" />
                  Book a Technical Strategy Session
                </a>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a
                  href={`mailto:solutions@ndscalesmart.com?subject=${encodeURIComponent('Written Audit Request — expert quiz follow-up')}`}
                >
                  Request a Written Audit
                </a>
              </Button>
            </>
          )}
        </div>
      </div>

      <Dialog open={mvpDialogOpen} onOpenChange={setMvpDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Get my MVP First Draft</DialogTitle>
            <DialogDescription>
              Write your messy prompt idea below and watch me turn it into an MVP first draft. Book a Discovery Call
              with me to get your results.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 mt-2">
            <Textarea
              id="messy-prompt"
              value={messyPrompt}
              onChange={(e) => setMessyPrompt(e.target.value)}
              placeholder="Just start typing — half-baked, stream-of-consciousness, whatever's in your head…"
              rows={6}
              className="resize-y"
            />
            <p className="text-sm text-muted-foreground">
              Interested in learning more about your results? Book a discovery call today.
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-3">
            <Button asChild size="lg" className="gap-2">
              <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer">
                <Calendar className="h-4 w-4" />
                Book a Discovery Call
              </a>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
