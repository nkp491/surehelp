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
          <DailyReport />
        </div>
      )}
    </div>
  );
};

export default MetricsVisualization;