import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useMetrics } from "@/contexts/MetricsContext";
import { MetricType } from "@/types/metrics";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

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
          user_id: user.data.user.id,
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
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Daily Metrics</h2>
              <p className="text-muted-foreground">Track your daily performance metrics</p>
            </div>
            <button
              onClick={handleDoneForDay}
              className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90"
            >
              Save Today's Metrics
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.keys(metrics).map((metric) => (
              <div key={metric} className="flex flex-col space-y-2">
                <label className="font-medium capitalize">{metric}</label>
                <div className="flex space-x-2">
                  <button
                    onClick={() => updateMetric(metric, false)}
                    className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                  >
                    -
                  </button>
                  <span className="px-3 py-1 bg-gray-100 rounded">
                    {metrics[metric as MetricType]}
                  </span>
                  <button
                    onClick={() => updateMetric(metric, true)}
                    className="px-3 py-1 bg-green-100 text-green-600 rounded hover:bg-green-200"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MetricsSection;