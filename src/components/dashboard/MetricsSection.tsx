
import { Card } from "@/components/ui/card";
import MetricButtons from "@/components/MetricButtons";
import { useMetrics } from "@/contexts/MetricsContext";
import { MetricType } from "@/types/metrics";
import { useMetricsUpdates } from "@/hooks/useMetricsUpdates";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Save } from "lucide-react";

const MetricsSection = () => {
  const { metrics, handleInputChange } = useMetrics();
  const { saveDailyMetrics } = useMetricsUpdates(metrics, handleInputChange);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const metricLabels = {
    leads: 'Leads',
    calls: 'Calls',
    contacts: 'Contacts',
    scheduled: 'Scheduled',
    sits: 'Sits',
    sales: 'Sales',
    ap: 'AP'
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  return (
    <div 
      className={`w-full transition-all duration-300 ${
        isVisible ? 'translate-y-0' : 'translate-y-full opacity-0'
      }`}
    >
      <Card className="py-3 mx-auto max-w-[1440px] backdrop-blur-sm bg-white/80 shadow-sm border-none">
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center justify-center px-4">
            <div className="flex items-center gap-1">
              {(Object.keys(metrics) as MetricType[]).map((metric, index, array) => (
                <div 
                  key={metric}
                  className={`flex items-center ${
                    index !== array.length - 1 ? 'border-r border-gray-200 pr-3 mr-3' : ''
                  }`}
                >
                  <MetricButtons
                    metric={metric}
                    onIncrement={() => {}}
                    onDecrement={() => {}}
                    isLast={index === array.length - 1}
                  />
                </div>
              ))}
            </div>
          </div>
          <Button 
            onClick={saveDailyMetrics}
            className="bg-gradient-to-r from-[#2A6F97] to-[#3d84ac] text-white px-16 h-7 text-sm 
                     hover:from-[#2A6F97]/90 hover:to-[#3d84ac]/90 transition-all duration-300
                     shadow-sm hover:shadow flex items-center gap-2"
          >
            <Save className="h-3.5 w-3.5" />
            Log
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default MetricsSection;