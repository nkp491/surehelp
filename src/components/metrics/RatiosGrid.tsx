import RatioCard from "./RatioCard";
import LeadMTDSpend from "./LeadMTDSpend";
import { useMetrics } from "@/contexts/MetricsContext";

const RatiosGrid = () => {
  const { ratios } = useMetrics();

  // Find specific ratios by their labels
  const apPerSale = ratios.find(ratio => ratio.label === "AP per Sale")?.value || "$0";
  const conversionRate = ratios.find(ratio => ratio.label === "Sits to Sales (Close Ratio)")?.value || "0%";
  const contactRate = ratios.find(ratio => ratio.label === "Leads to Contact")?.value || "0";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <RatioCard
        label="AP per Sale"
        value={apPerSale}
      />
      <LeadMTDSpend />
      <RatioCard
        label="Conversion Rate"
        value={conversionRate}
      />
      <RatioCard
        label="Contact Rate"
        value={contactRate}
      />
    </div>
  );
};

export default RatiosGrid;