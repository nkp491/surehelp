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
import { Trash2, Loader2, Search, PlusCircle, Users, User, UserPlus } from "lucide-react";
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
import { useRoleCheck } from "@/hooks/useRoleCheck";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { TeamDetailsDialog } from "./TeamDetailsDialog";

interface TeamManager {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
}

interface TeamCreator {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
}

interface Team {
  id: string;
  name: string;
  created_at: string;
  memberCount?: number;
  managers?: TeamManager[];
  creator?: TeamCreator;
}

export function TeamManagement() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTeamId, setDeleteTeamId] = useState<string | null>(null);
  const [teamToDelete, setTeamToDelete] = useState<Team | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const { toast } = useToast();
  const { hasRequiredRole } = useRoleCheck();
  const isAdmin = hasRequiredRole(['system_admin']);

  useEffect(() => {
    if (isAdmin) {
      fetchTeams();
    }
  }, [isAdmin]);

  const fetchTeams = async () => {
    setIsLoading(true);
    try {
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

      const teamsWithDetails = await Promise.all(
        teamsData.map(async (team) => {
          const { count, error: countError } = await supabase
            .from("team_members")
            .select("id", { count: "exact" })
            .eq("team_id", team.id);

          const { data: teamManagersData, error: managersError } = await supabase
            .from("team_members")
            .select("user_id")
            .eq("team_id", team.id)
            .like("role", "manager%");

          let managers: TeamManager[] = [];
          
          if (teamManagersData && !managersError && teamManagersData.length > 0) {
            const managerIds = teamManagersData.map(m => m.user_id);
            
            const { data: profilesData, error: profilesError } = await supabase
              .from("profiles")
              .select("id, first_name, last_name, email")
              .in("id", managerIds);
              
            if (profilesData && !profilesError) {
              managers = profilesData;
            } else if (profilesError) {
              console.error("Error fetching manager profiles:", profilesError);
            }
          }

          let creator: TeamCreator | undefined;
          
          const { data: earliestMember, error: creatorError } = await supabase
            .from("team_members")
            .select("user_id, created_at")
            .eq("team_id", team.id)
            .order("created_at", { ascending: true })
            .limit(1);
            
          if (earliestMember && earliestMember.length > 0 && !creatorError) {
            const creatorId = earliestMember[0].user_id;
            
            const { data: creatorData, error: creatorProfileError } = await supabase
              .from("profiles")
              .select("id, first_name, last_name, email")
              .eq("id", creatorId)
              .single();
              
            if (creatorData && !creatorProfileError) {
              creator = creatorData;
            } else if (creatorProfileError) {
              console.error("Error fetching creator profile:", creatorProfileError);
            }
          } else if (creatorError) {
            console.error("Error finding team creator:", creatorError);
          }

          return {
            ...team,
            memberCount: countError ? 0 : count || 0,
            managers,
            creator
          };
        })
      );

      setTeams(teamsWithDetails);
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
      const { error: membersError } = await supabase
        .from("team_members")
        .delete()
        .eq("team_id", deleteTeamId);
      
      if (membersError) {
        console.error("Error deleting team members:", membersError);
        
        const { data: { user } } = await supabase.auth.getUser();
        const userId = user?.id;
        
        if (!userId) {
          toast({
            title: "Error",
            description: "User authentication required. Please sign in again.",
            variant: "destructive",
          });
          return;
        }
        
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userId)
          .eq("role", "system_admin");
          
        if (!roleData || roleData.length === 0) {
          toast({
            title: "Error",
            description: "You don't have permission to delete this team.",
            variant: "destructive",
          });
          return;
        }
      }

      await supabase.from("team_bulletins").delete().eq("team_id", deleteTeamId);
      
      await supabase.from("team_relationships").delete().eq("parent_team_id", deleteTeamId);
      await supabase.from("team_relationships").delete().eq("child_team_id", deleteTeamId);
      
      await supabase.from("team_invitations").delete().eq("team_id", deleteTeamId);
      
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

      toast({
        title: "Success",
        description: "Team deleted successfully.",
      });

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

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a team name.",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      const { data, error } = await supabase
        .from("teams")
        .insert([{ name: newTeamName.trim() }])
        .select();

      if (error) {
        console.error("Error creating team:", error);
        toast({
          title: "Error",
          description: "Failed to create team. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Team created successfully.",
      });

      setShowCreateDialog(false);
      setNewTeamName("");
      
      fetchTeams();
    } catch (error) {
      console.error("Error in handleCreateTeam:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while creating the team.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const viewTeamDetails = (team: Team) => {
    setSelectedTeam(team);
    setShowDetailsDialog(true);
  };

  const filteredTeams = teams.filter(team => 
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.managers?.some(manager => 
      `${manager.first_name || ''} ${manager.last_name || ''}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (manager.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    ) ||
    (team.creator && (
      `${team.creator.first_name || ''} ${team.creator.last_name || ''}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (team.creator.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    ))
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getManagerDisplayName = (manager: TeamManager) => {
    const name = [manager.first_name, manager.last_name].filter(Boolean).join(' ');
    return name || manager.email || 'Unknown Manager';
  };

  const getDisplayName = (user?: { first_name: string | null; last_name: string | null; email: string | null }): string => {
    if (!user) return 'Unknown';
    const name = [user.first_name, user.last_name].filter(Boolean).join(' ');
    return name || user.email || 'Unknown';
  };

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <p className="text-muted-foreground">You don't have permission to access this area.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Team Management</h2>
            <div className="flex gap-3">
              <div className="relative max-w-xs">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search teams, managers, or creators..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Button onClick={() => setShowCreateDialog(true)}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Create Team
              </Button>
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
                    <TableHead>Manager(s)</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTeams.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        {searchTerm ? "No teams match your search" : "No teams found"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTeams.map((team) => (
                      <TableRow key={team.id}>
                        <TableCell className="font-medium">
                          <Button
                            variant="link"
                            className="p-0 h-auto font-medium text-left"
                            onClick={() => viewTeamDetails(team)}
                          >
                            {team.name}
                          </Button>
                        </TableCell>
                        <TableCell>{formatDate(team.created_at)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            {team.memberCount}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {team.managers && team.managers.length > 0 ? (
                            <div className="flex flex-col gap-1">
                              {team.managers.slice(0, 2).map((manager, idx) => (
                                <Badge key={idx} variant="secondary" className="max-w-xs truncate flex gap-1 items-center">
                                  <User className="h-3 w-3" />
                                  {getManagerDisplayName(manager)}
                                </Badge>
                              ))}
                              {team.managers.length > 2 && (
                                <Badge variant="outline">+{team.managers.length - 2} more</Badge>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">No managers</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {team.creator ? (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <UserPlus className="h-3 w-3" />
                              {getDisplayName(team.creator)}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">Unknown</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline" 
                              size="sm"
                              onClick={() => viewTeamDetails(team)}
                            >
                              <Users className="h-4 w-4 mr-1" />
                              Details
                            </Button>
                            <Button
                              variant="destructive" 
                              size="sm"
                              onClick={() => confirmDeleteTeam(team)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </div>
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

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Team</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Team name"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              className="w-full"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)} disabled={isCreating}>
              Cancel
            </Button>
            <Button onClick={handleCreateTeam} disabled={isCreating || !newTeamName.trim()}>
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Team"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {selectedTeam && (
        <TeamDetailsDialog 
          open={showDetailsDialog} 
          onOpenChange={setShowDetailsDialog} 
          team={selectedTeam}
          onTeamDeleted={() => {
            setShowDetailsDialog(false);
            fetchTeams();
          }}
        />
      )}
    </div>
  );
}
