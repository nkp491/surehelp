import BusinessMetrics from "@/components/BusinessMetrics";
import DailyReport from "@/components/DailyReport";

const MetricsVisualization = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Metrics Visualization</h1>
      <div className="space-y-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-semibold mb-6">Lead Conversion Metrics</h2>
          <div className="space-y-4">
            <p className="text-gray-600">
              Track your lead conversion funnel from initial leads through to final sales:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-500">
              <div>• Leads → Calls</div>
              <div>• Calls → Contacts</div>
              <div>• Contacts → Scheduled</div>
              <div>• Scheduled → Sits</div>
              <div>• Sits → Sales</div>
            </div>
          </div>
        </div>
        <BusinessMetrics />
        <DailyReport />
      </div>
    </div>
  );
};

export default MetricsVisualization;