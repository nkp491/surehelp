import { useLocation } from "react-router-dom";
import { MetricsProvider } from "@/contexts/MetricsContext";
import MetricsSection from "@/components/dashboard/MetricsSection";
import Dashboard from "@/pages/Dashboard";
import SubmittedForms from "@/pages/SubmittedForms";
import ManagerDashboard from "@/pages/ManagerDashboard";
import AssessmentFormSection from "@/components/dashboard/AssessmentFormSection";
import { Separator } from "@/components/ui/separator";

interface MainContentProps {
  isFormOpen: boolean;
  setIsFormOpen: (isOpen: boolean) => void;
}

const MainContent = ({ isFormOpen, setIsFormOpen }: MainContentProps) => {
  const location = useLocation();

  return (
    <div className="container mx-auto py-8">
      <MetricsProvider>
        <div className="space-y-8">
          {location.pathname === '/' && <MetricsSection />}
          {location.pathname === '/metrics' && <Dashboard />}
          {location.pathname === '/submitted-forms' && <SubmittedForms />}
          {location.pathname === '/manager-dashboard' && <ManagerDashboard />}
        </div>
      </MetricsProvider>

      <Separator className="my-12" />
      
      <AssessmentFormSection 
        isFormOpen={isFormOpen}
        setIsFormOpen={setIsFormOpen}
      />
    </div>
  );
};

export default MainContent;