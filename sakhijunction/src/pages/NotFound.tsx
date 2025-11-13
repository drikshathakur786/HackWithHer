
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-brand-50 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="text-center max-w-md mx-auto">
        <h1 className="text-7xl font-bold text-brand mb-6">404</h1>
        <p className="text-xl text-foreground mb-8">Oops! We couldn't find the page you're looking for.</p>
        <p className="text-muted-foreground mb-8">
          The page might have been moved, deleted, or maybe never existed in the first place.
        </p>
        <Link to="/">
          <Button className="bg-brand hover:bg-brand-600 text-white">
            Return to Home
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
