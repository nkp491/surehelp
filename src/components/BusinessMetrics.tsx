import { useState, useEffect } from "react";
import MetricCard from "./metrics/MetricCard";
import RatioCard from "./metrics/RatioCard";
import { calculateRatios } from "@/utils/metricsUtils";
import { Card } from "./ui/card";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";
import { Calendar, Clock, CalendarDays } from "lucide-react";

type MetricType = "leads" | "calls" | "contacts" | "scheduled" | "sits" | "sales" | "ap";
type TimePeriod = "24h" | "7d" | "30d";

interface MetricCount {
  [key: string]: number;
}

interface MetricTrends {
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

  const [previousMetrics, setPreviousMetrics] = useState<MetricCount>({
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
  const [trends, setTrends] = useState<MetricTrends>({});
  const { toast } = useToast();

  useEffect(() => {
    loadMetricsForPeriod(timePeriod);
  }, [timePeriod]);

  const loadMetricsForPeriod = (period: TimePeriod) => {
    const storedMetrics = localStorage.getItem(`businessMetrics_${period}`);
    const storedPreviousMetrics = localStorage.getItem(`previousBusinessMetrics_${period}`);
    
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
    } else {
      // If no metrics exist for the period, copy from daily metrics
      const dailyMetrics = localStorage.getItem('businessMetrics_24h');
      if (dailyMetrics && period !== '24h') {
        localStorage.setItem(`businessMetrics_${period}`, dailyMetrics);
        setMetrics(JSON.parse(dailyMetrics));
      }
    }

    if (storedPreviousMetrics) {
      setPreviousMetrics(JSON.parse(storedPreviousMetrics));
    }

    calculateTrends();
  };

  const calculateTrends = () => {
    const newTrends: MetricTrends = {};
    Object.keys(metrics).forEach((key) => {
      const current = metrics[key];
      const previous = previousMetrics[key];
      if (previous === 0) {
        newTrends[key] = 0;
      } else {
        newTrends[key] = Math.round(((current - previous) / previous) * 100);
      }
    });
    setTrends(newTrends);
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
          localStorage.setItem(`businessMetrics_${timePeriod}`, JSON.stringify(newMetrics));
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
          localStorage.setItem(`businessMetrics_${timePeriod}`, JSON.stringify(newMetrics));
          return newMetrics;
        });
      }
    }
  };

  const handleTimePeriodChange = (period: TimePeriod) => {
    setPreviousMetrics(metrics);
    localStorage.setItem(`previousBusinessMetrics_${timePeriod}`, JSON.stringify(metrics));
    setTimePeriod(period);
    toast({
      title: "Time Period Changed",
      description: `Switched to ${period === "24h" ? "daily" : period === "7d" ? "weekly" : "monthly"} metrics view`,
    });
  };

  const ratios = calculateRatios(metrics);

  return (
    <Card className="w-full mb-12 p-8 shadow-lg border-2 bg-[#F1F1F1]">
      <div className="space-y-8">
        <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
          <h2 className="text-3xl font-bold text-gray-900">Business Metrics</h2>
          <div className="flex gap-4">
            <Button
              variant={timePeriod === "24h" ? "default" : "outline"}
              onClick={() => handleTimePeriodChange("24h")}
              className="flex items-center gap-2"
            >
              <Clock className="h-4 w-4" />
              Daily
            </Button>
            <Button
              variant={timePeriod === "7d" ? "default" : "outline"}
              onClick={() => handleTimePeriodChange("7d")}
              className="flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              Weekly
            </Button>
            <Button
              variant={timePeriod === "30d" ? "default" : "outline"}
              onClick={() => handleTimePeriodChange("30d")}
              className="flex items-center gap-2"
            >
              <CalendarDays className="h-4 w-4" />
              Monthly
            </Button>
          </div>
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
                trend={trends[metric] || 0}
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
      </div>
    </Card>
  );
};

export default BusinessMetrics;