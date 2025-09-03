import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, AlertTriangle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="glass-card neon-glow max-w-md w-full mx-4">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold mb-4 gradient-text">404</h1>
          <p className="text-xl text-muted-foreground mb-6">Oops! Page not found</p>
          <p className="text-sm text-muted-foreground mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Button asChild className="bg-gradient-primary hover:opacity-90 neon-glow">
            <a href="/" className="flex items-center">
              <Home className="w-4 h-4 mr-2" />
              Return to Home
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
