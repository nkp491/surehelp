
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

/**
 * Hook to handle user sign out
 */
export const useSignOut = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error signing out",
        description: "There was a problem signing out. Please try again.",
        variant: "destructive",
      });
    } else {
      navigate("/auth");
    }
  };

  return { signOut };
};
