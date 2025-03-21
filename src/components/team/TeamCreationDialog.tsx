
import { useState } from "react";
import { useTeamManagement } from "@/hooks/useTeamManagement";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";

interface TeamCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamId?: string;
  initialName?: string;
}

export function TeamCreationDialog({ 
  open, 
  onOpenChange, 
  teamId, 
  initialName = "" 
}: TeamCreationDialogProps) {
  const { createTeam, updateTeam, refreshTeams, isLoading } = useTeamManagement();
  const [teamName, setTeamName] = useState(initialName);
  const { toast } = useToast();
  const [internalLoading, setInternalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const isEditMode = !!teamId;
  const dialogTitle = isEditMode ? "Edit Team" : "Create Team";
  const dialogDescription = isEditMode
    ? "Update your team's name."
    : "Create a new team to manage your agents.";
  const buttonText = isEditMode ? "Update Team" : "Create Team";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) return;
    
    // Reset error state
    setError(null);
    
    try {
      setInternalLoading(true);
      console.log("Submitting team form:", { teamName, isEditMode, teamId });
      
      // Check if user is authenticated first
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error("Authentication error:", authError || "No user found");
        throw new Error("You must be logged in to create a team. Please sign in.");
      }
      
      if (isEditMode && teamId) {
        await updateTeam.mutateAsync({ teamId, name: teamName });
        toast({
          title: "Team updated",
          description: "Your team has been updated successfully.",
        });
      } else {
        console.log("Creating new team with name:", teamName);
        const result = await createTeam.mutateAsync(teamName);
        console.log("Team creation result:", result);
        
        // Refresh immediately after creating
        await refreshTeams();
        
        toast({
          title: "Team created",
          description: `Your new team "${teamName}" has been created successfully.`,
        });
      }
      
      setTeamName("");
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error in team operation:", error);
      
      // Set local error state for display in the dialog
      setError(error.message || "There was a problem with the team operation. Please try again.");
      
      // Show toast only for non-RLS errors
      if (!error.message?.includes("violates row-level security policy")) {
        toast({
          title: isEditMode ? "Error updating team" : "Error creating team",
          description: error.message || "There was a problem with the team operation. Please try again.",
          variant: "destructive",
        });
      }
      // Dialog stays open if there's an error
    } finally {
      setInternalLoading(false);
    }
  };

  const closeDialog = () => {
    if (!isLoading && !internalLoading) {
      setTeamName(initialName);
      setError(null);
      onOpenChange(false);
    }
  };

  const isSubmitDisabled = isLoading || internalLoading || !teamName.trim();
  const showLoading = isLoading || internalLoading;

  return (
    <Dialog open={open} onOpenChange={closeDialog}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogDescription>
              {dialogDescription}
            </DialogDescription>
          </DialogHeader>
          
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="team-name">Team Name</Label>
              <Input
                id="team-name"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Enter team name"
                autoFocus
                required
                disabled={showLoading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={closeDialog}
              disabled={showLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitDisabled}>
              {showLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditMode ? "Updating..." : "Creating..."}
                </>
              ) : (
                buttonText
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
