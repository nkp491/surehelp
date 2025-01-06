import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";
import { Card } from "@/components/ui/card";

type MetricType = "leads" | "calls" | "contacts" | "scheduled" | "sits" | "sales";

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
  });

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

  return (
    <div className="w-full mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Business Metrics</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Object.entries(metrics).map(([metric, count]) => (
          <Card key={metric} className="p-4">
            <div className="flex flex-col items-center gap-2">
              <h3 className="font-semibold text-lg capitalize">{metric}</h3>
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
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default BusinessMetrics;