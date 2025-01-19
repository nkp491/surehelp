import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import MetricButtons from "@/components/MetricButtons";
import { useToast } from "@/hooks/use-toast";
import { useMetrics } from "@/contexts/MetricsContext";
import { MetricType } from "@/types/metrics";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Check } from "lucide-react";

const MetricsSection = () => {
  const { toast } = useToast();
  const { metrics, handleInputChange } = useMetrics();

  const updateMetric = (metric: string, increment: boolean) => {
    const currentValue = metrics[metric as MetricType];
    const newValue = increment 
      ? metric === 'ap' 
        ? currentValue + 100 
        : currentValue + 1
      : metric === 'ap'
        ? Math.max(0, currentValue - 100)
        : Math.max(0, currentValue - 1);

    handleInputChange(metric as MetricType, newValue.toString());
    
    toast({
      title: "Metric Updated",
      description: `${metric.toUpperCase()} has been ${increment ? 'increased' : 'decreased'}`,
    });
  };

  const handleDoneForDay = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const today = format(new Date(), 'yyyy-MM-dd');
      
      const { error } = await supabase
        .from('daily_metrics')
        .upsert({
          user_id: user.user.id,
          date: today,
          ...metrics
        }, {
          onConflict: 'user_id,date'
        });

      if (error) throw error;

      // Emit a custom event to notify MetricsHistory to refresh
      const refreshEvent = new CustomEvent('refreshMetricsHistory');
      window.dispatchEvent(refreshEvent);

      toast({
        title: "Success",
        description: "Today's metrics have been saved to history",
      });
    } catch (error) {
      console.error('Error saving daily metrics:', error);
      toast({
        title: "Error",
        description: "Failed to save today's metrics",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-6 mb-12 bg-white shadow-md">
        <div className="flex flex-col space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-[#2A6F97]">Performance Tracker</h2>
            <Button 
              onClick={handleDoneForDay}
              className="bg-[#6CAEC2] hover:bg-[#6CAEC2]/90 text-white flex items-center gap-2"
              title="Save today's metrics"
            >
              <Check className="h-4 w-4" />
              Save Metrics
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4">
            {Object.keys(metrics).map((metric) => (
              <MetricButtons
                key={metric}
                metric={metric}
                onIncrement={() => updateMetric(metric, true)}
                onDecrement={() => updateMetric(metric, false)}
              />
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MetricsSection;