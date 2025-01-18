import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const Header = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      // First check if we have a valid session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // Only attempt to sign out if we have a valid session
        await supabase.auth.signOut();
      }
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      // Always clean up, regardless of session state or errors
      
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
      
      // Force a full page reload to clear any cached state
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