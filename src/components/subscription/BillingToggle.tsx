import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { BillingInterval } from "@/integrations/stripe/types";

interface BillingToggleProps {
  interval: "monthly" | "annually";
  onIntervalChange: (interval: "monthly" | "annually") => void;
  discount?: number;
}

export function BillingToggle({
  interval,
  onIntervalChange,
  discount = 16,
}: BillingToggleProps) {
  return (
    <div className="flex items-center justify-center space-x-4 p-4 bg-muted rounded-lg">
      <Label
        htmlFor="billing-toggle"
        className={interval === "monthly" ? "font-medium" : ""}
      >
        Monthly
      </Label>
      <Switch
        id="billing-toggle"
        checked={interval === "annually"}
        onCheckedChange={(checked) =>
          onIntervalChange(checked ? "annually" : "monthly")
        }
      />
      <div className="flex items-center gap-2">
        <Label
          htmlFor="billing-toggle"
          className={interval === "annually" ? "font-medium" : ""}
        >
          Annually
        </Label>
        {interval === "annually" && (
          <Badge variant="secondary" className="text-xs">
            Save {discount}%
          </Badge>
        )}
      </div>
    </div>
  );
}
