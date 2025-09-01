import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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

interface SmartTeamListProps {
  managerId?: string;
}

interface TeamMemberNode {
  member: Profile;
  subordinates: TeamMemberNode[];
  level: number;
}

interface TeamMemberData {
  id: string;
  team_id: string;
  user_id: string;
  role: string;
  created_at: string;
  updated_at: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  profile_image_url?: string;
  privacy_settings?: Record<string, unknown>;
  notification_preferences?: Record<string, unknown>;
}

export function SmartTeamList({ managerId }: Readonly<SmartTeamListProps>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();

  // Fetch team members using the new team management system
  const { data: teamMembers, isLoading } = useQuery({
    queryKey: ["manager-team", managerId],
    queryFn: async () => {
      if (!managerId) return [];

      // First, get the manager's team from team_managers table
      const { data: managerTeam, error: teamError } = await supabase
        .from("team_managers")
        .select("team_id")
        .eq("user_id", managerId)
        .single();

      if (teamError || !managerTeam) {
        console.log("No team found for manager:", managerId);
        return [];
      }

      // Get team members from team_members table
      const { data: members, error: membersError } = await supabase
        .from("team_members")
        .select("*")
        .eq("team_id", managerTeam.team_id);

      if (membersError) throw membersError;

      if (!members || members.length === 0) {
        return [];
      }

      // Filter out the manager themselves from the team members list
      const filteredMembers = members.filter(
        (member) => member.user_id !== managerId
      );

      if (filteredMembers.length === 0) {
        return [];
      }

      // Get the list of user IDs to fetch their profiles
      const userIds = filteredMembers.map((member) => member.user_id);

      // Fetch the profiles for these users
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .in("id", userIds);

      if (profilesError) throw profilesError;

      // Create a map of user IDs to their profile information
      const profileMap = profiles.reduce((acc, profile) => {
        acc[profile.id] = profile;
        return acc;
      }, {} as Record<string, Record<string, unknown>>);

      // Merge the team members with their profile information
      return filteredMembers.map((member) => ({
        ...member,
        first_name: profileMap[member.user_id]?.first_name,
        last_name: profileMap[member.user_id]?.last_name,
        email: profileMap[member.user_id]?.email,
        profile_image_url: profileMap[member.user_id]?.profile_image_url,
        role: profileMap[member.user_id]?.role,
        privacy_settings:
          typeof profileMap[member.user_id]?.privacy_settings === "string"
            ? JSON.parse(profileMap[member.user_id]?.privacy_settings as string)
            : profileMap[member.user_id]?.privacy_settings || {
                show_email: false,
                show_phone: false,
                show_photo: true,
              },
        notification_preferences:
          typeof profileMap[member.user_id]?.notification_preferences ===
          "string"
            ? JSON.parse(
                profileMap[member.user_id]?.notification_preferences as string
              )
            : profileMap[member.user_id]?.notification_preferences || {
                email_notifications: true,
                phone_notifications: false,
              },
      })) as TeamMemberData[];
    },
    enabled: !!managerId,
  });

  // Fetch all teams and team members for hierarchy building
  const { data: allTeamsData } = useQuery({
    queryKey: ["all-teams-hierarchy"],
    queryFn: async () => {
      // Get all teams
      const { data: teams, error: teamsError } = await supabase
        .from("teams")
        .select("*");

      if (teamsError) throw teamsError;

      // Get all team members
      const { data: allTeamMembers, error: membersError } = await supabase
        .from("team_members")
        .select("*");

      if (membersError) throw membersError;

      // Get all team managers
      const { data: allTeamManagers, error: managersError } = await supabase
        .from("team_managers")
        .select("*");

      if (managersError) throw managersError;

      // Get all profiles
      const { data: allProfiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*");

      if (profilesError) throw profilesError;

      return { teams, allTeamMembers, allTeamManagers, allProfiles };
    },
  });

  // Build team hierarchy with subordinates
  const buildTeamHierarchy = (): TeamMemberNode[] => {
    if (!teamMembers || !allTeamsData) return [];

    const { teams, allTeamMembers, allTeamManagers, allProfiles } =
      allTeamsData;
    const profilesMap = new Map<string, Record<string, unknown>>();
    allProfiles?.forEach((profile) => profilesMap.set(profile.id, profile));

    const teamMembersMap = new Map<string, Record<string, unknown>[]>();
    allTeamMembers?.forEach((member) => {
      if (!teamMembersMap.has(member.team_id)) {
        teamMembersMap.set(member.team_id, []);
      }
      teamMembersMap.get(member.team_id).push(member);
    });

    const findMemberTeam = (memberId: string) => {
      return teams?.find((team) => {
        const teamManager = allTeamManagers?.find(
          (tm) => tm.team_id === team.id && tm.user_id === memberId
        );
        return teamManager;
      });
    };

    const buildNode = (
      memberId: string,
      level: number
    ): TeamMemberNode | null => {
      const member = teamMembers.find((m) => m.user_id === memberId);
      if (!member) return null;

      // Check if this member is also a manager by looking for their team
      const memberTeam = findMemberTeam(memberId);

      let subordinates: TeamMemberNode[] = [];

      if (memberTeam) {
        // Get this member's team members
        const memberTeamMembers = teamMembersMap.get(memberTeam.id) || [];

        if (memberTeamMembers.length > 0) {
          // Build subordinate nodes
          subordinates = memberTeamMembers
            .map((subMember) => {
              const subProfile = profilesMap.get(subMember.user_id as string);
              if (!subProfile) return null;

              return {
                member: {
                  id: subMember.user_id,
                  first_name: subProfile.first_name,
                  last_name: subProfile.last_name,
                  email: subProfile.email,
                  profile_image_url: subProfile.profile_image_url,
                  role: subProfile.role,
                  roles: [],
                  privacy_settings:
                    typeof subProfile.privacy_settings === "string"
                      ? JSON.parse(subProfile.privacy_settings)
                      : subProfile.privacy_settings || {
                          show_email: false,
                          show_phone: false,
                          show_photo: true,
                        },
                  notification_preferences:
                    typeof subProfile.notification_preferences === "string"
                      ? JSON.parse(subProfile.notification_preferences)
                      : subProfile.notification_preferences || {
                          email_notifications: true,
                          phone_notifications: false,
                        },
                } as Profile,
                subordinates: [],
                level: level + 1,
              };
            })
            .filter((node): node is TeamMemberNode => node !== null);
        }
      }

      // Convert TeamMemberData to Profile for the node
      const memberProfile: Profile = {
        id: member.user_id,
        first_name: member.first_name || "",
        last_name: member.last_name || "",
        email: member.email || "",
        profile_image_url: member.profile_image_url,
        role: member.role,
        roles: [],
        privacy_settings: member.privacy_settings as {
          show_email: boolean;
          show_phone: boolean;
          show_photo: boolean;
        },
        notification_preferences: member.notification_preferences as {
          email_notifications: boolean;
          phone_notifications: boolean;
        },
        phone: "",
        last_sign_in: "",
        language_preference: "",
        manager_id: "",
        terms_accepted_at: "",
        created_at: member.created_at,
        updated_at: member.updated_at,
      };

      return {
        member: memberProfile,
        subordinates,
        level,
      };
    };

    // Build hierarchy for all direct team members
    return teamMembers
      .map((member) => buildNode(member.user_id, 0))
      .filter((node): node is TeamMemberNode => node !== null);
  };

  const teamHierarchy = buildTeamHierarchy();

  // Filter hierarchy based on search query
  const filterHierarchy = (nodes: TeamMemberNode[]): TeamMemberNode[] => {
    if (!searchQuery.trim()) return nodes;

    return nodes
      .map((node) => {
        const fullName = `${node.member.first_name || ""} ${
          node.member.last_name || ""
        }`.toLowerCase();
        const email = (node.member.email || "").toLowerCase();
        const query = searchQuery.toLowerCase();

        const matchesSearch = fullName.includes(query) || email.includes(query);
        const filteredSubordinates = filterHierarchy(node.subordinates);

        if (matchesSearch || filteredSubordinates.length > 0) {
          return {
            ...node,
            subordinates: filteredSubordinates,
          };
        }
        return null;
      })
      .filter((node): node is TeamMemberNode => node !== null);
  };

  const filteredHierarchy = filterHierarchy(teamHierarchy);

  const toggleNode = (memberId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(memberId)) {
      newExpanded.delete(memberId);
    } else {
      newExpanded.add(memberId);
    }
    setExpandedNodes(newExpanded);
  };

  const formatRoleName = (role: string | null) => {
    if (!role) return "User";
    if (role === "beta_user") return "Beta User";
    if (role === "manager_pro_gold") return "Manager Pro Gold";
    if (role === "manager_pro_platinum") return "Manager Pro Platinum";
    if (role === "agent_pro") return "Agent Pro";
    if (role === "manager_pro") return "Manager Pro";
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

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

  // Handle member removal - update DB, invalidate cache, avoid full page reload
  const handleRemoveMember = async (memberId: string) => {
    try {
      // First, get the manager's team
      const { data: managerTeam, error: teamError } = await supabase
        .from("team_managers")
        .select("team_id")
        .eq("user_id", managerId)
        .single();

      if (teamError || !managerTeam) {
        throw new Error("Manager team not found");
      }

      // Remove member from team_members table
      const { error } = await supabase
        .from("team_members")
        .delete()
        .eq("team_id", managerTeam.team_id)
        .eq("user_id", memberId);

      if (error) throw error;

      // Invalidate the specific team-members query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["manager-team", managerId] });

      toast({
        title: "Success",
        description: "Team member has been removed from your team.",
      });
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

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Team Members</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Input
            placeholder="Search members by name or email"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-4"
          />

          {(() => {
            if (isLoading) {
              return Array.from({ length: 3 }).map((_, index) => (
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
              ));
            }

            if (filteredHierarchy.length === 0) {
              const message = searchQuery.trim()
                ? "No members match your search"
                : "No team members found";
              return (
                <p className="text-center text-muted-foreground py-4">
                  {message}
                </p>
              );
            }

            return (
              <div className="space-y-2">
                {filteredHierarchy.map((node) => (
                  <div key={node.member.id} className="space-y-2">
                    {renderTeamMember(node)}
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      </CardContent>
    </Card>
  );
}
