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

  const clearAllStorageAndCookies = () => {
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('supabase.auth.')) {
          localStorage.removeItem(key);
        }
      });
      
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });

      sessionStorage.clear();
    } catch (error) {
      console.error("Error clearing storage:", error);
    }
  };

  const handleLogout = async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Session check error:", sessionError);
        clearAllStorageAndCookies();
        window.location.replace('/auth');
        return;
      }

      if (!session) {
        console.log("No active session found");
        clearAllStorageAndCookies();
        window.location.replace('/auth');
        return;
      }

      const { error: signOutError } = await supabase.auth.signOut({
        scope: 'local'
      });

      if (signOutError) {
        console.error("Sign out error:", signOutError);
        clearAllStorageAndCookies();
        window.location.replace('/auth');
        return;
      }

      toast({
        title: "Success",
        description: "Logged out successfully",
      });

      clearAllStorageAndCookies();
      window.location.replace('/auth');
    } catch (error) {
      console.error("Error during logout:", error);
      clearAllStorageAndCookies();
      window.location.replace('/auth');
    }
  };

  return (
    <div className="bg-gray-50 p-4 flex justify-between items-center">
      <img 
        src="/lovable-uploads/cb31ac2c-4859-4fad-b7ef-36988cc1dad3.png" 
        alt="SureHelp Logo" 
        className="h-16 object-contain"
      />
      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger className="focus:outline-none">
            <Avatar className="h-10 w-10">
              <AvatarImage src={profileData.profile_image_url || ""} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {profileData.first_name?.[0]?.toUpperCase() || <User className="h-6 w-6" />}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigate("/profile")}>
              Profile Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default Header;