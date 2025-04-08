
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DeleteTeamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamId: string;
  teamName: string;
  isDeleting: boolean;
  onConfirm: () => Promise<void>;
}

export function DeleteTeamDialog({ 
  open, 
  onOpenChange, 
  teamName, 
  teamId,
  isDeleting,
  onConfirm
}: DeleteTeamDialogProps) {
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDeleteTeam = async () => {
    setDeleteError(null);
    try {
      // First, delete team members
      const { error: membersError } = await supabase
        .from("team_members")
        .delete()
        .eq("team_id", teamId);

      if (membersError) {
        console.error("Error deleting team members:", membersError);
        setDeleteError("Failed to delete team members. Please try again.");
        return;
      }

      // Next, delete any team bulletins
      await supabase.from("team_bulletins").delete().eq("team_id", teamId);

      // Delete team relationships
      await supabase.from("team_relationships").delete().eq("parent_team_id", teamId);
      await supabase.from("team_relationships").delete().eq("child_team_id", teamId);

      // Delete any team invitations
      await supabase.from("team_invitations").delete().eq("team_id", teamId);

      // Finally, delete the team
      const { error: teamError } = await supabase
        .from("teams")
        .delete()
        .eq("id", teamId);

      if (teamError) {
        console.error("Error deleting team:", teamError);
        setDeleteError("Failed to delete team. Please try again.");
        return;
      }

      // Success - call the onConfirm callback
      toast({
        title: "Success",
        description: "Team deleted successfully.",
      });
      await onConfirm();
    } catch (error) {
      console.error("Error in handleDeleteTeam:", error);
      setDeleteError("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            Confirm Team Deletion
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you absolutely sure you want to delete &quot;{teamName}&quot;? 
            This will permanently remove the team, all its members, and relationships.
            This action cannot be undone.
          </AlertDialogDescription>
          {deleteError && (
            <div className="mt-2 text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-md">
              {deleteError}
            </div>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDeleteTeam} 
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Team"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
