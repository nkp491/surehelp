
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/types/profile";

interface DebugToolsProps {
  profile: Profile | null;
  isSyncing: boolean;
  forceProfileSync: (userId: string) => Promise<boolean>;
}

const DebugTools = ({ profile, isSyncing, forceProfileSync }: DebugToolsProps) => {
  const { toast } = useToast();

  const handleForceSync = async () => {
    if (!profile?.id) {
      toast({
        title: "Error",
        description: "No active user profile found",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const syncResult = await forceProfileSync(profile.id);
      
      if (syncResult) {
        toast({
          title: "Success",
          description: "Profile data synchronized successfully with auth metadata.",
        });
      } else {
        toast({
          title: "Warning",
          description: "Synchronization may not have completed successfully. Please check logs.",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      console.error("Profile sync error:", err);
      toast({
        title: "Error",
        description: err.message || "An unknown error occurred during synchronization",
        variant: "destructive",
      });
    }
  };

  const logCurrentState = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Error",
          description: "No active session found",
          variant: "destructive",
        });
        return;
      }
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error("Error fetching user metadata:", userError);
        toast({
          title: "Error",
          description: `Failed to fetch user data: ${userError.message}`,
          variant: "destructive",
        });
        return;
      }
      
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();
        
      if (profileError) {
        console.error("Error fetching profile data:", profileError);
        toast({
          title: "Error", 
          description: `Failed to fetch profile data: ${profileError.message}`,
          variant: "destructive",
        });
        return;
      }
      
      console.log("==== DEBUG INFO ====");
      console.log("Auth user metadata:", user?.user_metadata);
      console.log("Profiles table data:", profileData);
      console.log("Current profile state:", profile);
      console.log("===================");
      
      toast({
        title: "Debug Info",
        description: "Check console for current state information.",
      });
    } catch (err: any) {
      console.error("Debug error:", err);
      toast({
        title: "Error",
        description: err.message || "An unknown error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="mt-8 p-4 border border-gray-200 rounded-md">
      <h3 className="text-lg font-medium mb-2">Debug Tools</h3>
      <div className="flex flex-wrap gap-3">
        <Button 
          variant="outline" 
          onClick={handleForceSync}
          disabled={isSyncing}
          className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 flex items-center"
        >
          {isSyncing && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
          Force Sync Profile Data
        </Button>
        
        <Button 
          variant="outline" 
          onClick={logCurrentState}
          className="bg-blue-100 hover:bg-blue-200 text-blue-800"
        >
          Log Current State
        </Button>
      </div>
      <p className="text-sm text-gray-500 mt-2">
        These tools help debug profile synchronization issues between auth.users metadata and the profiles table.
      </p>
    </div>
  );
};

export default DebugTools;
