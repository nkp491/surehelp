import { useState } from "react";
import DailyReport from "@/components/DailyReport";
import BusinessMetrics from "@/components/BusinessMetrics";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

const MetricsVisualization = () => {
  const [isVisible, setIsVisible] = useState(true);

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Metrics Visualization</h1>
        <Button
          variant="outline"
          onClick={toggleVisibility}
          className="flex items-center gap-2"
        >
          {isVisible ? (
            <>
              <EyeOff className="h-4 w-4" /> Hide Metrics
            </>
          ) : (
            <>
              <Eye className="h-4 w-4" /> Show Metrics
            </>
          )}
        </Button>
      </div>
      {isVisible && (
        <div className="space-y-8">
          <BusinessMetrics />
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-semibold mb-6">Lead Conversion Metrics</h2>
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
          </div>
          <DailyReport />
        </div>
      )}
    </div>
  );
};

export default MetricsVisualization;