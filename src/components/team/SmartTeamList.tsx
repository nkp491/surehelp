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
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();

  // Fetch team members using the new team management system
  const { data: teamMembers, isLoading } = useQuery({
    queryKey: ["manager-team", managerId],
    queryFn: async () => {
      if (!managerId) return [];

      // First, get the manager's profile to get their email
      const { data: managerProfile, error: profileError } = await supabase
        .from("profiles")
        .select("email")
        .eq("id", managerId)
        .single();

      if (profileError || !managerProfile) {
        console.error("Error fetching manager profile:", profileError);
        return [];
      }

      // Find team where this manager's email is in the manager field
      const { data: team, error: teamError } = await supabase
        .from("teams")
        .select("id, name, manager")
        .eq("manager", managerProfile.email)
        .maybeSingle();

      if (teamError) {
        console.error("Error fetching team:", teamError);
        return [];
      }

      if (!team) {
        // Manager has no team assigned
        return [];
      }

      // Get team members from team_members table
      const { data: members, error: membersError } = await supabase
        .from("team_members")
        .select("*")
        .eq("team_id", team.id);

      if (membersError) {
        console.error("Error fetching team members:", membersError);
        throw membersError;
      }

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

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        throw profilesError;
      }

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

  // Fetch teams and team members for hierarchy building (filtered by user role)
  const { data: allTeamsData } = useQuery({
    queryKey: ["all-teams-hierarchy"],
    queryFn: async () => {
      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error("User not authenticated");
      }

      // Check if user is system admin
      const { data: adminRoles, error: adminError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "system_admin");

      if (adminError) throw adminError;

      const isSystemAdmin = adminRoles && adminRoles.length > 0;

      let teams;
      if (isSystemAdmin) {
        // System admin can see all teams
        const { data: allTeams, error: teamsError } = await supabase
          .from("teams")
          .select("*");

        if (teamsError) throw teamsError;
        teams = allTeams;
      } else {
        // Check if user is a manager
        const { data: managerRoles, error: managerError } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .in("role", [
            "manager",
            "manager_pro",
            "manager_pro_gold",
            "manager_pro_platinum",
          ]);

        if (managerError) throw managerError;

        if (!managerRoles || managerRoles.length === 0) {
          // User is not a manager, return empty data
          return {
            teams: [],
            allTeamMembers: [],
            allTeamManagers: [],
            allProfiles: [],
          };
        }

        // Get user's profile to find teams they manage
        const { data: userProfile, error: profileError } = await supabase
          .from("profiles")
          .select("email")
          .eq("id", user.id)
          .single();

        if (profileError || !userProfile) {
          throw new Error("User profile not found");
        }

        // Find teams where this user's email is in the manager field
        const { data: managedTeams, error: teamsError } = await supabase
          .from("teams")
          .select("*")
          .eq("manager", userProfile.email);

        if (teamsError) throw teamsError;

        if (!managedTeams || managedTeams.length === 0) {
          // User is a manager but has no teams assigned
          return {
            teams: [],
            allTeamMembers: [],
            allTeamManagers: [],
            allProfiles: [],
          };
        }

        teams = managedTeams;
      }

      // Get all team members
      const { data: allTeamMembers, error: membersError } = await supabase
        .from("team_members")
        .select("*");

      if (membersError) throw membersError;


      // Get all profiles
      const { data: allProfiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*");

      if (profilesError) throw profilesError;

      return { teams, allTeamMembers, allProfiles };
    },
  });

  // Build team hierarchy with subordinates
  const buildTeamHierarchy = async (): Promise<TeamMemberNode[]> => {
    if (!teamMembers || !allTeamsData) return [];

    const { teams, allTeamMembers, allProfiles } =
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
      // Find the member's profile to get their email
      const memberProfile = profilesMap.get(memberId);
      if (!memberProfile?.email) return null;

      // Find team where this member's email is in the manager field
      return teams?.find((team) => team.manager === memberProfile.email);
    };

    const buildNode = async (
      memberId: string,
      level: number
    ): Promise<TeamMemberNode | null> => {
      const member = teamMembers.find((m) => m.user_id === memberId);
      if (!member) return null;

      // Check if this member is also a manager by looking for their team
      const memberTeam = findMemberTeam(memberId);

      let subordinates: TeamMemberNode[] = [];

      if (memberTeam) {
        // Get this member's team members from team_members table
        const { data: memberTeamMembers, error: membersError } = await supabase
          .from("team_members")
          .select("*")
          .eq("team_id", memberTeam.id);

        if (membersError) {
          console.error("Error fetching member's team members:", membersError);
        } else if (memberTeamMembers && memberTeamMembers.length > 0) {
          // Filter out the member themselves from their own team
          const filteredSubMembers = memberTeamMembers.filter(
            (subMember) => subMember.user_id !== memberId
          );

          if (filteredSubMembers.length > 0) {
            // Get profiles for the subordinate members
            const userIds = filteredSubMembers.map((subMember) => subMember.user_id);
            const { data: subProfiles, error: profilesError } = await supabase
              .from("profiles")
              .select("*")
              .in("id", userIds);

            if (profilesError) {
              console.error("Error fetching subordinate profiles:", profilesError);
            } else if (subProfiles) {
              // Create profile map for subordinates
              const subProfileMap = subProfiles.reduce((acc, profile) => {
                acc[profile.id] = profile;
                return acc;
              }, {} as Record<string, Record<string, unknown>>);

              // Build subordinate nodes recursively
              subordinates = await Promise.all(
                filteredSubMembers.map(async (subMember) => {
                  const subProfile = subProfileMap[subMember.user_id];
                  if (!subProfile) return null;

                  // Recursively build subordinates for this member
                  const subSubordinates = await buildSubordinatesRecursively(
                    subMember.user_id,
                    level + 2
                  );

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
                    subordinates: subSubordinates,
                    level: level + 1,
                  };
                })
              );

              subordinates = subordinates.filter((node): node is TeamMemberNode => node !== null);
            }
          }
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

    // Helper function to recursively build subordinates
    const buildSubordinatesRecursively = async (
      memberId: string,
      level: number
    ): Promise<TeamMemberNode[]> => {
      // Find if this member has a team
      const memberProfile = profilesMap.get(memberId);
      if (!memberProfile?.email) return [];

      const memberTeam = teams?.find((team) => team.manager === memberProfile.email);
      if (!memberTeam) return [];

      // Get this member's team members
      const { data: memberTeamMembers, error: membersError } = await supabase
        .from("team_members")
        .select("*")
        .eq("team_id", memberTeam.id);

      if (membersError || !memberTeamMembers || memberTeamMembers.length === 0) {
        return [];
      }

      // Filter out the member themselves
      const filteredMembers = memberTeamMembers.filter(
        (subMember) => subMember.user_id !== memberId
      );

      if (filteredMembers.length === 0) return [];

      // Get profiles for these members
      const userIds = filteredMembers.map((subMember) => subMember.user_id);
      const { data: subProfiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .in("id", userIds);

      if (profilesError || !subProfiles) return [];

      const subProfileMap = subProfiles.reduce((acc, profile) => {
        acc[profile.id] = profile;
        return acc;
      }, {} as Record<string, Record<string, unknown>>);

      // Build subordinate nodes
      const subordinates: TeamMemberNode[] = [];
      for (const subMember of filteredMembers) {
        const subProfile = subProfileMap[subMember.user_id];
        if (!subProfile) continue;

        // Recursively get their subordinates
        const subSubordinates = await buildSubordinatesRecursively(
          subMember.user_id,
          level + 1
        );

        subordinates.push({
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
          subordinates: subSubordinates,
          level,
        });
      }

      return subordinates;
    };

    // Build hierarchy for all direct team members
    const hierarchy = await Promise.all(
      teamMembers.map((member) => buildNode(member.user_id, 0))
    );
    return hierarchy.filter((node): node is TeamMemberNode => node !== null);
  };

  // Use a separate query to get the team hierarchy
  const { data: teamHierarchy, isLoading: isLoadingHierarchy } = useQuery({
    queryKey: ["team-hierarchy", managerId, teamMembers],
    queryFn: buildTeamHierarchy,
    enabled: !!managerId && !!teamMembers && !!allTeamsData,
  });

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
      if (!managerId) {
        throw new Error("Manager ID not found");
      }

      // First, get the manager's profile to get their email
      const { data: managerProfile, error: profileError } = await supabase
        .from("profiles")
        .select("email")
        .eq("id", managerId)
        .single();

      if (profileError || !managerProfile) {
        throw new Error("Manager profile not found");
      }

      // Find team where this manager's email is in the manager field
      const { data: team, error: teamError } = await supabase
        .from("teams")
        .select("id")
        .eq("manager", managerProfile.email)
        .single();

      if (teamError || !team) {
        throw new Error("Manager team not found");
      }

      // Remove member from team_members table
      const { error } = await supabase
        .from("team_members")
        .delete()
        .eq("team_id", team.id)
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
          {(() => {
            if (isLoading || isLoadingHierarchy) {
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

            if (!teamHierarchy || teamHierarchy.length === 0) {
              return (
                <p className="text-center text-muted-foreground py-4">
                  No team members found
                </p>
              );
            }

            return (
              <div className="space-y-2">
                {teamHierarchy.map((node) => (
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
