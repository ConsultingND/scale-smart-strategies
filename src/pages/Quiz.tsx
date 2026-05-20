import Quiz from '@/components/quiz/Quiz';
import beginner from '@/data/quiz/beginner';

const QuizPage = () => {
  return (
    <div className="min-h-screen pt-20">
      <section className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 circuit-pattern opacity-50" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            <p className="text-sm uppercase tracking-widest text-muted-foreground font-medium mb-3">
              Clarity Engine
            </p>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Turn your idea into a clear plan
            </h1>
            <p className="text-lg text-muted-foreground">
              A 10-minute quiz that maps a fuzzy business idea to a concrete next step. No signup until the end.
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
