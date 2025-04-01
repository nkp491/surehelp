
import { useState, useEffect } from "react";
import { useManagerTeam } from "@/hooks/useManagerTeam";
import { Profile } from "@/types/profile";
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
import { UserX, MoreHorizontal, RefreshCw } from "lucide-react";
import ProfileAvatar from "@/components/profile/ProfileAvatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface ManagerTeamListProps {
  managerId?: string;
}

export function ManagerTeamList({ managerId }: ManagerTeamListProps) {
  const { teamMembers, isLoading, updateTeamMemberManager, refetch } = useManagerTeam(managerId);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  // Force refresh on component mount to ensure data is current
  useEffect(() => {
    if (managerId) {
      refetch();
    }
  }, [managerId, refetch]);

  // Function to format role display
  const formatRoleName = (role: string | null) => {
    if (!role) return "User";
    if (role === "beta_user") return "Beta User";
    if (role === "manager_pro_gold") return "Manager Pro Gold";
    if (role === "manager_pro_platinum") return "Manager Pro Platinum";
    if (role === "agent_pro") return "Agent Pro";
    if (role === "manager_pro") return "Manager Pro";
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  // Get badge variant based on role
  const getBadgeVariant = (role: string | null) => {
    if (!role) return "secondary";
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
  const filteredMembers = teamMembers?.filter(member => {
    const fullName = `${member.first_name || ''} ${member.last_name || ''}`.toLowerCase();
    const email = (member.email || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    
    return fullName.includes(query) || email.includes(query);
  });

  // Handle member removal
  const handleRemoveMember = (memberId: string) => {
    updateTeamMemberManager(memberId, null);
  };

  // Handle manual refresh
  const handleRefresh = () => {
    refetch();
    toast({
      title: "Refreshed",
      description: "Team members list has been refreshed",
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Your Team Members</CardTitle>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
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

          {isLoading ? (
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
            <div className="text-center text-muted-foreground py-6">
              {searchQuery.trim() 
                ? "No members match your search" 
                : managerId
                  ? "No team members found. Agents need to set you as their manager in their profile."
                  : "You need to be a manager to have team members."}
            </div>
          ) : (
            filteredMembers?.map((member: Profile) => (
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
    </Card>
  );
}
