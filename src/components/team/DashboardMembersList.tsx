
import { useState } from "react";
import { useTeamManagement } from "@/hooks/useTeamManagement";
import { TeamMember } from "@/types/team";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserPlus, Settings } from "lucide-react";
import ProfileAvatar from "@/components/profile/ProfileAvatar";
import { AddTeamMemberDialog } from "./AddTeamMemberDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";

interface DashboardMembersListProps {
  teamId?: string;
}

export function DashboardMembersList({ teamId }: DashboardMembersListProps) {
  const { useTeamMembers } = useTeamManagement();
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

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex-1">Team Members</CardTitle>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
          >
            <Settings className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddMemberDialog(true)}
            disabled={!teamId}
            className="h-8"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Input
            placeholder="Search members"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-4"
          />

          {isLoadingMembers ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 border rounded-md">
                <Skeleton className="h-8 w-8 rounded-full" />
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
            <div className="space-y-2">
              {filteredMembers?.slice(0, 5).map((member: TeamMember) => (
                <div key={member.id} className="flex items-center justify-between border rounded-md p-2 hover:bg-muted/30">
                  <div className="flex items-center gap-2">
                    <ProfileAvatar
                      imageUrl={member.profile_image_url}
                      firstName={member.first_name}
                      className="h-8 w-8"
                    />
                    <div>
                      <p className="font-medium text-sm">
                        {member.first_name} {member.last_name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                        {member.email}
                      </p>
                    </div>
                  </div>
                  
                  <Badge variant={getBadgeVariant(member.role)} className="text-xs">
                    {formatRoleName(member.role)}
                  </Badge>
                </div>
              ))}
              
              {filteredMembers && filteredMembers.length > 5 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full text-xs text-muted-foreground"
                >
                  View all {filteredMembers.length} members
                </Button>
              )}
            </div>
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
