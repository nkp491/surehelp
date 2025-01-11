import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

interface DashboardHeaderProps {
  showSubmissions: boolean;
  onSubmissionsClick: () => void;
  showManagerDashboard: boolean;
  onManagerDashboardClick: () => void;
}

const DashboardHeader = ({ 
  showSubmissions, 
  onSubmissionsClick,
  showManagerDashboard,
  onManagerDashboardClick 
}: DashboardHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
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
        <Link to="/metrics">
          <Button variant="outline">Dashboard</Button>
        </Link>
        <Button variant="outline" onClick={onManagerDashboardClick}>
          {showManagerDashboard ? 'Hide' : 'View'} Manager Dashboard
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