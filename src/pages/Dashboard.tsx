import BusinessMetrics from "@/components/BusinessMetrics";

const MetricsVisualization = () => {
  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-[#fbfaf8] mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-muted-foreground mt-1">Track and analyze your key business metrics in real-time</p>
        </div>
      </div>
      <div className="space-y-8">
        <BusinessMetrics />
      </div>
    </div>
  );
};

export default MetricsVisualization;