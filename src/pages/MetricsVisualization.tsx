import BusinessMetrics from "@/components/BusinessMetrics";
import DailyReport from "@/components/DailyReport";
import { calculateRatios } from "@/utils/metricsUtils";
import RatioCard from "@/components/metrics/RatioCard";
import { useEffect, useState } from "react";

const MetricsVisualization = () => {
  const [metrics, setMetrics] = useState<{ [key: string]: number }>({
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

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Metrics Visualization</h1>
      <div className="space-y-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-semibold mb-6">Lead Conversion Metrics</h2>
          <div className="space-y-6">
            <div className="space-y-4">
              <p className="text-gray-600">
                Track your lead conversion funnel from initial leads through to final sales:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-500">
                <div>• Leads → Calls</div>
                <div>• Calls → Contacts</div>
                <div>• Contacts → Scheduled</div>
                <div>• Scheduled → Sits</div>
                <div>• Sits → Sales</div>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-4">Conversion Ratios</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {calculateRatios(metrics).map((ratio, index) => (
                  <RatioCard
                    key={index}
                    label={ratio.label}
                    value={ratio.value}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
        <BusinessMetrics />
        <DailyReport />
      </div>
    </div>
  );
};

export default MetricsVisualization;