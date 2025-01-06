import { useState, useEffect } from "react";
import MetricCard from "./metrics/MetricCard";
import RatioCard from "./metrics/RatioCard";
import MetricsChart from "./MetricsChart";
import { calculateRatios } from "@/utils/metricsUtils";

type MetricType = "leads" | "calls" | "contacts" | "scheduled" | "sits" | "sales" | "ap";

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
        // For AP, increment/decrement by $1.00
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
      // Convert currency string to cents for storage
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
    .filter(([name]) => name !== 'ap') // Exclude AP from the chart
    .map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value: value,
    }));

  const ratios = calculateRatios(metrics);

  return (
    <div className="w-full mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Business Metrics</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4 mb-8">
        {Object.entries(metrics).map(([metric, count]) => (
          <MetricCard
            key={metric}
            metric={metric}
            value={count}
            inputValue={metricInputs[metric] || '0'}
            onInputChange={(value) => handleInputChange(metric as MetricType, value)}
            onIncrement={() => updateMetric(metric as MetricType, true)}
            onDecrement={() => updateMetric(metric as MetricType, false)}
            isCurrency={metric === 'ap'}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        {ratios.map((ratio, index) => (
          <RatioCard
            key={index}
            label={ratio.label}
            value={ratio.value}
          />
        ))}
      </div>

      <MetricsChart data={chartData} />
    </div>
  );
};

export default BusinessMetrics;