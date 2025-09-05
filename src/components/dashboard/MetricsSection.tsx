import MetricButtons from "@/components/MetricButtons";
import { MetricType } from "@/types/metrics";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  saveTodayMetricsForHeader,
  MetricsHeaderData,
} from "@/services/metricsHeaderService";

const MetricsSection = () => {
  const [metrics, setMetrics] = useState<MetricsHeaderData>({
    leads: 0,
    calls: 0,
    contacts: 0,
    scheduled: 0,
    sits: 0,
    sales: 0,
    ap: 0,
  });
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Initialize with zeros - don't load from DB
  useEffect(() => {
    setIsInitialLoading(false);
  }, []);

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
    if (isLoading) {
      return;
    }

    try {
      setIsLoading(true);
      const success = await saveTodayMetricsForHeader(metrics);
      if (success) {
        setMetrics({
          leads: 0,
          calls: 0,
          contacts: 0,
          scheduled: 0,
          sits: 0,
          sales: 0,
          ap: 0,
        });

        // Optionally show success message
        // You can add a toast notification here if needed
      } else {
        console.error("❌ Failed to save metrics");
        // Optionally show error message
        // You can add error handling/notification here
      }
    } catch (error) {
      console.error("❌ Error saving metrics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (metric: MetricType, value: string) => {
    const numericValue = parseInt(value) || 0;
    setMetrics((prev) => ({
      ...prev,
      [metric]: numericValue,
    }));
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
            {(Object.keys(metrics) as MetricType[]).map(
              (metric, index, array) => (
                <MetricButtons
                  key={metric}
                  metric={metric}
                  currentValue={metrics[metric as keyof MetricsHeaderData]}
                  onInputChange={handleInputChange}
                  onIncrement={() => {
                    const currentValue =
                      metrics[metric as keyof MetricsHeaderData];
                    const newValue =
                      metric === "ap" ? currentValue + 100 : currentValue + 1;
                    handleInputChange(metric, newValue.toString());
                  }}
                  onDecrement={() => {
                    const currentValue =
                      metrics[metric as keyof MetricsHeaderData];
                    const newValue =
                      metric === "ap"
                        ? Math.max(0, currentValue - 100)
                        : Math.max(0, currentValue - 1);
                    handleInputChange(metric, newValue.toString());
                  }}
                  isLast={index === array.length - 1}
                />
              )
            )}
          </div>
          <Button
            onClick={handleSaveMetrics}
            disabled={isLoading || isInitialLoading}
            className="bg-[#2A6F97] text-white px-8 h-6 w-12 text-sm hover:bg-[#2A6F97]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Log"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MetricsSection;
