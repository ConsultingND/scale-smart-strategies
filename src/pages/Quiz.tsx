import { Link } from 'react-router-dom';
import Quiz from '@/components/quiz/Quiz';
import beginner from '@/data/quiz/beginner';

const QuizPage = () => {
  return (
    <div className="min-h-screen pt-20">
      <section className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 circuit-pattern opacity-50" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
              <span aria-hidden>🌱</span> Starter · Clarity Engine
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Turn your idea into a clear plan
            </h1>
            <p className="text-lg text-muted-foreground mb-3">
              A 10-minute quiz that maps a fuzzy business idea to a concrete next step. No signup until the end.
            </p>
            <p className="text-sm text-muted-foreground">
              Already have a live product?{' '}
              <Link to="/expert-quiz" className="font-medium text-primary underline-offset-4 hover:underline">
                Take the Expert Clarity Engine →
              </Link>
            </p>
          </div>
        </div>
      </section>

      <section className="pb-24">
        <div className="container mx-auto px-4">
          <Quiz config={beginner} />
        </div>
      </section>
    </div>
  );
};

export default QuizPage;
