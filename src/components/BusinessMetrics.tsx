import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import MetricsChart from "./MetricsChart";

type MetricType = "leads" | "calls" | "contacts" | "scheduled" | "sits" | "sales" | "ap";

interface MetricCount {
  [key: string]: number;
}

interface MetricRatio {
  label: string;
  value: number | string;
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

  const [apInput, setApInput] = useState<string>("");

  useEffect(() => {
    const storedMetrics = localStorage.getItem("businessMetrics");
    if (storedMetrics) {
      setMetrics(JSON.parse(storedMetrics));
    }
  }, []);

  const updateMetric = (metric: MetricType, increment: boolean) => {
    setMetrics((prev) => {
      const newMetrics = {
        ...prev,
        [metric]: prev[metric] + (increment ? 1 : -1),
      };
      localStorage.setItem("businessMetrics", JSON.stringify(newMetrics));
      return newMetrics;
    });
  };

  const updateAP = (value: string) => {
    const numericValue = parseFloat(value.replace(/[^0-9.-]+/g, ""));
    if (!isNaN(numericValue)) {
      setMetrics((prev) => {
        const newMetrics = {
          ...prev,
          ap: numericValue,
        };
        localStorage.setItem("businessMetrics", JSON.stringify(newMetrics));
        return newMetrics;
      });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const calculateRatios = (): MetricRatio[] => {
    const { leads, contacts, scheduled, sits, sales, ap } = metrics;
    
    return [
      {
        label: "AP per Lead",
        value: leads > 0 ? formatCurrency(ap / leads) : "$0.00",
      },
      {
        label: "Leads to Contact",
        value: leads > 0 ? formatPercentage(contacts / leads) : "0%",
      },
      {
        label: "Leads to Scheduled",
        value: leads > 0 ? formatPercentage(scheduled / leads) : "0%",
      },
      {
        label: "Leads to Sits",
        value: leads > 0 ? formatPercentage(sits / leads) : "0%",
      },
      {
        label: "Leads to Sales",
        value: leads > 0 ? formatPercentage(sales / leads) : "0%",
      },
    ];
  };

  const handleAPInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setApInput(value);
    updateAP(value);
  };

  const chartData = Object.entries(metrics).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value: name === 'ap' ? parseFloat(value.toFixed(2)) : value,
  }));

  const formatMetricName = (metric: string) => {
    return metric === 'ap' ? 'AP' : metric.charAt(0).toUpperCase() + metric.slice(1);
  };

  return (
    <div className="w-full mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Business Metrics</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4 mb-8">
        {Object.entries(metrics).map(([metric, count]) => (
          <Card 
            key={metric} 
            className={`p-4 ${metric === 'ap' ? 'lg:col-span-7 mt-4' : ''}`}
          >
            <div className="flex flex-col items-center gap-2">
              <h3 className="font-semibold text-lg capitalize">
                {formatMetricName(metric)}
              </h3>
              {metric === 'ap' ? (
                <Input
                  type="text"
                  value={apInput || formatCurrency(count)}
                  onChange={handleAPInputChange}
                  className="text-center w-full max-w-xl font-bold text-lg"
                  placeholder="$0.00"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => updateMetric(metric as MetricType, false)}
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="text-xl font-bold min-w-[3ch] text-center">
                    {count}
                  </span>
                  <Button
                    onClick={() => updateMetric(metric as MetricType, true)}
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {calculateRatios().map((ratio, index) => (
          <Card key={index} className="p-4">
            <div className="flex flex-col items-center gap-2">
              <h3 className="font-semibold text-lg text-center">{ratio.label}</h3>
              <span className="text-xl font-bold">{ratio.value}</span>
            </div>
          </Card>
        ))}
      </div>

      <MetricsChart data={chartData} />
    </div>
  );
};

export default BusinessMetrics;