import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileText, ClipboardList, BarChart, Users } from "lucide-react";
import { useEffect, useState } from "react";

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [showAssessment, setShowAssessment] = useState(false);
  const [showSubmissions, setShowSubmissions] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showManagerDashboard, setShowManagerDashboard] = useState(false);

  useEffect(() => {
    setShowAssessment(location.pathname === '/assessment');
    setShowSubmissions(location.pathname === '/submitted-forms');
    setShowDashboard(location.pathname === '/metrics');
    setShowManagerDashboard(location.pathname === '/manager-dashboard');
  }, [location.pathname]);

  return (
    <nav className="hidden md:flex space-x-4">
      <Button
        variant={showAssessment ? "default" : "outline"}
        onClick={() => navigate('/assessment')}
        className="min-w-[120px] flex items-center gap-2"
      >
        <FileText className="h-4 w-4" />
        Assessment
      </Button>
      <Button
        variant={showSubmissions ? "default" : "outline"}
        onClick={() => navigate('/submitted-forms')}
        className="min-w-[120px] flex items-center gap-2"
      >
        <ClipboardList className="h-4 w-4" />
        Submissions
      </Button>
      <Button
        variant={showDashboard ? "default" : "outline"}
        onClick={() => navigate('/metrics')}
        className="min-w-[120px] flex items-center gap-2"
      >
        <BarChart className="h-4 w-4" />
        Dashboard
      </Button>
      <Button
        variant={showManagerDashboard ? "default" : "outline"}
        onClick={() => navigate('/manager-dashboard')}
        className="min-w-[120px] flex items-center gap-2"
      >
        <Users className="h-4 w-4" />
        Team
      </Button>
    </nav>
  );
};

export default Navigation;