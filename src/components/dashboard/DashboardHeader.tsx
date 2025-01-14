import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

interface DashboardHeaderProps {
  showSubmissions: boolean;
  onSubmissionsClick: () => void;
  showManagerDashboard: boolean;
  onManagerDashboardClick: () => void;
  showDashboard: boolean;
  onDashboardClick: () => void;
}

const DashboardHeader = ({ 
  showSubmissions, 
  onSubmissionsClick,
  showManagerDashboard,
  onManagerDashboardClick,
  showDashboard,
  onDashboardClick
}: DashboardHeaderProps) => {
  const location = useLocation();
  const isDashboardActive = location.pathname === '/metrics';
  const isManagerDashboardActive = location.pathname === '/manager-dashboard';

  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Business Metrics
        </h1>
        <p className="text-lg text-gray-600">
          Track and manage your key performance indicators
        </p>
      </div>
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onSubmissionsClick}>
          {showSubmissions ? 'Hide' : 'View'} Submissions
        </Button>
        <Button 
          variant={isDashboardActive ? "default" : "outline"}
          onClick={onDashboardClick}
        >
          {isDashboardActive ? 'Hide' : 'View'} Dashboard
        </Button>
        <Button 
          variant={isManagerDashboardActive ? "default" : "outline"}
          onClick={onManagerDashboardClick}
        >
          {isManagerDashboardActive ? 'Hide' : 'View'} Manager Dashboard
        </Button>
        <Button
          onClick={() => window.open('https://insurancetoolkits.com/login', '_blank')}
          className="flex items-center gap-2"
          variant="outline"
        >
          <ExternalLink className="h-4 w-4" />
          Toolkits
        </Button>
      </div>
    </div>
  );
};

export default DashboardHeader;