
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
      if (isEditMode && teamId) {
        await updateTeam.mutateAsync({ teamId, name: teamName });
      } else {
        await createTeam.mutateAsync(teamName);
      }
      
      setTeamName("");
      onOpenChange(false);
    } catch (error) {
      console.error("Error in team operation:", error);
      // Dialog stays open if there's an error
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      // Only allow closing if not loading
      if (!isLoading || !isOpen) {
        onOpenChange(isOpen);
      }
    }}>
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
                disabled={isLoading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !teamName.trim()}>
              {isLoading ? (
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
