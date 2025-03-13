
import { useRoleCheck } from "@/hooks/useRoleCheck";
import BusinessMetrics from "@/components/BusinessMetrics";
import { UpgradePrompt } from "@/components/common/UpgradePrompt";

const Dashboard = () => {
  const { hasRequiredRole } = useRoleCheck();
  
  // Check if user has access to advanced metrics
  const hasAdvancedMetricsAccess = hasRequiredRole([
    'agent_pro', 'manager_pro', 'manager_pro_gold', 'manager_pro_platinum', 'beta_user', 'system_admin'
  ]);

  return (
    <div className="space-y-6 py-6 sm:py-8 md:py-10">
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-[#fbfaf8]">
        <div className="max-w-3xl">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">Track and analyze your key performance indicators in real-time</p>
        </div>
      </div>
      <div className="space-y-6 sm:space-y-8">
        <BusinessMetrics />
        
        {!hasAdvancedMetricsAccess && (
          <div className="mt-6">
            <UpgradePrompt
              title="Advanced Analytics"
              description="Upgrade to Agent Pro to unlock advanced analytics, historical trending, and performance insights to boost your business."
              requiredRole="agent_pro"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
