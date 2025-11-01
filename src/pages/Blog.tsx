import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock } from "lucide-react";

const Blog = () => {
  const blogPosts = [
    {
      id: 1,
      title: "5 Ways AI Can Transform Your Small Business Today",
      excerpt: "Discover practical AI applications that can streamline operations and boost productivity without breaking the bank.",
      category: "AI for Business",
      date: "2024-01-15",
      readTime: "5 min read",
      slug: "ai-transform-small-business",
    },
    {
      id: 2,
      title: "Building Scalable Web Apps: A Founder's Guide",
      excerpt: "Learn the key architectural decisions that will help your application grow with your business.",
      category: "Web Development Tips",
      date: "2024-01-10",
      readTime: "8 min read",
      slug: "building-scalable-web-apps",
    },
    {
      id: 3,
      title: "Prompt Engineering 101: Getting Better Results from ChatGPT",
      excerpt: "Master the art of writing effective prompts to maximize the value you get from AI tools.",
      category: "Prompt Engineering",
      date: "2024-01-05",
      readTime: "6 min read",
      slug: "prompt-engineering-101",
    },
    {
      id: 4,
      title: "When to Build vs. Buy: A Technical Decision Framework",
      excerpt: "Navigate the build-or-buy decision with confidence using this practical framework.",
      category: "Tech Consultant Angle",
      date: "2023-12-28",
      readTime: "7 min read",
      slug: "build-vs-buy-framework",
    },
    {
      id: 5,
      title: "Why I Started ND Scale Smart: From Corporate to Consulting",
      excerpt: "The personal journey from enterprise software to helping small businesses scale smart.",
      category: "Authority / Pivot Story",
      date: "2023-12-20",
      readTime: "10 min read",
      slug: "why-i-started-nd-scalesmart",
    },
    {
      id: 6,
      title: "3 Quick Wins to Improve Your Website's Performance Today",
      excerpt: "Simple, actionable steps you can take right now to speed up your website.",
      category: "Quick Practical Value",
      date: "2023-12-15",
      readTime: "4 min read",
      slug: "quick-wins-website-performance",
    },
  ];

  const categories = ["All", "AI for Business", "Web Development Tips", "Prompt Engineering", "Scaling Smart", "Tech Consultant Angle"];

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 circuit-pattern opacity-50" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-display font-bold mb-6">
              Insights & Resources
            </h1>
            <p className="text-xl text-muted-foreground">
              Practical advice on AI, web development, and scaling your business with technology.
            </p>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <Badge
                key={category}
                variant={category === "All" ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <Link key={post.id} to={`/blog/${post.slug}`}>
                <Card className="hover-lift h-full hover:border-primary/50 transition-all duration-300">
                  <CardHeader>
                    <Badge className="w-fit mb-2" variant="secondary">
                      {post.category}
                    </Badge>
                    <CardTitle className="text-xl leading-tight hover:text-primary transition-colors">
                      {post.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {post.excerpt}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(post.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {post.readTime}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-display font-bold mb-4">
              Never Miss an Update
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Get weekly insights on AI, web development, and scaling your business delivered straight to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8 whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Blog;
