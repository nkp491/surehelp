import { Card } from "./ui/card";
import { Separator } from "./ui/separator";
import { MetricsProvider } from "@/contexts/MetricsContext";
import TimeControls from "./metrics/TimeControls";
import MetricsGrid from "./metrics/MetricsGrid";
import RatiosGrid from "./metrics/RatiosGrid";
import MetricsChart from "./MetricsChart";
import { useMetrics } from "@/contexts/MetricsContext";

const BusinessMetricsContent = () => {
  const { metrics, timePeriod, handleTimePeriodChange } = useMetrics();
  
  const chartData = Object.entries(metrics).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value: key === 'ap' ? value / 100 : value,
  }));

  return (
    <Card className="w-full mb-12 p-8 shadow-lg border-2 border-[#FFF9EE] bg-[#F1F1F1]">
      <div className="space-y-8">
        <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-[#FFF9EE]">
          <h2 className="text-3xl font-bold text-gray-900">Business Metrics</h2>
          <TimeControls />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm space-y-8 border border-[#FFF9EE]">
          <MetricsGrid />
          <Separator className="my-8" />
          <RatiosGrid />
        </div>

        <MetricsChart 
          data={chartData} 
          timePeriod={timePeriod}
          onTimePeriodChange={handleTimePeriodChange}
        />
      </div>
    </Card>
  );
};

const BusinessMetrics = () => {
  return (
    <MetricsProvider>
      <BusinessMetricsContent />
    </MetricsProvider>
  );
};

export default BusinessMetrics;