import RatioCard from "./RatioCard";
import LeadMTDSpend from "./LeadMTDSpend";
import { useMetrics } from "@/contexts/MetricsContext";

const RatiosGrid = () => {
  const { ratios } = useMetrics();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <RatioCard
        label="AP per Sale"
        value={ratios.apPerSale}
      />
      <LeadMTDSpend />
      <RatioCard
        label="Conversion Rate"
        value={`${ratios.conversionRate}%`}
      />
      <RatioCard
        label="Contact Rate"
        value={`${ratios.contactRate}%`}
      />
    </div>
  );
};

export default RatiosGrid;