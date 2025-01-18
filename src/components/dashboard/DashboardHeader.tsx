import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";

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
  onDashboardClick,
}: DashboardHeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleMetricsClick = () => {
    onDashboardClick();
    if (location.pathname !== '/metrics') {
      navigate('/metrics');
    } else {
      navigate('/');
    }
  };

  const handleSubmissionsClick = () => {
    onSubmissionsClick();
    if (location.pathname !== '/submitted-forms') {
      navigate('/submitted-forms');
    } else {
      navigate('/');
    }
  };

  const handleManagerClick = () => {
    onManagerDashboardClick();
    if (location.pathname !== '/manager-dashboard') {
      navigate('/manager-dashboard');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="flex flex-wrap gap-4 mb-8">
      <Button
        variant={showDashboard ? "default" : "outline"}
        onClick={handleMetricsClick}
        className="min-w-[120px]"
      >
        Metrics
      </Button>
      <Button
        variant={showSubmissions ? "default" : "outline"}
        onClick={handleSubmissionsClick}
        className="min-w-[120px]"
      >
        Submissions
      </Button>
      <Button
        variant={showManagerDashboard ? "default" : "outline"}
        onClick={handleManagerClick}
        className="min-w-[120px]"
      >
        Manager
      </Button>
      <Button
        variant={location.pathname === '/profile' ? "default" : "outline"}
        onClick={() => navigate("/profile")}
        className="min-w-[120px]"
      >
        Profile
      </Button>
    </div>
  );
};

export default DashboardHeader;