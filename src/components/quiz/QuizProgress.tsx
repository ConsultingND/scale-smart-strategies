import { Progress } from '@/components/ui/progress';

type Props = {
  current: number;
  total: number;
  title: string;
};

export default function QuizProgress({ current, total, title }: Props) {
  const pct = total > 0 ? Math.min(100, Math.round(((current + 1) / total) * 100)) : 0;
  return (
    <div className="mb-8" aria-live="polite">
      <div className="flex items-center justify-between text-sm mb-2">
        <span className="font-medium">
          Step {current + 1} of {total}
        </span>
        <span className="text-muted-foreground">{title}</span>
      </div>
      <Progress value={pct} className="h-2" aria-label={`Quiz progress: ${pct}% complete`} />
    </div>
  );
}
