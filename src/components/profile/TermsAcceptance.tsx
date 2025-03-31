
import { format } from "date-fns";
import { useTermsAcceptance } from "@/hooks/useTermsAcceptance";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect } from "react";

const TermsAcceptance = () => {
  const { hasAcceptedTerms, termsAcceptedAt, isLoading, isAccepting, acceptTerms } = useTermsAcceptance();

  // Debug logging to help diagnose issues
  useEffect(() => {
    console.log("Terms acceptance state:", { 
      hasAcceptedTerms, 
      termsAcceptedAt, 
      isLoading, 
      isAccepting 
    });
  }, [hasAcceptedTerms, termsAcceptedAt, isLoading, isAccepting]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Terms and Conditions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-6 w-full bg-gray-200 animate-pulse rounded"></div>
        </CardContent>
      </Card>
    );
  }

  const handleAcceptTerms = async () => {
    await acceptTerms();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Terms and Conditions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Status:</span>
            {hasAcceptedTerms ? (
              <Badge variant="default" className="bg-green-500 hover:bg-green-600">Accepted</Badge>
            ) : (
              <Badge variant="destructive">Not Accepted</Badge>
            )}
          </div>
          
          {hasAcceptedTerms && termsAcceptedAt && (
            <div className="text-sm text-gray-600">
              Accepted on: {format(new Date(termsAcceptedAt), "PPP 'at' p")}
            </div>
          )}
          
          {!hasAcceptedTerms && (
            <div className="my-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800 text-sm">
              <p>You need to accept the Terms and Conditions to use all features of the application.</p>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Link 
          to="/terms"
          className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          View Terms <ExternalLink size={14} />
        </Link>
        
        {!hasAcceptedTerms && (
          <Button 
            onClick={handleAcceptTerms} 
            disabled={isAccepting}
            size="sm"
          >
            {isAccepting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Accept Terms
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default TermsAcceptance;
