import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const Header = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const clearAllStorageAndCookies = () => {
    try {
      // Clear ALL Supabase-related items from localStorage
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('supabase.auth.')) {
          localStorage.removeItem(key);
        }
      });
      
      // Clear any session cookies
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });

      // Clear session storage
      sessionStorage.clear();
    } catch (error) {
      console.error("Error clearing storage:", error);
    }
  };

  const handleLogout = async () => {
    try {
      // First try to get the current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Session check error:", sessionError);
        // If there's a session error, just clear everything and redirect
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

      // If we have a valid session, try to sign out
      const { error: signOutError } = await supabase.auth.signOut({
        scope: 'local'
      });

      if (signOutError) {
        console.error("Sign out error:", signOutError);
        // Even if sign out fails, clear local data
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
      // If anything fails, make sure we clear everything and redirect
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
      <button
        onClick={handleLogout}
        className="text-[#D9D9D9] hover:text-[#D9D9D9]/80 transition-colors"
      >
        Logout
      </button>
    </div>
  );
};

export default Header;