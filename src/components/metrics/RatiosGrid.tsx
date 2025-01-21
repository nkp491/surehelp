import { useMetrics } from "@/contexts/MetricsContext";
import RatioCard from "./RatioCard";

const RatiosGrid = () => {
  const { ratios } = useMetrics();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {ratios.map((ratio, index) => (
        <RatioCard
          key={index}
          label={ratio.label}
          value={ratio.value}
        />
      ))}
    </div>
  );
};

export default RatiosGrid;