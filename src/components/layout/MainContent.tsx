import { useLocation } from "react-router-dom";
import Dashboard from "@/pages/Dashboard";
import SubmittedForms from "@/pages/SubmittedForms";
import ManagerDashboard from "@/pages/ManagerDashboard";
import Profile from "@/pages/Profile";

const MainContent = () => {
  const location = useLocation();

  const renderContent = () => {
    switch (location.pathname) {
      case '/metrics':
        return <Dashboard />;
      case '/submitted-forms':
        return <SubmittedForms />;
      case '/manager-dashboard':
        return <ManagerDashboard />;
      case '/profile':
        return <Profile />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <main className="flex-1">
      {renderContent()}
    </main>
  );
};

export default MainContent;