
import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Trash2, Mail, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

interface TeamManager {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
}

interface TeamMember {
  id: string;
  user_id: string;
  team_id: string;
  role: string;
  created_at: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  profile_image_url: string | null;
}

interface Team {
  id: string;
  name: string;
  created_at: string;
  memberCount?: number;
  managers?: TeamManager[];
}

interface TeamDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  team: Team;
  onTeamDeleted: () => void;
}

export function TeamDetailsDialog({ 
  open, 
  onOpenChange, 
  team,
  onTeamDeleted
}: TeamDetailsDialogProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [relatedTeams, setRelatedTeams] = useState<{id: string, name: string, relationship: string}[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  // Fetch team details when dialog opens
  useEffect(() => {
    if (open && team) {
      fetchTeamDetails();
    }
  }, [open, team]);

  const fetchTeamDetails = async () => {
    setIsLoading(true);
    try {
      // Fetch team members - Using separate queries to avoid relationship errors
      const { data: membersData, error: membersError } = await supabase
        .from("team_members")
        .select("*")
        .eq("team_id", team.id);

      if (membersError) {
        console.error("Error fetching team members:", membersError);
        toast({
          title: "Error",
          description: "Failed to load team members.",
          variant: "destructive",
        });
      } else {
        // Get member profiles separately
        const userIds = membersData.map(member => member.user_id);
        
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("id, first_name, last_name, email, profile_image_url")
          .in("id", userIds);
        
        if (profilesError) {
          console.error("Error fetching member profiles:", profilesError);
        } else {
          // Join the data manually
          const formattedMembers = membersData.map(member => {
            const profile = profilesData?.find(p => p.id === member.user_id) || {};
            return {
              ...member,
              first_name: profile.first_name,
              last_name: profile.last_name,
              email: profile.email,
              profile_image_url: profile.profile_image_url
            };
          });
          
          setTeamMembers(formattedMembers);
        }
      }

      // Fetch related teams (parent teams) - Using explicit column specifications
      const { data: parentRelations, error: parentError } = await supabase
        .from("team_relationships")
        .select("parent_team_id")
        .eq("child_team_id", team.id);

      // Fetch parent team details separately
      let parentTeams: {id: string, name: string, relationship: string}[] = [];
      
      if (parentRelations && !parentError && parentRelations.length > 0) {
        const parentIds = parentRelations.map(relation => relation.parent_team_id);
        
        const { data: parentTeamsData, error: parentTeamsError } = await supabase
          .from("teams")
          .select("id, name")
          .in("id", parentIds);
          
        if (parentTeamsData && !parentTeamsError) {
          parentTeams = parentTeamsData.map(team => ({
            id: team.id,
            name: team.name,
            relationship: 'Parent'
          }));
        } else if (parentTeamsError) {
          console.error("Error fetching parent teams:", parentTeamsError);
        }
      }

      // Fetch related teams (child teams) - Using explicit column specifications
      const { data: childRelations, error: childError } = await supabase
        .from("team_relationships")
        .select("child_team_id")
        .eq("parent_team_id", team.id);

      // Fetch child team details separately
      let childTeams: {id: string, name: string, relationship: string}[] = [];
      
      if (childRelations && !childError && childRelations.length > 0) {
        const childIds = childRelations.map(relation => relation.child_team_id);
        
        const { data: childTeamsData, error: childTeamsError } = await supabase
          .from("teams")
          .select("id, name")
          .in("id", childIds);
          
        if (childTeamsData && !childTeamsError) {
          childTeams = childTeamsData.map(team => ({
            id: team.id,
            name: team.name,
            relationship: 'Child'
          }));
        } else if (childTeamsError) {
          console.error("Error fetching child teams:", childTeamsError);
        }
      }

      if (!parentError && !childError) {
        // Combine both parent and child teams
        setRelatedTeams([...parentTeams, ...childTeams]);
      } else {
        console.error("Error fetching related teams:", parentError || childError);
      }
    } catch (error) {
      console.error("Error in fetchTeamDetails:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTeam = async () => {
    setIsDeleting(true);
    try {
      // First, delete team members
      const { error: membersError } = await supabase
        .from("team_members")
        .delete()
        .eq("team_id", team.id);

      if (membersError) {
        console.error("Error deleting team members:", membersError);
        toast({
          title: "Error",
          description: "Failed to delete team members.",
          variant: "destructive",
        });
        return;
      }

      // Next, delete any team bulletins
      const { error: bulletinsError } = await supabase
        .from("team_bulletins")
        .delete()
        .eq("team_id", team.id);

      if (bulletinsError) {
        console.error("Error deleting team bulletins:", bulletinsError);
      }

      // Delete team relationships
      const { error: relParentError } = await supabase
        .from("team_relationships")
        .delete()
        .eq("parent_team_id", team.id);

      if (relParentError) {
        console.error("Error deleting parent team relationships:", relParentError);
      }

      const { error: relChildError } = await supabase
        .from("team_relationships")
        .delete()
        .eq("child_team_id", team.id);

      if (relChildError) {
        console.error("Error deleting child team relationships:", relChildError);
      }

      // Delete any team invitations
      const { error: invitationsError } = await supabase
        .from("team_invitations")
        .delete()
        .eq("team_id", team.id);

      if (invitationsError) {
        console.error("Error deleting team invitations:", invitationsError);
      }

      // Finally, delete the team
      const { error: teamError } = await supabase
        .from("teams")
        .delete()
        .eq("id", team.id);

      if (teamError) {
        console.error("Error deleting team:", teamError);
        toast({
          title: "Error",
          description: "Failed to delete team.",
          variant: "destructive",
        });
        return;
      }

      // Success
      toast({
        title: "Success",
        description: "Team deleted successfully.",
      });

      // Close dialogs and notify parent
      setShowDeleteConfirm(false);
      onOpenChange(false);
      onTeamDeleted();
    } catch (error) {
      console.error("Error deleting team:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while deleting the team.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    if (!firstName && !lastName) return '??';
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const getDisplayName = (member: TeamMember) => {
    const name = [member.first_name, member.last_name].filter(Boolean).join(' ');
    return name || member.email || 'Unknown User';
  };

  const getRoleBadgeVariant = (role: string) => {
    if (role.includes('manager_pro_platinum')) return "default";
    if (role.includes('manager_pro_gold')) return "warning";
    if (role.includes('manager_pro')) return "outline";
    if (role.includes('agent_pro')) return "secondary";
    return "secondary";
  };

  const getRoleDisplayName = (role: string) => {
    if (role === 'manager_pro_platinum') return 'Manager Pro Platinum';
    if (role === 'manager_pro_gold') return 'Manager Pro Gold';
    if (role === 'manager_pro') return 'Manager Pro';
    if (role === 'agent_pro') return 'Agent Pro';
    if (role === 'agent') return 'Agent';
    return role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center justify-between">
              <span>Team Details: {team.name}</span>
              <Badge variant="outline">
                Created {formatDate(team.created_at)}
              </Badge>
            </DialogTitle>
          </DialogHeader>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Tabs defaultValue="members">
              <TabsList className="mb-4">
                <TabsTrigger value="members">Members ({teamMembers.length})</TabsTrigger>
                <TabsTrigger value="relations">Related Teams ({relatedTeams.length})</TabsTrigger>
                <TabsTrigger value="summary">Summary</TabsTrigger>
              </TabsList>
              
              <TabsContent value="members">
                <div className="rounded-md border max-h-[400px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Joined</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {teamMembers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                            This team has no members
                          </TableCell>
                        </TableRow>
                      ) : (
                        teamMembers.map((member) => (
                          <TableRow key={member.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={member.profile_image_url || undefined} />
                                  <AvatarFallback>
                                    {getInitials(member.first_name, member.last_name)}
                                  </AvatarFallback>
                                </Avatar>
                                <span>{getDisplayName(member)}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {member.email ? (
                                <div className="flex items-center gap-1">
                                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                                  <span className="text-sm">{member.email}</span>
                                </div>
                              ) : (
                                <span className="text-muted-foreground text-sm">No email</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant={getRoleBadgeVariant(member.role)}>
                                {getRoleDisplayName(member.role)}
                              </Badge>
                            </TableCell>
                            <TableCell>{formatDate(member.created_at)}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
              
              <TabsContent value="relations">
                <div className="rounded-md border max-h-[400px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Team Name</TableHead>
                        <TableHead>Relationship</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {relatedTeams.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={2} className="text-center py-8 text-muted-foreground">
                            This team has no relationships with other teams
                          </TableCell>
                        </TableRow>
                      ) : (
                        relatedTeams.map((relTeam, index) => (
                          <TableRow key={index}>
                            <TableCell>{relTeam.name}</TableCell>
                            <TableCell>
                              <Badge variant={relTeam.relationship === 'Parent' ? 'default' : 'secondary'}>
                                {relTeam.relationship}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
              
              <TabsContent value="summary">
                <Card>
                  <CardHeader>
                    <CardTitle>Team Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Team Name</h4>
                        <p className="text-lg font-semibold">{team.name}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Created At</h4>
                        <p className="text-lg font-semibold">{formatDate(team.created_at)}</p>
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Membership Summary</h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-muted rounded-md p-3 text-center">
                          <p className="text-2xl font-bold">{teamMembers.length}</p>
                          <p className="text-sm text-muted-foreground">Total Members</p>
                        </div>
                        <div className="bg-muted rounded-md p-3 text-center">
                          <p className="text-2xl font-bold">
                            {teamMembers.filter(m => m.role.includes('manager')).length}
                          </p>
                          <p className="text-sm text-muted-foreground">Managers</p>
                        </div>
                        <div className="bg-muted rounded-md p-3 text-center">
                          <p className="text-2xl font-bold">
                            {teamMembers.filter(m => m.role.includes('agent')).length}
                          </p>
                          <p className="text-sm text-muted-foreground">Agents</p>
                        </div>
                      </div>
                    </div>
                    {relatedTeams.length > 0 && (
                      <>
                        <Separator />
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-2">Team Relationships</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-muted rounded-md p-3 text-center">
                              <p className="text-2xl font-bold">
                                {relatedTeams.filter(t => t.relationship === 'Parent').length}
                              </p>
                              <p className="text-sm text-muted-foreground">Parent Teams</p>
                            </div>
                            <div className="bg-muted rounded-md p-3 text-center">
                              <p className="text-2xl font-bold">
                                {relatedTeams.filter(t => t.relationship === 'Child').length}
                              </p>
                              <p className="text-sm text-muted-foreground">Child Teams</p>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
          
          <DialogFooter className="gap-2">
            <div className="flex-1 text-left">
              <Button
                variant="destructive"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isLoading}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Team
              </Button>
            </div>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Confirm Team Deletion
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you absolutely sure you want to delete &quot;{team.name}&quot;? 
              This will permanently remove the team, all its members, and relationships.
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
    </>
  );
}
