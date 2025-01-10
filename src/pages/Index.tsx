import FormContainer from "@/components/FormContainer";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { Link, Routes, Route } from "react-router-dom";
import SubmittedForms from "./SubmittedForms";
import MetricsVisualization from "./MetricsVisualization";
import MetricButtons from "@/components/MetricButtons";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type MetricType = "leads" | "calls" | "contacts" | "scheduled" | "sits" | "sales" | "ap";

const Index = () => {
  const [metrics, setMetrics] = useState<{[key: string]: number}>({
    leads: 0,
    calls: 0,
    contacts: 0,
    scheduled: 0,
    sits: 0,
    sales: 0,
    ap: 0,
  });

  useEffect(() => {
    const storedMetrics = localStorage.getItem("businessMetrics");
    if (storedMetrics) {
      setMetrics(JSON.parse(storedMetrics));
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

      localStorage.setItem("businessMetrics", JSON.stringify(newMetrics));
      return newMetrics;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Business Metrics
            </h1>
            <p className="text-lg text-gray-600">
              Track and manage your key performance indicators
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/submitted-forms">
              <Button variant="outline">View Submissions</Button>
            </Link>
            <Link to="/metrics">
              <Button variant="outline">View Metrics</Button>
            </Link>
            <Button
              onClick={() => window.open('https://insurancetoolkits.com/login', '_blank')}
              className="flex items-center gap-2"
              variant="outline"
            >
              <ExternalLink className="h-4 w-4" />
              Toolkits
            </Button>
          </div>
        </div>

        <Card className="p-6 mb-12 bg-white shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4">
            {Object.entries(metrics).map(([metric, value]) => (
              <MetricButtons
                key={metric}
                metric={metric}
                value={value}
                onIncrement={() => updateMetric(metric as MetricType, true)}
                onDecrement={() => updateMetric(metric as MetricType, false)}
              />
            ))}
          </div>
        </Card>

        <Separator className="my-12" />
        
        <div className="mt-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Client Assessment
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Fill out the form below to store your medical information
          </p>
          <FormContainer />
        </div>

        <Routes>
          <Route path="/submitted-forms" element={<SubmittedForms />} />
          <Route path="/metrics" element={<MetricsVisualization />} />
        </Routes>
      </div>
    </div>
  );
};

export default Index;