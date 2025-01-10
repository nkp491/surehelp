import { useState, useEffect } from "react";
import MetricCard from "./metrics/MetricCard";
import RatioCard from "./metrics/RatioCard";
import MetricsChart from "./MetricsChart";
import { calculateRatios } from "@/utils/metricsUtils";
import MetricButtons from "./MetricButtons";
import { Card } from "./ui/card";
import { Separator } from "./ui/separator";

type MetricType = "leads" | "calls" | "contacts" | "scheduled" | "sits" | "sales" | "ap";
type TimePeriod = "24h" | "7d" | "30d";

interface MetricCount {
  [key: string]: number;
}

const BusinessMetrics = () => {
  const [metrics, setMetrics] = useState<MetricCount>({
    leads: 0,
    calls: 0,
    contacts: 0,
    scheduled: 0,
    sits: 0,
    sales: 0,
    ap: 0,
  });

  const [metricInputs, setMetricInputs] = useState<{[key: string]: string}>({});
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("24h");

  useEffect(() => {
    const storedMetrics = localStorage.getItem("businessMetrics");
    if (storedMetrics) {
      const parsedMetrics = JSON.parse(storedMetrics);
      setMetrics(parsedMetrics);
      const initialInputs: {[key: string]: string} = {};
      Object.entries(parsedMetrics).forEach(([key, value]) => {
        initialInputs[key] = key === 'ap' ? 
          (value ? (value as number / 100).toFixed(2) : '0.00') : 
          value?.toString() || '0';
      });
      setMetricInputs(initialInputs);
    }
  }, []);

  const updateMetric = (metric: MetricType, increment: boolean) => {
    setMetrics((prev) => {
      const currentValue = prev[metric];
      let newValue;
      
      if (metric === 'ap') {
        newValue = currentValue + (increment ? 100 : -100);
        if (newValue < 0) newValue = 0;
      } else {
        newValue = currentValue + (increment ? 1 : -1);
        if (newValue < 0) newValue = 0;
      }

      const newMetrics = {
        ...prev,
        [metric]: newValue,
      };

      setMetricInputs(current => ({
        ...current,
        [metric]: metric === 'ap' ? 
          (newValue / 100).toFixed(2) : 
          newValue.toString()
      }));

      localStorage.setItem("businessMetrics", JSON.stringify(newMetrics));
      return newMetrics;
    });
  };

  const handleInputChange = (metric: MetricType, value: string) => {
    setMetricInputs(prev => ({
      ...prev,
      [metric]: value
    }));

    if (metric === 'ap') {
      const numericValue = Math.round(parseFloat(value) * 100) || 0;
      if (!isNaN(numericValue)) {
        setMetrics(prev => {
          const newMetrics = {
            ...prev,
            [metric]: numericValue
          };
          localStorage.setItem("businessMetrics", JSON.stringify(newMetrics));
          return newMetrics;
        });
      }
    } else {
      const numericValue = parseInt(value) || 0;
      if (!isNaN(numericValue)) {
        setMetrics(prev => {
          const newMetrics = {
            ...prev,
            [metric]: numericValue
          };
          localStorage.setItem("businessMetrics", JSON.stringify(newMetrics));
          return newMetrics;
        });
      }
    }
  };

  const chartData = Object.entries(metrics)
    .filter(([name]) => name !== 'ap')
    .map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value: value,
    }));

  const ratios = calculateRatios(metrics);

  const handleTimePeriodChange = (period: TimePeriod) => {
    setTimePeriod(period);
    // In a real application, you would fetch data for the selected time period here
    // For now, we'll just update the state
    console.log(`Time period changed to: ${period}`);
  };

  return (
    <Card className="w-full mb-12 p-8 shadow-lg border-2 bg-[#F1F1F1]">
      <div className="space-y-8">
        <div className="flex items-center space-x-4 bg-white p-4 rounded-lg shadow-sm">
          <h2 className="text-3xl font-bold text-gray-900">Business Metrics</h2>
          <Separator className="flex-1" />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4">
            {Object.entries(metrics).map(([metric, count]) => (
              <MetricCard
                key={metric}
                metric={metric}
                value={count}
                inputValue={metricInputs[metric] || '0'}
                onInputChange={(value) => handleInputChange(metric as MetricType, value)}
                isCurrency={metric === 'ap'}
              />
            ))}
          </div>

          <Separator className="my-8" />

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {ratios.map((ratio, index) => (
              <RatioCard
                key={index}
                label={ratio.label}
                value={ratio.value}
              />
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <MetricsChart 
            data={chartData} 
            timePeriod={timePeriod}
            onTimePeriodChange={handleTimePeriodChange}
          />
        </div>
      </div>
    </Card>
  );
};

export default BusinessMetrics;