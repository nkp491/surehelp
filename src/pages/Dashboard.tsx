import BusinessMetrics from "@/components/BusinessMetrics";
import { ErrorBoundary } from "@/components/ui/error-boundary";

const Dashboard = () => {
  return (
    <div className="space-y-6 py-6 sm:py-8 md:py-10">
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-[#fbfaf8]">
        <div className="max-w-3xl">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
            KPI Insights
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Track and analyze your key performance indicators in real-time
          </p>
        </div>
      </div>
      <div className="space-y-6 sm:space-y-8">
        <ErrorBoundary>
          <BusinessMetrics />
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default Dashboard;
