import { Card } from "@/components/ui/card";
import MetricButtons from "@/components/MetricButtons";
import { useMetrics } from "@/contexts/MetricsContext";
import { MetricType } from "@/types/metrics";
import { useMetricsUpdates } from "@/hooks/useMetricsUpdates";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

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
        isVisible ? 'bg-white translate-y-0' : 'bg-transparent translate-y-full opacity-0'
      }`}
    >
      <div className="py-2">
        <div className="flex flex-col items-center gap-1">
          <div className="flex gap-6">
            {(Object.keys(metrics) as MetricType[]).map((metric) => (
              <MetricButtons
                key={metric}
                metric={metric}
                onIncrement={() => {}}
                onDecrement={() => {}}
              />
            ))}
          </div>
          <Button 
            onClick={saveDailyMetrics}
            className="bg-[#2A6F97] text-white px-20 h-6 text-sm hover:bg-[#2A6F97]/90 transition-colors"
          >
            Log
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MetricsSection;