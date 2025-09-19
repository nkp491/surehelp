import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/types/profile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Users } from "lucide-react";
import ProfileAvatar from "@/components/profile/ProfileAvatar";
import { Skeleton } from "@/components/ui/skeleton";

export interface TeamNode {
  team: {
    id: string;
    name: string;
    manager: string;
    created_at: string;
    updated_at: string;
  };
  members: TeamMemberNode[];
  level: number;
}

interface TeamMemberNode {
  member: Profile;
  subordinates: TeamMemberNode[];
  level: number;
}

interface SmartTeamDashboardProps {
  onTeamSelect?: (teamId: string | null, teamData: TeamNode | null) => void;
}

export function SmartTeamDashboard({ onTeamSelect }: SmartTeamDashboardProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);


  // Fetch all teams and their hierarchies
  const { data: teamsData, isLoading } = useQuery({
    queryKey: ["all-teams-dashboard"],
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

      // Get essential profile data only (roles are in user_roles table)
      const { data: allProfiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, email, first_name, last_name, profile_image_url");

      if (profilesError) throw profilesError;

      // Get user roles
      const { data: allUserRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (rolesError) throw rolesError;

      console.log("Fetched data:", {
        teamsCount: teams?.length,
        membersCount: allTeamMembers?.length,
        profilesCount: allProfiles?.length,
        rolesCount: allUserRoles?.length,
      });

      return { teams, allTeamMembers, allProfiles, allUserRoles };
    },
  });

  // Build team hierarchy with all sub-teams
  const buildTeamHierarchy = async (): Promise<TeamNode[]> => {
    try {
      if (!teamsData) {
        console.log("No teamsData available");
        return [];
      }

      const { teams, allTeamMembers, allProfiles, allUserRoles } = teamsData;
      console.log("Building team hierarchy with:", {
        teamsCount: teams?.length,
        membersCount: allTeamMembers?.length,
        profilesCount: allProfiles?.length,
        rolesCount: allUserRoles?.length,
      });

      if (!teams || teams.length === 0) {
        console.log("No teams found in data");
        return [];
      }
      const profilesMap = new Map<
        string,
        {
          id: string;
          email: string;
          first_name: string;
          last_name: string;
          profile_image_url?: string;
        }
      >();
      allProfiles?.forEach((profile) => profilesMap.set(profile.id, profile));

      // Create roles map
      const rolesMap = new Map<string, string[]>();
      allUserRoles?.forEach((userRole) => {
        if (!rolesMap.has(userRole.user_id)) {
          rolesMap.set(userRole.user_id, []);
        }
        rolesMap.get(userRole.user_id)?.push(userRole.role);
      });

      console.log("Roles map created:", Object.fromEntries(rolesMap));

      const teamMembersMap = new Map<
        string,
        { team_id: string; user_id: string }[]
      >();
      allTeamMembers?.forEach((member) => {
        if (!teamMembersMap.has(member.team_id)) {
          teamMembersMap.set(member.team_id, []);
        }
        teamMembersMap.get(member.team_id)?.push(member);
      });

      // Utility function to create Profile from simplified data
      const createProfile = (
        profileData: {
          id: string;
          email: string;
          first_name: string;
          last_name: string;
          profile_image_url?: string;
        },
        userId: string
      ): Profile => {
        const userRoles = rolesMap.get(userId) || [];
        console.log(`User ${userId} has roles:`, userRoles);

        // Get the primary role - prioritize manager roles, then other roles
        const getPrimaryRole = (roles: string[]): string => {
          if (roles.length === 0) return "user";

          // Priority order for primary role
          const priorityRoles = [
            "manager_pro_platinum",
            "manager_pro_gold",
            "manager_pro",
            "manager",
            "agent_pro",
            "agent",
            "beta_user",
          ];

          for (const priorityRole of priorityRoles) {
            if (roles.includes(priorityRole)) {
              return priorityRole;
            }
          }

          // If no priority role found, return the first role
          return roles[0];
        };

        const primaryRole = getPrimaryRole(userRoles);

        return {
          id: userId,
          first_name: profileData.first_name || "",
          last_name: profileData.last_name || "",
          email: profileData.email || "",
          profile_image_url: profileData.profile_image_url,
          role: primaryRole,
          roles: userRoles,
          privacy_settings: {
            show_email: false,
            show_phone: false,
            show_photo: true,
          },
          notification_preferences: {
            email_notifications: true,
            phone_notifications: false,
          },
          phone: "",
          last_sign_in: "",
          language_preference: "",
          manager_id: "",
          terms_accepted_at: "",
          created_at: "",
          updated_at: "",
        };
      };

      const findMemberTeam = (memberId: string) => {
        // Find the member's profile to get their email
        const memberProfile = profilesMap.get(memberId);
        if (!memberProfile?.email) return null;

        // Find team where this member's email is in the manager field
        return teams?.find((team) => team.manager === memberProfile.email);
      };

      // Helper function to recursively build subordinates
      const buildSubordinatesRecursively = async (
        memberId: string,
        level: number
      ): Promise<TeamMemberNode[]> => {
        // Find if this member has a team
        const memberProfile = profilesMap.get(memberId);
        if (!memberProfile?.email) return [];

        const memberTeam = teams?.find(
          (team) => team.manager === memberProfile.email
        );
        if (!memberTeam) return [];

        // Get this member's team members
        const { data: memberTeamMembers, error: membersError } = await supabase
          .from("team_members")
          .select("*")
          .eq("team_id", memberTeam.id);

        if (
          membersError ||
          !memberTeamMembers ||
          memberTeamMembers.length === 0
        ) {
          return [];
        }

        // Filter out the member themselves
        const filteredMembers = memberTeamMembers.filter(
          (subMember) => subMember.user_id !== memberId
        );

        if (filteredMembers.length === 0) return [];

        // Build subordinate nodes using existing profile data
        const subordinates: TeamMemberNode[] = [];
        for (const subMember of filteredMembers) {
          const subProfile = profilesMap.get(subMember.user_id);
          if (!subProfile) continue;

          // Recursively get their subordinates
          const subSubordinates = await buildSubordinatesRecursively(
            subMember.user_id,
            level + 1
          );

          subordinates.push({
            member: createProfile(subProfile, subMember.user_id),
            subordinates: subSubordinates,
            level,
          });
        }

        return subordinates;
      };

      // Build hierarchy for all teams
      const teamNodes: TeamNode[] = [];
      console.log("Processing teams:", teams?.length || 0);

      for (const team of teams || []) {
        console.log("Processing team:", team.name, "Manager:", team.manager);

        // Get team members
        const teamMembers = teamMembersMap.get(team.id) || [];
        console.log("Team members for", team.name, ":", teamMembers.length);

        // Find manager profile from existing data
        const managerProfile = allProfiles?.find(
          (profile) => profile.email === team.manager
        );
        console.log("Manager profile found:", !!managerProfile);

        // Build member nodes for this team, starting with the manager
        const memberNodes: TeamMemberNode[] = [];

        // Add the manager first if found (but don't fetch their own team to avoid circular reference)
        if (managerProfile) {
          memberNodes.push({
            member: createProfile(managerProfile, managerProfile.id),
            subordinates: [], // No subordinates for the manager to avoid circular reference
            level: 0,
          });
        }

        // Add regular team members (exclude the manager to avoid duplication)
        for (const member of teamMembers) {
          const memberUserId = member.user_id as string;
          const memberProfile = profilesMap.get(memberUserId);
          if (!memberProfile) continue;

          // Skip if this member is the manager (already added above)
          if (managerProfile && memberUserId === managerProfile.id) continue;

          // Check if this member is also a manager
          const memberTeam = findMemberTeam(memberUserId);
          let subordinates: TeamMemberNode[] = [];

          if (memberTeam) {
            // Get this member's team members
            const { data: memberTeamMembers, error: membersError } =
              await supabase
                .from("team_members")
                .select("*")
                .eq("team_id", memberTeam.id);

            if (
              !membersError &&
              memberTeamMembers &&
              memberTeamMembers.length > 0
            ) {
              // Filter out the member themselves
              const filteredSubMembers = memberTeamMembers.filter(
                (subMember) => subMember.user_id !== memberUserId
              );

              if (filteredSubMembers.length > 0) {
                // Build subordinate nodes using existing profile data
                subordinates = await Promise.all(
                  filteredSubMembers.map(async (subMember) => {
                    const subProfile = profilesMap.get(subMember.user_id);
                    if (!subProfile) return null;

                    const subSubordinates = await buildSubordinatesRecursively(
                      subMember.user_id,
                      2
                    );

                    return {
                      member: createProfile(subProfile, subMember.user_id),
                      subordinates: subSubordinates,
                      level: 1, // Level 1 for sub-team members
                    };
                  })
                );

                subordinates = subordinates.filter(
                  (node): node is TeamMemberNode => node !== null
                );
              }
            }
          }

          memberNodes.push({
            member: createProfile(memberProfile, memberUserId),
            subordinates,
            level: 0,
          });
        }

        teamNodes.push({
          team,
          members: memberNodes,
          level: 0,
        });
      }

      console.log("Final team nodes:", teamNodes.length);
      return teamNodes;
    } catch (error) {
      console.error("Error building team hierarchy:", error);
      return [];
    }
  };

  // Use a separate query to get the team hierarchy
  const { data: teamHierarchy, isLoading: isLoadingHierarchy } = useQuery({
    queryKey: ["team-dashboard-hierarchy", teamsData],
    queryFn: buildTeamHierarchy,
    enabled: !!teamsData && !!teamsData.teams && teamsData.teams.length > 0,
  });

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
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

  const getBadgeVariant = (
    role: string | null
  ): "default" | "outline" | "secondary" | "destructive" => {
    return "outline";
  };

  const renderTeamMember = (node: TeamMemberNode) => {
    const hasSubordinates = node.subordinates.length > 0;
    const isExpanded = expandedNodes.has(node.member.id);
    const indentLevel = node.level * 24; // Increased indentation

    return (
      <div key={node.member.id} className="space-y-1">
        <div
          className={`space-y-2 border rounded-md p-3 hover:bg-muted/30 transition-colors ${
            node.level > 0 ? "bg-muted/20 border-l-4 border-l-blue-200" : ""
          }`}
          style={{ marginLeft: `${indentLevel}px` }}
        >
          {/* Agent Name and Email */}
          <section className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {hasSubordinates && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-muted/50"
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
                className={`${node.level > 0 ? "h-8 w-8" : "h-10 w-10"}`}
              />
              <div>
                <p className={`font-medium ${node.level > 0 ? "text-sm" : ""}`}>
                  {node.member.first_name} {node.member.last_name}
                  {node.level > 0 && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      (Sub-team)
                    </span>
                  )}
                </p>
                <p
                  className={`text-muted-foreground ${
                    node.level > 0 ? "text-xs" : "text-sm"
                  }`}
                >
                  {node.member.email}
                </p>
              </div>
            </div>
            {/* Member Count */}
            {hasSubordinates && (
              <Badge variant="outline" className="text-xs">
                <Users className="h-3 w-3 mr-1" />
                {node.subordinates.length}{" "}
                {node.subordinates.length === 1 ? "member" : "members"}
              </Badge>
            )}
          </section>
          {/*Agent Role */}
          <div className="ml-10 flex items-center gap-2">
            <div className="flex flex-wrap gap-1">
              {node.member.roles && node.member.roles.length > 0 ? (
                node.member.roles.map((role, index) => (
                  <Badge
                    key={`${node.member.id}-role-${role}`}
                    variant={getBadgeVariant(role)}
                    className={`${node.level > 0 ? "text-xs" : ""} ${
                      index > 0 ? "opacity-70" : ""
                    }`}
                  >
                    {formatRoleName(role)}
                  </Badge>
                ))
              ) : (
                <Badge
                  variant={getBadgeVariant(node.member.role)}
                  className={node.level > 0 ? "text-xs" : ""}
                >
                  {formatRoleName(node.member.role)}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {isExpanded && hasSubordinates && (
          <div className="space-y-1 ml-1">
            {node.subordinates.map((subordinate) =>
              renderTeamMember(subordinate)
            )}
          </div>
        )}
      </div>
    );
  };

  const handleTeamSelect = (teamNode: TeamNode) => {
    const newSelectedTeamId = teamNode.team.id;
    const isCurrentlySelected = selectedTeamId === newSelectedTeamId;
    
    if (isCurrentlySelected) {
      // Deselect if already selected
      setSelectedTeamId(null);
      onTeamSelect?.(null, null);
    } else {
      // Select new team
      setSelectedTeamId(newSelectedTeamId);
      onTeamSelect?.(newSelectedTeamId, teamNode);
      
      // Also expand the team to show members
      if (!expandedNodes.has(teamNode.team.id)) {
        toggleNode(teamNode.team.id);
      }
    }
  };

  const renderTeam = (teamNode: TeamNode) => {
    const isExpanded = expandedNodes.has(teamNode.team.id);
    const hasMembers = teamNode.members.length > 0;
    const isSelected = selectedTeamId === teamNode.team.id;

    // Find the manager in the members list (should be first)
    const manager = teamNode.members.find(
      (member) => member.member.email === teamNode.team.manager
    );
    const managerName = manager
      ? `${manager.member.first_name} ${manager.member.last_name}`
      : teamNode.team.manager;

    return (
      <Card 
        key={teamNode.team.id} 
        className={`mb-4 cursor-pointer hover:bg-muted/30 transition-colors ${
          isSelected ? "border-2 border-gray-600" : ""
        }`}
        onClick={() => handleTeamSelect(teamNode)}
      >
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            {hasMembers && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleNode(teamNode.team.id);
                }}
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            )}
            {!hasMembers && <div className="w-6" />}
            <div>
              <CardTitle className="text-lg">{teamNode.team.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                Manager: {managerName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              <Users className="h-3 w-3 mr-1" />
              {teamNode.members.length}{" "}
              {teamNode.members.length === 1 ? "member" : "members"}
            </Badge>
            {isSelected && (
              <Badge variant="default" className="text-xs">
                Selected
              </Badge>
            )}
          </div>
        </CardHeader>
        {isExpanded && hasMembers && (
          <CardContent className="pt-0">
            <div className="space-y-1">
              {teamNode.members.map((member) => renderTeamMember(member))}
            </div>
          </CardContent>
        )}
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      {(() => {
        if (isLoading || isLoadingHierarchy) {
          return Array.from({ length: 3 }, (_, index) => (
            <Card key={`skeleton-${index}`} className="p-6">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            </Card>
          ));
        }

        // Fallback: Show teams even if hierarchy building fails
        if (!teamHierarchy || teamHierarchy.length === 0) {
          console.log("No team hierarchy found, teamsData:", teamsData);
          console.log("isLoadingHierarchy:", isLoadingHierarchy);
          console.log("teamsData.teams:", teamsData?.teams);

          // Show basic team list if we have teams data
          if (teamsData?.teams && teamsData.teams.length > 0) {
            console.log(
              "Showing fallback team list with",
              teamsData.teams.length,
              "teams"
            );
            return (
              <div className="space-y-4">
                <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                  Debug: Showing basic team list (hierarchy building failed)
                </div>
                {teamsData.teams.map((team) => (
                  <Card key={team.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{team.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Manager: {team.manager}
                        </p>
                      </div>
                      <Badge variant="outline">Team</Badge>
                    </div>
                  </Card>
                ))}
              </div>
            );
          }

          return (
            <Card className="p-6">
              <p className="text-center text-muted-foreground">
                No teams found
              </p>
              <div className="mt-4 text-xs text-muted-foreground space-y-1">
                <p>Debug info:</p>
                <p>teamsData exists: {teamsData ? "Yes" : "No"}</p>
                <p>teams count: {teamsData?.teams?.length || 0}</p>
                <p>isLoading: {isLoading ? "Yes" : "No"}</p>
                <p>isLoadingHierarchy: {isLoadingHierarchy ? "Yes" : "No"}</p>
              </div>
            </Card>
          );
        }

        return (
          <div className="space-y-4">
            {teamHierarchy.map((teamNode) => renderTeam(teamNode))}
          </div>
        );
      })()}
    </div>
  );
}
