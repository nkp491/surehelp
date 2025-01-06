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

  const [metricInputs, setMetricInputs] = useState<{[key: string]: string}>({});

  useEffect(() => {
    const storedMetrics = localStorage.getItem("businessMetrics");
    if (storedMetrics) {
      const parsedMetrics = JSON.parse(storedMetrics);
      setMetrics(parsedMetrics);
      const initialInputs: {[key: string]: string} = {};
      Object.entries(parsedMetrics).forEach(([key, value]) => {
        initialInputs[key] = key === 'ap' ? formatCurrency(value as number) : value?.toString() || '0';
      });
      setMetricInputs(initialInputs);
    }
  }, []);

  const updateMetric = (metric: MetricType, increment: boolean) => {
    setMetrics((prev) => {
      const newValue = prev[metric] + (increment ? 1 : -1);
      const newMetrics = {
        ...prev,
        [metric]: newValue,
      };
      setMetricInputs(current => ({
        ...current,
        [metric]: metric === 'ap' ? formatCurrency(newValue) : newValue.toString()
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

    let numericValue: number;
    if (metric === 'ap') {
      numericValue = parseFloat(value.replace(/[^0-9.-]+/g, ""));
    } else {
      numericValue = parseInt(value) || 0;
    }

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
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4 mb-8">
        {Object.entries(metrics).map(([metric, count]) => (
          <Card 
            key={metric} 
            className={`p-4 ${metric === 'ap' ? 'col-span-full bg-gray-50' : ''}`}
          >
            <div className="flex flex-col items-center gap-2">
              <h3 className="font-semibold text-lg capitalize">
                {formatMetricName(metric)}
              </h3>
              <div className="flex flex-col items-center gap-2 w-full">
                <Input
                  type="text"
                  value={metricInputs[metric] || (metric === 'ap' ? formatCurrency(count) : count.toString())}
                  onChange={(e) => handleInputChange(metric as MetricType, e.target.value)}
                  className="text-center w-full max-w-xl font-bold text-lg"
                  placeholder={metric === 'ap' ? "$0.00" : "0"}
                />
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => updateMetric(metric as MetricType, false)}
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => updateMetric(metric as MetricType, true)}
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
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