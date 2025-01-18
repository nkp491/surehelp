import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const Header = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      // First try to sign out locally and globally to ensure complete session cleanup
      await Promise.all([
        supabase.auth.signOut({ scope: 'local' }).catch(() => {
          console.log("Local sign out failed, proceeding with cleanup");
        }),
        supabase.auth.signOut({ scope: 'global' }).catch(() => {
          console.log("Global sign out failed, proceeding with cleanup");
        })
      ]);
      
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
      
      toast({
        title: "Success",
        description: "Logged out successfully",
      });
      
      // Force reload to clear any cached state
      window.location.href = '/auth';
    } catch (error) {
      console.error("Error during logout cleanup:", error);
      
      // Ensure we clean up and redirect even if there's an error
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('supabase.auth.')) {
          localStorage.removeItem(key);
        }
      });
      
      window.location.href = '/auth';
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