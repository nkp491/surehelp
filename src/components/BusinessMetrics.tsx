import { useState, useEffect } from "react";
import MetricCard from "./metrics/MetricCard";
import RatioCard from "./metrics/RatioCard";
import { calculateRatios } from "@/utils/metricsUtils";
import { Card } from "./ui/card";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";
import { Calendar as CalendarIcon, Clock, CalendarDays } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import MetricsChart from "./MetricsChart";

type MetricType = "leads" | "calls" | "contacts" | "scheduled" | "sits" | "sales" | "ap";
type TimePeriod = "24h" | "7d" | "30d" | "custom";

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
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  const { toast } = useToast();

  useEffect(() => {
    if (timePeriod === "custom" && dateRange.from && dateRange.to) {
      const key = `businessMetrics_custom_${format(dateRange.from, 'yyyy-MM-dd')}_${format(dateRange.to, 'yyyy-MM-dd')}`;
      const storedMetrics = localStorage.getItem(key);
      if (storedMetrics) {
        setMetrics(JSON.parse(storedMetrics));
      }
    } else {
      loadMetricsForPeriod(timePeriod);
    }
  }, [timePeriod, dateRange]);

  const loadMetricsForPeriod = (period: TimePeriod) => {
    const dailyMetrics = localStorage.getItem('businessMetrics_24h');
    let parsedDailyMetrics = dailyMetrics ? JSON.parse(dailyMetrics) : null;
    
    if (period === '24h') {
      if (parsedDailyMetrics) {
        setMetrics(parsedDailyMetrics);
        initializeInputs(parsedDailyMetrics);
      }
    } else {
      const storedMetrics = localStorage.getItem(`businessMetrics_${period}`);
      if (storedMetrics) {
        const parsedMetrics = JSON.parse(storedMetrics);
        if (parsedDailyMetrics) {
          const updatedMetrics = { ...parsedMetrics };
          Object.keys(parsedDailyMetrics).forEach((key) => {
            updatedMetrics[key] = (parsedMetrics[key] || 0) + parsedDailyMetrics[key];
          });
          setMetrics(updatedMetrics);
          localStorage.setItem(`businessMetrics_${period}`, JSON.stringify(updatedMetrics));
          initializeInputs(updatedMetrics);
        } else {
          setMetrics(parsedMetrics);
          initializeInputs(parsedMetrics);
        }
      } else if (parsedDailyMetrics) {
        setMetrics(parsedDailyMetrics);
        localStorage.setItem(`businessMetrics_${period}`, JSON.stringify(parsedDailyMetrics));
        initializeInputs(parsedDailyMetrics);
      }
    }

    const storedPreviousMetrics = localStorage.getItem(`previousBusinessMetrics_${period}`);
    if (storedPreviousMetrics) {
      setPreviousMetrics(JSON.parse(storedPreviousMetrics));
    }

    calculateTrends();
  };

  const initializeInputs = (metricsData: MetricCount) => {
    const initialInputs: {[key: string]: string} = {};
    Object.entries(metricsData).forEach(([key, value]) => {
      initialInputs[key] = key === 'ap' ? 
        (value ? (value as number / 100).toFixed(2) : '0.00') : 
        value?.toString() || '0';
    });
    setMetricInputs(initialInputs);
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
        updateMetricValue(metric, numericValue);
      }
    } else {
      const numericValue = parseInt(value) || 0;
      if (!isNaN(numericValue)) {
        updateMetricValue(metric, numericValue);
      }
    }
  };

  const updateMetricValue = (metric: MetricType, value: number) => {
    setMetrics(prev => {
      const newMetrics = {
        ...prev,
        [metric]: value
      };
      localStorage.setItem(`businessMetrics_${timePeriod}`, JSON.stringify(newMetrics));
      
      if (timePeriod === '24h') {
        updateAccumulatedMetrics('7d', metric, value);
        updateAccumulatedMetrics('30d', metric, value);
      }
      
      return newMetrics;
    });
  };

  const updateAccumulatedMetrics = (period: TimePeriod, metric: string, dailyValue: number) => {
    const storedMetrics = localStorage.getItem(`businessMetrics_${period}`);
    if (storedMetrics) {
      const parsedMetrics = JSON.parse(storedMetrics);
      parsedMetrics[metric] = dailyValue + (parsedMetrics[metric] || 0);
      localStorage.setItem(`businessMetrics_${period}`, JSON.stringify(parsedMetrics));
    }
  };

  const handleTimePeriodChange = (period: TimePeriod) => {
    setPreviousMetrics(metrics);
    localStorage.setItem(`previousBusinessMetrics_${timePeriod}`, JSON.stringify(metrics));
    setTimePeriod(period);
    if (period !== "custom") {
      setDateRange({ from: undefined, to: undefined });
    }
    toast({
      title: "Time Period Changed",
      description: `Switched to ${
        period === "24h" 
          ? "daily" 
          : period === "7d" 
          ? "weekly" 
          : period === "30d" 
          ? "monthly" 
          : "custom"
      } metrics view`,
    });
  };

  const ratios = calculateRatios(metrics);
  const chartData = Object.entries(metrics).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value: key === 'ap' ? value / 100 : value,
  }));

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
              <CalendarIcon className="h-4 w-4" />
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
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={timePeriod === "custom" ? "default" : "outline"}
                  className={cn(
                    "justify-start text-left font-normal",
                    !dateRange.from && "text-muted-foreground"
                  )}
                  onClick={() => handleTimePeriodChange("custom")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} -{" "}
                        {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Custom Range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange.from}
                  selected={{
                    from: dateRange.from,
                    to: dateRange.to,
                  }}
                  onSelect={(range) => {
                    setDateRange({
                      from: range?.from,
                      to: range?.to,
                    });
                  }}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
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

        <MetricsChart 
          data={chartData} 
          timePeriod={timePeriod}
          onTimePeriodChange={handleTimePeriodChange}
        />
      </div>
    </Card>
  );
};

export default BusinessMetrics;
