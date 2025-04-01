
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2, Search } from "lucide-react";
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
import { Input } from "@/components/ui/input";

interface Team {
  id: string;
  name: string;
  created_at: string;
  memberCount?: number;
}

export function TeamManagement() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTeamId, setDeleteTeamId] = useState<string | null>(null);
  const [teamToDelete, setTeamToDelete] = useState<Team | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    setIsLoading(true);
    try {
      // Fetch all teams
      const { data: teamsData, error: teamsError } = await supabase
        .from("teams")
        .select("*")
        .order("name");

      if (teamsError) {
        console.error("Error fetching teams:", teamsError);
        toast({
          title: "Error",
          description: "Failed to load teams. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // For each team, get the member count
      const teamsWithMemberCount = await Promise.all(
        teamsData.map(async (team) => {
          const { count, error: countError } = await supabase
            .from("team_members")
            .select("id", { count: "exact" })
            .eq("team_id", team.id);

          return {
            ...team,
            memberCount: countError ? 0 : count || 0,
          };
        })
      );

      setTeams(teamsWithMemberCount);
    } catch (error) {
      console.error("Error in fetchTeams:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while loading teams.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDeleteTeam = (team: Team) => {
    setTeamToDelete(team);
    setDeleteTeamId(team.id);
  };

  const handleDeleteTeam = async () => {
    if (!deleteTeamId) return;
    
    setIsDeleting(true);
    try {
      // First, delete team members
      const { error: membersError } = await supabase
        .from("team_members")
        .delete()
        .eq("team_id", deleteTeamId);

      if (membersError) {
        console.error("Error deleting team members:", membersError);
        toast({
          title: "Error",
          description: "Failed to delete team members. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Next, delete any team bulletins
      const { error: bulletinsError } = await supabase
        .from("team_bulletins")
        .delete()
        .eq("team_id", deleteTeamId);

      if (bulletinsError) {
        console.error("Error deleting team bulletins:", bulletinsError);
      }

      // Delete team relationships
      const { error: relParentError } = await supabase
        .from("team_relationships")
        .delete()
        .eq("parent_team_id", deleteTeamId);

      if (relParentError) {
        console.error("Error deleting parent team relationships:", relParentError);
      }

      const { error: relChildError } = await supabase
        .from("team_relationships")
        .delete()
        .eq("child_team_id", deleteTeamId);

      if (relChildError) {
        console.error("Error deleting child team relationships:", relChildError);
      }

      // Finally, delete the team
      const { error: teamError } = await supabase
        .from("teams")
        .delete()
        .eq("id", deleteTeamId);

      if (teamError) {
        console.error("Error deleting team:", teamError);
        toast({
          title: "Error",
          description: "Failed to delete team. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Success
      toast({
        title: "Success",
        description: "Team deleted successfully.",
      });

      // Refresh teams list
      fetchTeams();
    } catch (error) {
      console.error("Error deleting team:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while deleting the team.",
        variant: "destructive",
      });
    } finally {
      setDeleteTeamId(null);
      setTeamToDelete(null);
      setIsDeleting(false);
    }
  };

  const filteredTeams = teams.filter(team => 
    team.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Team Management</h2>
            <div className="relative max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search teams..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Team Name</TableHead>
                    <TableHead>Created Date</TableHead>
                    <TableHead>Members</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTeams.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        {searchTerm ? "No teams match your search" : "No teams found"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTeams.map((team) => (
                      <TableRow key={team.id}>
                        <TableCell className="font-medium">{team.name}</TableCell>
                        <TableCell>{formatDate(team.created_at)}</TableCell>
                        <TableCell>{team.memberCount}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="destructive" 
                            size="sm"
                            onClick={() => confirmDeleteTeam(team)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteTeamId} onOpenChange={(open) => !open && setDeleteTeamId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the team &quot;{teamToDelete?.name}&quot; and remove all its members.
              This action cannot be undone.
            </AlertDialogDescription>
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
    </div>
  );
}
