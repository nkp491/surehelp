import BusinessMetrics from "@/components/BusinessMetrics";
import { ErrorBoundary } from "@/components/ui/error-boundary";

const Dashboard = () => {
  return (
    <div className="py-6 sm:py-8 md:py-10">
      <div className="p-4 sm:p-6 rounded-lg">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
          KPI Insights
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          Track and analyze your key performance indicators in real-time
        </p>
      </div>
      <ErrorBoundary>
        <BusinessMetrics />
      </ErrorBoundary>
    </div>
  );
};

export default Dashboard;
