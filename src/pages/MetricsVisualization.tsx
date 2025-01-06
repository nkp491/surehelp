import BusinessMetrics from "@/components/BusinessMetrics";
import DailyReport from "@/components/DailyReport";

const MetricsVisualization = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Metrics Visualization</h1>
      <div className="space-y-8">
        <BusinessMetrics />
        <DailyReport />
      </div>
    </div>
  );
};

export default MetricsVisualization;