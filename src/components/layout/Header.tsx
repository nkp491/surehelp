import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User } from "lucide-react";
import { useEffect, useState } from "react";

const Header = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profileData, setProfileData] = useState<{
    first_name?: string | null;
    profile_image_url?: string | null;
  }>({});

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
          {/* Logo and Left Navigation */}
          <div className="flex items-center space-x-8">
            <img 
              src="/lovable-uploads/cb31ac2c-4859-4fad-b7ef-36988cc1dad3.png" 
              alt="SureHelp Logo" 
              className="h-8 w-auto"
            />
            <nav className="hidden md:flex space-x-8">
              <button 
                onClick={() => navigate('/metrics')}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
              >
                Support
              </button>
              <button 
                onClick={() => navigate('/submitted-forms')}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
              >
                Forms
              </button>
              <button 
                onClick={() => navigate('/manager-dashboard')}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
              >
                Dashboard
              </button>
            </nav>
          </div>

          {/* Right side - Profile */}
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