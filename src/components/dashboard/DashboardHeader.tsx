import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { FileText } from "lucide-react";

interface DashboardHeaderProps {
  showSubmissions: boolean;
  onSubmissionsClick: () => void;
  showManagerDashboard: boolean;
  onManagerDashboardClick: () => void;
  showDashboard: boolean;
  onDashboardClick: () => void;
  showAssessment: boolean;
  onAssessmentClick: () => void;
}

const DashboardHeader = ({
  showSubmissions,
  onSubmissionsClick,
  showManagerDashboard,
  onManagerDashboardClick,
  showDashboard,
  onDashboardClick,
  showAssessment,
  onAssessmentClick,
}: DashboardHeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();

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
        onClick={onSubmissionsClick}
        className="min-w-[120px]"
      >
        Submissions
      </Button>
      <Button
        variant={showManagerDashboard ? "default" : "outline"}
        onClick={onManagerDashboardClick}
        className="min-w-[120px]"
      >
        Manager
      </Button>
      <Button
        variant={showAssessment ? "default" : "outline"}
        onClick={onAssessmentClick}
        className="min-w-[120px] flex items-center gap-2"
      >
        <FileText className="h-4 w-4" />
        Assessment
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