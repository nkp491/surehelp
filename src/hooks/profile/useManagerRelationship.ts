
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

/**
 * Hook for handling manager relationship in profiles
 */
export const useManagerRelationship = () => {
  const { toast } = useToast();

  /**
   * Check if manager_email column exists in profiles table
   */
  const checkManagerEmailColumn = async () => {
    try {
      // Check if manager_email field exists using a safer approach
      let managerEmailExists = true;
      
      try {
        // Attempt to query a single row with manager_email field as a test
        const testQuery = await supabase
          .from('profiles')
          .select('id')
          .limit(1);
          
        // Check if we can access the field on the result
        const hasField = testQuery.data && 
                         testQuery.data[0] && 
                         'manager_email' in testQuery.data[0];
        
        managerEmailExists = !!hasField;
      } catch (testError: any) {
        // If we get a specific error about the column, it doesn't exist
        if (testError.message && testError.message.includes('column')) {
          managerEmailExists = false;
        }
      }
      
      return managerEmailExists;
    } catch (error) {
      console.error("Error checking manager email column:", error);
      return false;
    }
  };
  
  /**
   * Process manager email update and find the corresponding manager ID
   */
  const processManagerEmail = async (managerEmail: string | null | undefined) => {
    try {
      const managerEmailExists = await checkManagerEmailColumn();
      
      if (!managerEmailExists) {
        console.log("manager_email column doesn't exist, will handle gracefully");
        
        toast({
          title: "Database Update Required",
          description: "Your administrator needs to update the database schema.",
          variant: "destructive",
        });
        
        return { managerEmailExists, reportsTo: null };
      }
      
      console.log("manager_email column exists, proceeding with update");
      
      // Look up the manager's user ID from their email if provided
      if (managerEmail) {
        const { data: managerData, error: managerError } = await supabase
          .from("profiles")
          .select("id")
          .eq("email", managerEmail)
          .single();
        
        if (managerError) {
          console.error("Error finding manager:", managerError);
          return { managerEmailExists, reportsTo: null };
        } else if (managerData) {
          // Found manager, use their ID
          return { managerEmailExists, reportsTo: managerData.id };
        }
      }
      
      // If manager_email is empty or null, or not found
      return { managerEmailExists, reportsTo: null };
    } catch (error) {
      console.error("Error processing manager relationship:", error);
      return { managerEmailExists: false, reportsTo: null };
    }
  };
  
  return {
    checkManagerEmailColumn,
    processManagerEmail
  };
};
