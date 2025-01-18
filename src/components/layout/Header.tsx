import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const Header = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      // First try to sign out locally
      await supabase.auth.signOut({ scope: 'local' }).catch(() => {
        // Ignore error if session is already invalid
        console.log("Local sign out failed, proceeding with cleanup");
      });
      
      // Then clear any remaining session data
      localStorage.removeItem('supabase.auth.token');
      
      toast({
        title: "Success",
        description: "Logged out successfully",
      });
      
      // Use replace to prevent going back to the authenticated state
      navigate("/auth", { replace: true });
    } catch (error) {
      console.error("Error during logout cleanup:", error);
      
      // Ensure we clean up and redirect even if there's an error
      localStorage.removeItem('supabase.auth.token');
      navigate("/auth", { replace: true });
      
      toast({
        title: "Notice",
        description: "You have been logged out",
        variant: "default",
      });
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