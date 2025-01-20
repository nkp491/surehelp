import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";

const PerformanceTab = () => {
  return (
    <Card className="p-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Coming Soon</AlertTitle>
        <AlertDescription>
          Team performance analytics and reporting features are coming soon.
        </AlertDescription>
      </Alert>
    </Card>
  );
};

export default PerformanceTab;