import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, FileText, ClipboardList, BarChart, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [profileData, setProfileData] = useState<{
    first_name?: string | null;
    profile_image_url?: string | null;
  }>({});

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

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        const { data, error } = await supabase
          .from('profiles')
          .select('first_name, profile_image_url')
          .eq('id', session.user.id)
          .single();

        if (error) throw error;
        setProfileData(data);
      }
    } catch (error) {
      console.error("Error fetching profile data:", error);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      toast({
        title: "Success",
        description: "Logged out successfully",
      });

      navigate('/auth');
    } catch (error) {
      console.error("Error during logout:", error);
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive",
      });
    }
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Navigation */}
          <div className="flex items-center space-x-8">
            <img 
              src="/lovable-uploads/cb31ac2c-4859-4fad-b7ef-36988cc1dad3.png" 
              alt="SureHelp Logo" 
              className="h-8 w-auto"
            />
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
          </div>

          {/* Profile Section */}
          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger className="focus:outline-none">
                <div className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profileData.profile_image_url || ""} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {profileData.first_name?.[0]?.toUpperCase() || <User className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-gray-700">
                    {profileData.first_name || "Profile"}
                  </span>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;