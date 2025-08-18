import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/types/profile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronRight,
  Users,
  MoreHorizontal,
  UserX,
  Crown,
} from "lucide-react";
import ProfileAvatar from "@/components/profile/ProfileAvatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";

interface TeamMemberNode {
  member: Profile;
  subordinates: TeamMemberNode[];
  level: number;
}

interface TeamData {
  manager: Profile;
  teamMembers: TeamMemberNode[];
}

export function AllTeamsList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set());

  // Fetch all profiles to build the hierarchy
  const { data: allProfiles, isLoading } = useQuery({
    queryKey: ["all-profiles-for-admin-hierarchy"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("first_name");

      if (error) throw error;

      return data.map((profile) => ({
        ...profile,
        roles: [],
        privacy_settings:
          typeof profile.privacy_settings === "string"
            ? JSON.parse(profile.privacy_settings)
            : profile.privacy_settings || {
                show_email: false,
                show_phone: false,
                show_photo: true,
              },
        notification_preferences:
          typeof profile.notification_preferences === "string"
            ? JSON.parse(profile.notification_preferences)
            : profile.notification_preferences || {
                email_notifications: true,
                phone_notifications: false,
              },
      })) as Profile[];
    },
  });

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
      case "manager_pro_platinum":
        return "outline";
      case "manager_pro_gold":
        return "outline";
      case "agent_pro":
        return "outline";
      case "manager_pro":
        return "default";
      case "beta_user":
        return "destructive";
      default:
        return "secondary";
    }
  };

  // Check if a user is a manager
  const isManager = (profile: Profile) => {
    return (
      profile.role?.includes("manager_pro") ||
      profile.roles?.some((role) =>
        ["manager_pro", "manager_pro_gold", "manager_pro_platinum"].includes(
          role
        )
      )
    );
  };

  // Build team hierarchy for a specific manager
  const buildTeamHierarchy = (managerId: string): TeamMemberNode[] => {
    if (!allProfiles) return [];

    const profilesMap = new Map<string, Profile>();
    allProfiles.forEach((profile) => profilesMap.set(profile.id, profile));

    const buildNode = (
      memberId: string,
      level: number
    ): TeamMemberNode | null => {
      const member = profilesMap.get(memberId);
      if (!member) return null;

      // Get direct subordinates for this member
      const directSubordinates = allProfiles
        .filter((profile) => profile.manager_id === memberId)
        .map((subordinate) => buildNode(subordinate.id, level + 1))
        .filter((node): node is TeamMemberNode => node !== null);

      return {
        member,
        subordinates: directSubordinates,
        level,
      };
    };

    // Get all direct team members of the manager
    const directTeamMembers = allProfiles
      .filter((profile) => profile.manager_id === managerId)
      .map((member) => buildNode(member.id, 0))
      .filter((node): node is TeamMemberNode => node !== null);

    return directTeamMembers;
  };

  // Get all teams (managers with their team members)
  const getAllTeams = (): TeamData[] => {
    if (!allProfiles) return [];

    // Get all managers
    const managers = allProfiles.filter((profile) => isManager(profile));

    return managers.map((manager) => ({
      manager,
      teamMembers: buildTeamHierarchy(manager.id),
    }));
  };

  const allTeams = getAllTeams();

  // Filter teams based on search query
  const filterTeams = (teams: TeamData[]): TeamData[] => {
    if (!searchQuery.trim()) return teams;

    return teams.filter((team) => {
      const managerName = `${team.manager.first_name || ""} ${
        team.manager.last_name || ""
      }`.toLowerCase();
      const managerEmail = (team.manager.email || "").toLowerCase();
      const query = searchQuery.toLowerCase();

      // Check if manager matches
      if (managerName.includes(query) || managerEmail.includes(query)) {
        return true;
      }

      // Check if any team member matches
      const hasMatchingMember = (members: TeamMemberNode[]): boolean => {
        return members.some((member) => {
          const memberName = `${member.member.first_name || ""} ${
            member.member.last_name || ""
          }`.toLowerCase();
          const memberEmail = (member.member.email || "").toLowerCase();

          if (memberName.includes(query) || memberEmail.includes(query)) {
            return true;
          }

          return hasMatchingMember(member.subordinates);
        });
      };

      return hasMatchingMember(team.teamMembers);
    });
  };

  const filteredTeams = filterTeams(allTeams);

  const toggleNode = (memberId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(memberId)) {
      newExpanded.delete(memberId);
    } else {
      newExpanded.add(memberId);
    }
    setExpandedNodes(newExpanded);
  };

  const toggleTeam = (managerId: string) => {
    const newExpanded = new Set(expandedTeams);
    if (newExpanded.has(managerId)) {
      newExpanded.delete(managerId);
    } else {
      newExpanded.add(managerId);
    }
    setExpandedTeams(newExpanded);
  };

  // Handle member removal
  const handleRemoveMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ manager_id: null })
        .eq("id", memberId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Team member has been removed from their team.",
      });

      // Refetch the data to update the UI
      window.location.reload();
    } catch (error: unknown) {
      console.error("Error removing team member:", error);
      toast({
        title: "Error",
        description: "Failed to remove team member. Please try again.",
        variant: "destructive",
      });
    }
  };

  const renderTeamMember = (node: TeamMemberNode) => {
    const hasSubordinates = node.subordinates.length > 0;
    const isExpanded = expandedNodes.has(node.member.id);
    const indentLevel = node.level * 20;

    return (
      <div key={node.member.id} className="space-y-2">
        <div
          className="flex items-center justify-between border rounded-md p-3 hover:bg-muted/30"
          style={{ marginLeft: `${indentLevel}px` }}
        >
          <div className="flex items-center gap-3">
            {hasSubordinates && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => toggleNode(node.member.id)}
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            )}
            {!hasSubordinates && <div className="w-6" />}

            <ProfileAvatar
              imageUrl={node.member.profile_image_url}
              firstName={node.member.first_name}
              className="h-10 w-10"
            />
            <div>
              <p className="font-medium">
                {node.member.first_name} {node.member.last_name}
              </p>
              <p className="text-sm text-muted-foreground">
                {node.member.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {hasSubordinates && (
              <Badge variant="outline" className="text-xs">
                <Users className="h-3 w-3 mr-1" />
                {node.subordinates.length}{" "}
                {node.subordinates.length === 1 ? "member" : "members"}
              </Badge>
            )}
            <Badge variant={getBadgeVariant(node.member.role)}>
              {formatRoleName(node.member.role)}
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
                  onClick={() => handleRemoveMember(node.member.id)}
                  className="text-destructive"
                >
                  <UserX className="h-4 w-4 mr-2" />
                  Remove from Team
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {isExpanded && hasSubordinates && (
          <div className="space-y-2">
            {node.subordinates.map((subordinate) =>
              renderTeamMember(subordinate)
            )}
          </div>
        )}
      </div>
    );
  };

  const renderTeam = (team: TeamData) => {
    const isTeamExpanded = expandedTeams.has(team.manager.id);
    const hasTeamMembers = team.teamMembers.length > 0;

    return (
      <Card key={team.manager.id} className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {hasTeamMembers && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => toggleTeam(team.manager.id)}
                >
                  {isTeamExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              )}
              {!hasTeamMembers && <div className="w-6" />}

              <ProfileAvatar
                imageUrl={team.manager.profile_image_url}
                firstName={team.manager.first_name}
                className="h-12 w-12"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">
                    {team.manager.first_name} {team.manager.last_name}
                  </h3>
                  <Crown className="h-4 w-4 text-yellow-500" />
                </div>
                <p className="text-sm text-muted-foreground">
                  {team.manager.email}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={getBadgeVariant(team.manager.role)}>
                    {formatRoleName(team.manager.role)}
                  </Badge>
                  {hasTeamMembers && (
                    <Badge variant="outline" className="text-xs">
                      <Users className="h-3 w-3 mr-1" />
                      {team.teamMembers.length}{" "}
                      {team.teamMembers.length === 1 ? "member" : "members"}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        {isTeamExpanded && hasTeamMembers && (
          <CardContent>
            <div className="space-y-2">
              {team.teamMembers.map((member) => renderTeamMember(member))}
            </div>
          </CardContent>
        )}
      </Card>
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>All Teams</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Input
            placeholder="Search teams by manager or member name/email"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-4"
          />

          {isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="flex items-center space-x-4 p-3 border rounded-md"
              >
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            ))
          ) : filteredTeams.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              {searchQuery.trim()
                ? "No teams match your search"
                : "No teams found"}
            </p>
          ) : (
            <div className="space-y-4">
              {filteredTeams.map((team) => renderTeam(team))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
