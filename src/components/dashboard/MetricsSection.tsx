import { Card } from "@/components/ui/card";
import MetricButtons from "@/components/MetricButtons";
import { useMetrics } from "@/contexts/MetricsContext";
import { MetricType } from "@/types/metrics";
import { useMetricsUpdates } from "@/hooks/useMetricsUpdates";
import { Button } from "@/components/ui/button";

const MetricsSection = () => {
  const { metrics, handleInputChange } = useMetrics();
  const { updateMetric, saveDailyMetrics } = useMetricsUpdates(metrics, handleInputChange);

  return (
    <div className="bg-white shadow-[0px_2px_6px_rgba(171,171,171,1)] z-10 flex w-full flex-col items-center whitespace-nowrap justify-center -mt-7 px-[70px] py-[21px] max-md:max-w-full max-md:px-5">
      <div className="flex w-full max-w-[1194px] items-stretch gap-5 flex-wrap justify-between max-md:max-w-full">
        {(Object.keys(metrics) as MetricType[]).map((metric, index, array) => (
          <MetricButtons
            key={metric}
            metric={metric}
            onIncrement={() => updateMetric(metric, true)}
            onDecrement={() => updateMetric(metric, false)}
            hasBorder={index !== array.length - 1}
          />
        ))}
        <Button
          onClick={saveDailyMetrics}
          className="bg-[rgba(42,111,151,1)] text-xl text-white font-bold mt-[5px] px-[26px] py-2 rounded-lg hover:bg-[rgba(42,111,151,0.9)]"
        >
          Log
        </Button>
      </div>
    </div>
  );
};

export default MetricsSection;