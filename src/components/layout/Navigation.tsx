import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;

  const navigationItems = [
    { label: 'Assessment', path: '/assessment' },
    { label: 'Submission', path: '/submitted-forms' },
    { label: 'Dashboard', path: '/metrics' },
    { label: 'Team', path: '/manager-dashboard' },
  ];

  return (
    <nav className="flex gap-8">
      {navigationItems.map(({ label, path }) => (
        <button
          key={path}
          onClick={() => navigate(path)}
          className={`text-lg font-medium ${
            isActive(path) 
              ? 'text-[#2A6F97]' 
              : 'text-[#808080] hover:text-[#2A6F97]'
          }`}
        >
          {label}
        </button>
      ))}
    </nav>
  );
};

export default Navigation;