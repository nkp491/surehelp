import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useMetrics } from "@/contexts/MetricsContext";
import { MetricType } from "@/types/metrics";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import MetricsHeader from "../metrics/MetricsHeader";
import MetricsButtonGrid from "../metrics/MetricsButtonGrid";

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
          <MetricsHeader onSave={handleDoneForDay} />
          <MetricsButtonGrid 
            metrics={metrics}
            onMetricUpdate={updateMetric}
          />
        </div>
      </Card>
    </div>
  );
};

export default MetricsSection;