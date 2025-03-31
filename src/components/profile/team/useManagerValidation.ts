
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useManagerValidation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const validateManagerEmail = async (email: string) => {
    if (!email.trim()) {
      console.log("Removing manager, setting manager_id to null");
      return { valid: true, managerId: null };
    }
    
    setIsLoading(true);
    
    try {
      console.log("Checking if email exists and belongs to a manager:", email.trim());
      
      // First check if the email exists in profiles
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('email', email.trim())
        .maybeSingle();
        
      if (profileError) {
        console.error("Error checking profile:", profileError);
        throw profileError;
      }
      
      if (!profileData) {
        console.log("Email not found in profiles");
        toast({
          title: "Invalid Manager Email",
          description: "The email provided was not found in our system.",
          variant: "destructive",
        });
        return { valid: false };
      }
      
      // Then check if the user has a manager role in user_roles table
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', profileData.id)
        .or('role.eq.manager_pro,role.eq.manager_pro_gold,role.eq.manager_pro_platinum');
        
      if (roleError) {
        console.error("Error checking roles:", roleError);
        throw roleError;
      }
      
      if (!roleData || roleData.length === 0) {
        console.log("User does not have manager role in user_roles table");
        toast({
          title: "Invalid Manager Email",
          description: "The email provided is not associated with a manager account.",
          variant: "destructive",
        });
        return { valid: false };
      }
      
      console.log("Valid manager found with ID:", profileData.id);
      return { valid: true, managerId: profileData.id };
      
    } catch (error) {
      console.error("Error validating manager:", error);
      toast({
        title: "Error",
        description: "There was a problem validating the manager email. Please try again.",
        variant: "destructive",
      });
      return { valid: false };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    validateManagerEmail,
    isLoading
  };
};
