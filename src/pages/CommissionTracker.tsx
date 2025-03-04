
import { ChevronUp, ChevronDown, Sparkle, Rocket } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from "react";
import { cn } from "@/lib/utils";

const CommissionTracker = () => {
  const [isFeatureOpen, setIsFeatureOpen] = useState(true);
  const [isReportingOpen, setIsReportingOpen] = useState(true);

  return (
    <div className="space-y-6 py-6 sm:py-8 md:py-10">
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-[#fbfaf8]">
        <div className="max-w-3xl">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Commission Tracker</h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">Track and manage your commission earnings with powerful analytics</p>
        </div>
      </div>
      
      <div className="space-y-6 sm:space-y-8">
        <Collapsible
          open={isFeatureOpen}
          onOpenChange={setIsFeatureOpen}
        >
          <Alert variant="default" className="bg-gradient-to-r from-[#FEF7CD] to-[#FDE1D3] border-[#F97316]/20 transform transition-all duration-300 hover:shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkle className="h-5 w-5 text-[#F97316] animate-pulse" />
                <AlertTitle className="font-semibold text-[#F97316]">
                  <span className="mr-1">Coming Soon:</span>
                  <span className="animate-pulse">Advanced Commission Tracking</span>
                </AlertTitle>
              </div>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-9 p-0 hover:bg-[#F97316]/10 transition-all duration-200">
                  {isFeatureOpen ? (
                    <ChevronUp className="h-4 w-4 text-[#F97316]" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-[#F97316]" />
                  )}
                  <span className="sr-only">Toggle content</span>
                </Button>
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent className="animate-accordion-down">
              <AlertDescription className="mt-4">
                <p className="mb-4 text-[#9E5B00]">
                  We're building powerful commission tracking features to help you manage and forecast your earnings. Coming soon:
                </p>
                <ul className="mb-4 space-y-2">
                  {[
                    "Real-time commission calculations",
                    "Commission forecasting and projections",
                    "Split commission management",
                    "Historical commission analytics",
                    "Commission payment tracking"
                  ].map((item, index) => (
                    <li 
                      key={index} 
                      className={cn(
                        "pl-6 relative text-[#9E5B00] transition-all duration-200 hover:translate-x-1",
                        "before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-2 before:w-2 before:rounded-full before:bg-[#F97316]"
                      )}
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </AlertDescription>
            </CollapsibleContent>
          </Alert>
        </Collapsible>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-[#fbfaf8]">
          <div className="max-w-3xl">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Commission Reports</h2>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">Generate detailed commission reports and insights</p>
          </div>
        </div>

        <Collapsible
          open={isReportingOpen}
          onOpenChange={setIsReportingOpen}
        >
          <Alert variant="default" className="bg-gradient-to-r from-[#E5DEFF] to-[#D3E4FD] border-[#8B5CF6]/20 transform transition-all duration-300 hover:shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Rocket className="h-5 w-5 text-[#8B5CF6] animate-pulse" />
                <AlertTitle className="font-semibold text-[#8B5CF6]">
                  <span className="mr-1">Coming Soon:</span>
                  <span className="animate-pulse">Advanced Reporting</span>
                </AlertTitle>
              </div>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-9 p-0 hover:bg-[#8B5CF6]/10 transition-all duration-200">
                  {isReportingOpen ? (
                    <ChevronUp className="h-4 w-4 text-[#8B5CF6]" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-[#8B5CF6]" />
                  )}
                  <span className="sr-only">Toggle content</span>
                </Button>
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent className="animate-accordion-down">
              <AlertDescription className="mt-4">
                <p className="mb-4 text-[#5B399B]">
                  Generate comprehensive commission reports with advanced features including:
                </p>
                <ul className="mb-4 space-y-2">
                  {[
                    "Customizable report templates",
                    "Commission breakdown by product/service",
                    "Team commission reports",
                    "Export options (PDF, Excel, CSV)",
                    "Automated report scheduling"
                  ].map((item, index) => (
                    <li 
                      key={index} 
                      className={cn(
                        "pl-6 relative text-[#5B399B] transition-all duration-200 hover:translate-x-1",
                        "before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-2 before:w-2 before:rounded-full before:bg-[#8B5CF6]"
                      )}
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </AlertDescription>
            </CollapsibleContent>
          </Alert>
        </Collapsible>
      </div>
    </div>
  );
};

export default CommissionTracker;
