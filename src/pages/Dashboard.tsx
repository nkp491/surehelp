import BusinessMetrics from "@/components/BusinessMetrics";

const MetricsVisualization = () => {
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>
      <div className="space-y-8">
        <BusinessMetrics />
      </div>
    </div>
  );
};

export default MetricsVisualization;