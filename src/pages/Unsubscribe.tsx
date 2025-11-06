import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { unsubscribeFromNewsletter } from "@/utils/newsletter";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

const Unsubscribe = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const token = searchParams.get('token');

  useEffect(() => {
    const handleUnsubscribe = async () => {
      if (!token) {
        setStatus('error');
        return;
      }

      try {
        await unsubscribeFromNewsletter(token);
        setStatus('success');
      } catch (error) {
        console.error('Unsubscribe error:', error);
        setStatus('error');
      }
    };

    handleUnsubscribe();
  }, [token]);

  return (
    <div className="min-h-screen pt-20 flex items-center justify-center bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto text-center bg-background p-8 rounded-lg shadow-lg">
          {status === 'loading' && (
            <>
              <Loader2 className="h-16 w-16 text-primary mx-auto mb-4 animate-spin" />
              <h1 className="text-2xl font-display font-bold mb-4">Processing...</h1>
              <p className="text-muted-foreground">Please wait while we unsubscribe you.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-2xl font-display font-bold mb-4">Successfully Unsubscribed</h1>
              <p className="text-muted-foreground mb-6">
                You've been unsubscribed from our newsletter. We're sorry to see you go!
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                You won't receive any more emails from us. If you change your mind, you can always
                subscribe again from our homepage.
              </p>
              <Button asChild>
                <Link to="/">Return to Homepage</Link>
              </Button>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
              <h1 className="text-2xl font-display font-bold mb-4">Something Went Wrong</h1>
              <p className="text-muted-foreground mb-6">
                We couldn't process your unsubscribe request. The link may be invalid or expired.
              </p>
              <Button asChild>
                <Link to="/contact">Contact Support</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Unsubscribe;
