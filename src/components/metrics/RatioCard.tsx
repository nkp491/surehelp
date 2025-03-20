
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { InfoIcon } from "lucide-react";

interface RatioCardProps {
  label: string;
  value: string | number;
}

const RatioCard = ({ label, value }: RatioCardProps) => {
  // Get descriptive text based on ratio type
  const getTooltipContent = (label: string) => {
    switch (label) {
      case "Leads to Contact":
        return "Average number of leads needed to get one contact";
      case "Leads to Sales":
        return "Average number of leads needed to make one sale";
      case "Calls to Sales":
        return "Average number of calls needed to make one sale";
      case "Contact to Sales":
        return "Average number of contacts needed to make one sale";
      case "AP per Lead":
        return "Average premium per lead";
      case "AP per Call":
        return "Average premium per call made";
      case "AP per Contact":
        return "Average premium per contact made";
      case "AP per Sale":
        return "Average premium per sale";
      case "Sits to Sales (Close Ratio)":
        return "Percentage of sits that convert to sales";
      default:
        return `Ratio of ${label}`;
    }
  };

  // Check if this is an AP (Average Premium) value
  const isAPValue = typeof value === 'string' && value.startsWith('$');

  return (
    <Card className="p-2 bg-gray-100 rounded-lg text-center shadow-sm hover:shadow-md transition-shadow">
      <div className="text-sm font-semibold text-gray-900">
        {isAPValue ? (
          <span className="text-green-600">{value}</span>
        ) : (
          value
        )}
      </div>
      <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
        {label}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <InfoIcon className="h-3 w-3 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="w-48 text-xs">{getTooltipContent(label)}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </Card>
  );
};

export default RatioCard;
