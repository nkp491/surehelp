
import { useState } from "react";
import { useTeamManagement } from "@/hooks/useTeamManagement";
import { TeamMember } from "@/types/team";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { UserPlus, MoreHorizontal, UserX, UserCheck } from "lucide-react";
import ProfileAvatar from "@/components/profile/ProfileAvatar";
import { AddTeamMemberDialog } from "./AddTeamMemberDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";

interface TeamMembersListProps {
  teamId?: string;
}

export function TeamMembersList({ teamId }: TeamMembersListProps) {
  const { useTeamMembers, removeTeamMember, updateTeamMemberRole, isLoading } = useTeamManagement();
  const { data: members, isLoading: isLoadingMembers } = useTeamMembers(teamId);
  const [showAddMemberDialog, setShowAddMemberDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Function to format role display
  const formatRoleName = (role: string) => {
    if (role === "beta_user") return "Beta User";
    if (role === "manager_pro_gold") return "Manager Pro Gold";
    if (role === "manager_pro_platinum") return "Manager Pro Platinum";
    if (role === "agent_pro") return "Agent Pro";
    if (role === "manager_pro") return "Manager Pro";
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  // Get badge variant based on role
  const getBadgeVariant = (role: string) => {
    switch (role) {
      case "manager_pro_platinum": return "outline";
      case "manager_pro_gold": return "outline"; 
      case "agent_pro": return "outline";
      case "manager_pro": return "default";
      case "beta_user": return "destructive";
      default: return "secondary";
    }
  };

  // Filter members based on search query
  const filteredMembers = members?.filter(member => {
    const fullName = `${member.first_name || ''} ${member.last_name || ''}`.toLowerCase();
    const email = (member.email || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    
    return fullName.includes(query) || email.includes(query);
  });

  // Handle role update
  const handleRoleUpdate = (memberId: string, role: string) => {
    if (!teamId) return;
    updateTeamMemberRole.mutate({ teamId, memberId, role });
  };

  // Handle member removal
  const handleRemoveMember = (memberId: string) => {
    if (!teamId) return;
    removeTeamMember.mutate({ teamId, memberId });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Team Members</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAddMemberDialog(true)}
          disabled={!teamId}
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Add Member
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Input
            placeholder="Search members by name or email"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-4"
          />

          {isLoadingMembers ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 border rounded-md">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            ))
          ) : filteredMembers?.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              {searchQuery.trim() ? "No members match your search" : "No team members found"}
            </p>
          ) : (
            filteredMembers?.map((member: TeamMember) => (
              <div key={member.id} className="flex items-center justify-between border rounded-md p-3 hover:bg-muted/30">
                <div className="flex items-center gap-3">
                  <ProfileAvatar
                    imageUrl={member.profile_image_url}
                    firstName={member.first_name}
                    className="h-10 w-10"
                  />
                  <div>
                    <p className="font-medium">
                      {member.first_name} {member.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant={getBadgeVariant(member.role)}>
                    {formatRoleName(member.role)}
                  </Badge>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleRoleUpdate(member.id, "agent")}>
                        <UserCheck className="h-4 w-4 mr-2" />
                        Set as Agent
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleRoleUpdate(member.id, "agent_pro")}>
                        <UserCheck className="h-4 w-4 mr-2" />
                        Set as Agent Pro
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleRoleUpdate(member.id, "manager_pro")}>
                        <UserCheck className="h-4 w-4 mr-2" />
                        Set as Manager Pro
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleRemoveMember(member.id)}
                        className="text-destructive"
                      >
                        <UserX className="h-4 w-4 mr-2" />
                        Remove from Team
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
      
      {teamId && (
        <AddTeamMemberDialog
          open={showAddMemberDialog}
          onOpenChange={setShowAddMemberDialog}
          teamId={teamId}
        />
      )}
    </Card>
  );
}
