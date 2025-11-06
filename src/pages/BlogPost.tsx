import { useParams, Link } from "react-router-dom";
import { getBlogPostBySlug } from "@/data/blogPosts";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getBlogPostBySlug(slug) : undefined;

  if (!post) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-display font-bold mb-4">Post Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The blog post you're looking for doesn't exist.
          </p>
          <Link to="/blog">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20">
      {/* Back Button */}
      <section className="py-8 border-b">
        <div className="container mx-auto px-4">
          <Link to="/blog">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Blog
            </Button>
          </Link>
        </div>
      </section>

      {/* Article Header */}
      <article className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Badge className="mb-4" variant="secondary">
              {post.category}
            </Badge>
            
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-6">
              {post.title}
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8">
              {post.excerpt}
            </p>
            
            <div className="flex items-center gap-6 text-muted-foreground mb-12 pb-8 border-b">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {new Date(post.date).toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                {post.readTime}
              </div>
            </div>

            {/* Article Content */}
            <div className="prose prose-lg max-w-none dark:prose-invert">
              <ReactMarkdown
                components={{
                  h1: ({node, ...props}) => <h1 className="text-4xl font-bold mt-8 mb-4" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-3xl font-bold mt-8 mb-4" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-2xl font-bold mt-6 mb-3" {...props} />,
                  p: ({node, ...props}) => <p className="mb-4 leading-relaxed" {...props} />,
                  ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-4 space-y-2" {...props} />,
                  ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-4 space-y-2" {...props} />,
                  strong: ({node, ...props}) => <strong className="font-bold text-foreground" {...props} />,
                  code: ({node, ...props}) => <code className="bg-muted px-1.5 py-0.5 rounded text-sm" {...props} />,
                }}
              >
                {post.content}
              </ReactMarkdown>
            </div>

            {/* Call to Action */}
            <div className="mt-16 p-8 bg-muted/30 rounded-lg">
              <h3 className="text-2xl font-display font-bold mb-4">
                Ready to Scale Smart?
              </h3>
              <p className="text-muted-foreground mb-6">
                Get expert guidance on implementing these strategies for your business.
              </p>
              <Link to="/contact">
                <Button size="lg">
                  Book a Consultation
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
};

export default BlogPost;
