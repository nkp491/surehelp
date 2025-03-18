
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
  const { createTeam, updateTeam, isLoading } = useTeamManagement();
  const [teamName, setTeamName] = useState(initialName);
  const { toast } = useToast();
  const [internalLoading, setInternalLoading] = useState(false);
  
  const isEditMode = !!teamId;
  const dialogTitle = isEditMode ? "Edit Team" : "Create Team";
  const dialogDescription = isEditMode
    ? "Update your team's name."
    : "Create a new team to manage your agents.";
  const buttonText = isEditMode ? "Update Team" : "Create Team";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) return;
    
    try {
      setInternalLoading(true);
      console.log("Submitting team form:", { teamName, isEditMode, teamId });
      
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
        
        toast({
          title: "Team created",
          description: "Your new team has been created successfully.",
        });
      }
      
      setTeamName("");
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error in team operation:", error);
      
      // Show a detailed toast with the error message
      toast({
        title: isEditMode ? "Error updating team" : "Error creating team",
        description: error.message || "There was a problem with the team operation. Please try again.",
        variant: "destructive",
      });
      // Dialog stays open if there's an error
    } finally {
      setInternalLoading(false);
    }
  };

  const closeDialog = () => {
    if (!isLoading && !internalLoading) {
      setTeamName(initialName);
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
