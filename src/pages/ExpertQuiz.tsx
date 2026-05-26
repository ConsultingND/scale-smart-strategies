import { Link } from 'react-router-dom';
import Quiz from '@/components/quiz/Quiz';
import expert from '@/data/quiz/expert';

const ExpertQuizPage = () => {
  return (
    <div className="min-h-screen pt-20">
      <section className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 circuit-pattern opacity-50" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
              <span aria-hidden>⚙️</span> Expert · Clarity Engine
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Find where your tech is holding you back
            </h1>
            <p className="text-lg text-muted-foreground mb-3">
              A short technical audit for founders and CTOs with a live product. Diagnose your real bottleneck in under
              8 minutes.
            </p>
            <p className="text-sm text-muted-foreground">
              Just starting out?{' '}
              <Link to="/quiz" className="font-medium text-primary underline-offset-4 hover:underline">
                Take the Starter Clarity Engine →
              </Link>
            </p>
          </div>
        </div>
      </section>

      <section className="pb-24">
        <div className="container mx-auto px-4">
          <Quiz config={expert} />
        </div>
      </section>
    </div>
  );
};

export default ExpertQuizPage;
