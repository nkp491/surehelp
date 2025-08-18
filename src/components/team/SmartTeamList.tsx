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

export function SmartTeamList({ managerId }: SmartTeamListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // Fetch all profiles to build the hierarchy
  const { data: allProfiles, isLoading } = useQuery({
    queryKey: ["all-profiles-for-hierarchy"],
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

  const buildTeamHierarchy = (): TeamMemberNode[] => {
    if (!allProfiles || !managerId) return [];

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

    // Get all direct team members of the current manager
    const directTeamMembers = allProfiles
      .filter((profile) => profile.manager_id === managerId)
      .map((member) => buildNode(member.id, 0))
      .filter((node): node is TeamMemberNode => node !== null);

    return directTeamMembers;
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
        description: "Team member has been removed from your team.",
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
          ) : filteredHierarchy.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              {searchQuery.trim()
                ? "No members match your search"
                : "No team members found"}
            </p>
          ) : (
            <div className="space-y-2">
              {filteredHierarchy.map((node) => renderTeamMember(node))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
