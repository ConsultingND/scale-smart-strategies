import Quiz from '@/components/quiz/Quiz';
import expert from '@/data/quiz/expert';

const ExpertQuizPage = () => {
  return (
    <div className="min-h-screen pt-20">
      <section className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 circuit-pattern opacity-50" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            <p className="text-sm uppercase tracking-widest text-muted-foreground font-medium mb-3">
              Expert Clarity Engine
            </p>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Find where your tech is holding you back
            </h1>
            <p className="text-lg text-muted-foreground">
              A short technical audit for founders and CTOs with a live product. Diagnose your real bottleneck in under
              8 minutes.
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
