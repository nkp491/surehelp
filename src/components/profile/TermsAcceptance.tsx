
import { format } from "date-fns";
import { useTermsAcceptance } from "@/hooks/useTermsAcceptance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const TermsAcceptance = () => {
  const { hasAcceptedTerms, termsAcceptedAt, isLoading } = useTermsAcceptance();

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
        </div>
      </CardContent>
    </Card>
  );
};

export default TermsAcceptance;
