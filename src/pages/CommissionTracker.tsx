import { AlertCircle, ChevronUp, ChevronDown, DollarSign } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from "react";

const CommissionTracker = () => {
  const [isFeatureOpen, setIsFeatureOpen] = useState(true);
  const [isReportingOpen, setIsReportingOpen] = useState(true);

  return (
    <>
      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-[#fbfaf8] mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Commission Tracker</h2>
          <p className="text-muted-foreground mt-1">Track and manage your commission earnings with powerful analytics</p>
        </div>
      </div>
      
      <Collapsible
        open={isFeatureOpen}
        onOpenChange={setIsFeatureOpen}
        className="max-w-2xl mx-auto"
      >
        <Alert variant="default">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Coming Soon: Advanced Commission Tracking</AlertTitle>
            </div>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-9 p-0">
                {isFeatureOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
                <span className="sr-only">Toggle content</span>
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent>
            <AlertDescription className="mt-4">
              <p className="mb-4">
                We're building powerful commission tracking features to help you manage and forecast your earnings. Coming soon:
              </p>
              <ul className="list-disc list-inside mb-4 space-y-2">
                <li>Real-time commission calculations</li>
                <li>Commission forecasting and projections</li>
                <li>Split commission management</li>
                <li>Historical commission analytics</li>
                <li>Commission payment tracking</li>
              </ul>
            </AlertDescription>
          </CollapsibleContent>
        </Alert>
      </Collapsible>

      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-[#fbfaf8] mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Commission Reports</h2>
          <p className="text-muted-foreground mt-1">Generate detailed commission reports and insights</p>
        </div>
      </div>

      <Collapsible
        open={isReportingOpen}
        onOpenChange={setIsReportingOpen}
        className="max-w-2xl mx-auto"
      >
        <Alert variant="default">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <AlertTitle>Coming Soon: Advanced Reporting</AlertTitle>
            </div>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-9 p-0">
                {isReportingOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
                <span className="sr-only">Toggle content</span>
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent>
            <AlertDescription className="mt-4">
              <p className="mb-4">
                Generate comprehensive commission reports with advanced features including:
              </p>
              <ul className="list-disc list-inside mb-4 space-y-2">
                <li>Customizable report templates</li>
                <li>Commission breakdown by product/service</li>
                <li>Team commission reports</li>
                <li>Export options (PDF, Excel, CSV)</li>
                <li>Automated report scheduling</li>
              </ul>
            </AlertDescription>
          </CollapsibleContent>
        </Alert>
      </Collapsible>
    </>
  );
};

export default CommissionTracker; 