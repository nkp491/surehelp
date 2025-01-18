import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

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

  return (
    <div className="flex flex-wrap gap-4 mb-8">
      <Button
        variant={showDashboard ? "default" : "outline"}
        onClick={onDashboardClick}
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
        variant="outline"
        onClick={() => navigate("/profile")}
        className="min-w-[120px]"
      >
        Profile
      </Button>
    </div>
  );
};

export default DashboardHeader;