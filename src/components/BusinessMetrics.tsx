import { useState } from "react";
import { Card } from "@/components/ui/card";
import MetricsSection from "@/components/dashboard/MetricsSection";
import TimeControls from "@/components/metrics/TimeControls";
import MetricsHistory from "@/components/metrics/MetricsHistory";

const BusinessMetrics = () => {
  const [showHistory, setShowHistory] = useState(false);

  return (
    <div className="space-y-8">
      <Card className="w-full p-8 shadow-lg border-2 border-[#fbfaf8]" 
        style={{ 
          background: 'linear-gradient(109.6deg, rgba(223,234,247,1) 11.2%, rgba(244,248,252,1) 91.1%)'
        }}>
        <div className="space-y-8">
          <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-[#fbfaf8]">
            <TimeControls />
          </div>
          
          <MetricsSection />
          
          <div className="flex justify-end">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="text-primary hover:text-primary/80 transition-colors"
            >
              {showHistory ? "Hide History" : "Show History"}
            </button>
          </div>
          
          {showHistory && <MetricsHistory />}
        </div>
      </Card>
    </div>
  );
};

export default BusinessMetrics;