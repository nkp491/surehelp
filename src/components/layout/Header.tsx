import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const Header = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      // First clear local storage
      localStorage.removeItem('supabase.auth.token');
      
      // Then sign out locally first
      await supabase.auth.signOut({ scope: 'local' });
      
      toast({
        title: "Success",
        description: "Logged out successfully",
      });
      
      navigate("/auth", { replace: true });
    } catch (error) {
      console.error("Error logging out:", error);
      // Even if there's an error, we want to clear local state and redirect
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