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
  const [isLoading, setIsLoading] = useState(false);

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

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY]);

  const handleSaveMetrics = async () => {
    try {
      setIsLoading(true);
      await saveDailyMetrics();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`w-full transition-all duration-300 ${
        isVisible ? "translate-y-0" : "translate-y-full opacity-0"
      }`}
    >
      <div className="py-2">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 p-4">
  <div className="flex flex-wrap justify-center">
    {(Object.keys(metrics) as MetricType[]).map((metric, index, array) => (
      <MetricButtons
        key={metric}
        metric={metric}
        onIncrement={() => {}}
        onDecrement={() => {}}
        isLast={index === array.length - 1}
      />
    ))}
  </div>

  <Button
    onClick={handleSaveMetrics}
    disabled={isLoading}
    className="bg-[#2A6F97] text-white px-8 h-6 text-sm hover:bg-[#2A6F97]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
  >
    {isLoading ? (
      <div className="flex items-center gap-2">
        <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
        <span>Logging...</span>
      </div>
    ) : (
      "Log"
    )}
  </Button>
</div>

      </div>
    </div>
  );
};

export default MetricsSection;
