import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type {
  TransformedTeam,
  TeamBulletins,
  Profile,
  ProfileInfo,
  TeamMember,
  DailyMetric,
  Meeting,
  EnrichedMember,
  MeetingNote,
  MetricRatios,
  MemberMetrics,
} from "@/types/team";
import TeamBulletIns from "@/components/manager/TeamBulletIns";
import { SmartTeamDashboard } from "@/components/team/SmartTeamDashboard";
import { calculateRatios } from "@/utils/metricsUtils";
import {
  Loader2,
  Phone,
  Calendar,
  MessageSquare,
  Target,
  TrendingUp,
} from "lucide-react";
import { MetricCount } from "@/types/metrics";
import type { TeamNode } from "@/components/team/SmartTeamDashboard";
import { useQuery } from "@tanstack/react-query";
import { endOfMonth, format, startOfMonth } from "date-fns";
import { Progress } from "@/components/ui/progress";

type TimeRange = "weekly" | "monthly" | "ytd";

// Helper functions for metrics display
const PRIMARY_METRICS = [
  { key: "leads", label: "Leads", colorClass: "text-blue-600" },
  { key: "calls", label: "Calls", colorClass: "text-blue-600" },
  { key: "contacts", label: "Contacts", colorClass: "text-blue-600" },
  { key: "scheduled", label: "Scheduled", colorClass: "text-blue-600" },
  { key: "sits", label: "Sits", colorClass: "text-blue-600" },
  { key: "sales", label: "Sales", colorClass: "text-blue-600" },
] as const;

const RATIO_METRICS = [
  { key: "leadsToContact", label: "Lead to Contact", format: "percent" },
  { key: "leadsToScheduled", label: "Lead to Scheduled", format: "percent" },
  { key: "leadsToSits", label: "Lead to Sits", format: "percent" },
  { key: "leadsToSales", label: "Lead to Sales", format: "percent" },
  { key: "aPPerLead", label: "AP per Lead", format: "currency" },
  {
    key: "contactToScheduled",
    label: "Contact to Scheduled",
    format: "percent",
  },
  { key: "contactToSits", label: "Contact to Sits", format: "percent" },
  { key: "callsToContact", label: "Calls to Contact", format: "percent" },
  { key: "callsToScheduled", label: "Calls to Scheduled", format: "percent" },
  { key: "callsToSits", label: "Calls to Sits", format: "percent" },
  { key: "callsToSales", label: "Calls to Sales", format: "percent" },
  { key: "aPPerCall", label: "AP per Call", format: "currency" },
  { key: "contactToSales", label: "Contact to Sales", format: "percent" },
  { key: "aPPerContact", label: "AP per Contact", format: "currency" },
  { key: "scheduledToSits", label: "Scheduled to Sits", format: "percent" },
  { key: "sitsToSalesCloseRatio", label: "Sits to Sales", format: "percent" },
  { key: "aPPerSit", label: "AP per Sit", format: "currency" },
  { key: "aPPerSale", label: "AP per Sale", format: "currency" },
] as const;

const formatValue = (
  value: number | string,
  format: "percent" | "currency"
): string => {
  if (format === "percent") {
    if (typeof value === "string" && value.includes("%")) {
      return value;
    }
    return `${value}%`;
  }
  if (typeof value === "string" && value.includes("$")) {
    return value;
  }
  return `$${value}`;
};

const getTimeRangeLabel = (range: TimeRange): string => {
  switch (range) {
    case "weekly":
      return "Week to Date";
    case "monthly":
      return "Month to Date";
    case "ytd":
    default:
      return "Year to Date";
  }
};

const calculateSuccessScore = (conversion: number): number => {
  return Math.round((conversion / 100) * 100);
};

const useTeams = () => {
  const [teams, setTeams] = useState<TransformedTeam[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTeams = async (): Promise<void> => {
    try {
      setLoading(true);
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error("Error getting current user:", userError);
        return;
      }
      const { data: adminRoles, error: adminError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "system_admin");
      if (adminError) {
        console.error("Error checking admin role:", adminError);
        return;
      }
      const isSystemAdmin = adminRoles && adminRoles.length > 0;
      let teamsResult;
      if (isSystemAdmin) {
        teamsResult = await supabase.from("teams").select("*");
      } else {
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
        if (managerError) {
          console.error("Error checking manager role:", managerError);
          return;
        }
        if (!managerRoles || managerRoles.length === 0) {
          setTeams([]);
          return;
        }
        const { data: managedTeams, error: managedTeamsError } = await supabase
          .from("team_managers")
          .select("team_id")
          .eq("user_id", user.id);
        if (managedTeamsError) {
          console.error("Error fetching managed teams:", managedTeamsError);
          return;
        }
        if (!managedTeams || managedTeams.length === 0) {
          setTeams([]);
          return;
        }
        const teamIds = managedTeams.map((tm) => tm.team_id);
        teamsResult = await supabase
          .from("teams")
          .select("*")
          .in("id", teamIds);
      }
      if (teamsResult.error) {
        console.error("Error fetching teams:", teamsResult.error);
        return;
      }
      const [membersResult, profilesResult, userRolesResult] =
        await Promise.all([
          supabase.from("team_members").select("*"),
          supabase
            .from("profiles")
            .select("id, first_name, last_name, email, profile_image_url"),
          supabase.from("user_roles").select("user_id, role"),
        ]);
      if (
        membersResult.error ||
        profilesResult.error ||
        userRolesResult.error
      ) {
        console.error("Error fetching data:", {
          membersError: membersResult.error,
          profilesError: profilesResult.error,
          userRolesError: userRolesResult.error,
        });
        return;
      }

      const profileMap = createProfileMap(profilesResult.data as Profile[]);
      const userRolesMap = createUserRolesMap(userRolesResult.data);
      const teamsWithMembers = transformTeamsData(
        teamsResult.data,
        membersResult.data,
        profileMap,
        userRolesMap
      );
      setTeams(teamsWithMembers);
    } catch (error) {
      console.error("Error fetching teams:", error);
    } finally {
      setLoading(false);
    }
  };
  return { teams, loading, fetchTeams };
};

const useBulletins = (teamId: string | null) => {
  const [bulletins, setBulletins] = useState<TeamBulletins[]>([]);
  const [loading, setLoading] = useState(false);
  const fetchBulletins = async (): Promise<void> => {
    if (!teamId) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("team_bulletins")
        .select("*")
        .eq("team_id", teamId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setBulletins(data ?? []);
    } catch (error) {
      console.error("Error fetching bulletins:", error);
    } finally {
      setLoading(false);
    }
  };
  return { bulletins, loading, fetchBulletins };
};

const createProfileMap = (profiles: Profile[]): Map<string, ProfileInfo> => {
  return new Map(
    profiles.map((profile) => [
      profile.id,
      {
        name:
          profile.first_name && profile.last_name
            ? `${profile.first_name} ${profile.last_name}`
            : profile.email?.split("@")[0] ?? "Unknown User",
        email: profile.email,
        profile_image_url: profile.profile_image_url,
      },
    ])
  );
};

const createUserRolesMap = (
  userRoles: { user_id: string; role: string }[]
): Map<string, string[]> => {
  const userRolesMap = new Map<string, string[]>();
  userRoles.forEach((userRole) => {
    if (!userRolesMap.has(userRole.user_id)) {
      userRolesMap.set(userRole.user_id, []);
    }
    userRolesMap.get(userRole.user_id)?.push(userRole.role);
  });
  return userRolesMap;
};

const formatRoleName = (role: string): string => {
  return role
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const formatAllRoles = (roles: string[]): string => {
  if (roles.length === 0) return "Agent";
  return roles.map(formatRoleName).join(", ");
};

const transformTeamsData = (
  teams,
  teamMembers,
  profileMap: Map<string, ProfileInfo>,
  userRolesMap: Map<string, string[]>
): TransformedTeam[] => {
  return teams.map((team) => ({
    ...team,
    performance: 0,
    members: teamMembers
      .filter((member) => member.team_id === team.id)
      .map((member): TeamMember => {
        const userRoles = userRolesMap.get(member.user_id) ?? [];
        const formattedRoles = formatAllRoles(userRoles);
        return {
          ...member,
          name: profileMap.get(member.user_id)?.name ?? "Unknown User",
          email: profileMap.get(member.user_id)?.email,
          profile_image_url:
            profileMap.get(member.user_id)?.profile_image_url ?? null,
          created_at: member.created_at ?? new Date().toISOString(),
          updated_at: member.updated_at ?? new Date().toISOString(),
          role: formattedRoles,
          roles: userRoles,
        };
      }),
  }));
};

const fetchDailyMetrics = async (
  userIds: string[],
  timeRange: TimeRange
): Promise<DailyMetric[]> => {
  let startDate: Date;
  const dataYear = 2025;
  switch (timeRange) {
    case "weekly":
      startDate = new Date(dataYear, 11, 25);
      break;
    case "monthly":
      startDate = new Date(dataYear, 0, 1);
      break;
    case "ytd":
      startDate = new Date(dataYear, 0, 1);
      break;
    default:
      startDate = new Date(dataYear, 0, 1);
  }
  const startDateStr = startDate.toISOString().split("T")[0];
  const { data, error } = await supabase
    .from("daily_metrics")
    .select("*")
    .in("user_id", userIds)
    .gte("date", startDateStr)
    .order("date", { ascending: true });
  if (error) {
    throw error;
  }
  return data as DailyMetric[];
};

const fetchMeetingData = async (
  userIds: string[]
): Promise<{
  meetings: Meeting[];
  meetingNotes: MeetingNote[];
}> => {
  const { data: meetings, error: meetingsError } = await supabase
    .from("one_on_one_meetings")
    .select("id, created_by")
    .in("created_by", userIds);
  if (meetingsError) throw meetingsError;
  const meetingIds = meetings?.map((m) => m.id) ?? [];
  const { data: meetingNotes, error: notesError } = await supabase
    .from("meeting_notes")
    .select("*")
    .in("meeting_id", meetingIds);
  if (notesError) throw notesError;
  return {
    meetings: meetings as Meeting[],
    meetingNotes: meetingNotes as MeetingNote[],
  };
};

const aggregateMetricsByUser = (
  metricsData: DailyMetric[]
): Record<string, MetricCount> => {
  const metricsByUser: Record<string, MetricCount> = {};
  metricsData.forEach((row) => {
    metricsByUser[row.user_id] ??= {
      leads: 0,
      calls: 0,
      contacts: 0,
      scheduled: 0,
      sits: 0,
      sales: 0,
      ap: 0,
    };
    const userMetrics = metricsByUser[row.user_id];
    userMetrics.leads += row.leads ?? 0;
    userMetrics.calls += row.calls ?? 0;
    userMetrics.contacts += row.contacts ?? 0;
    userMetrics.scheduled += row.scheduled ?? 0;
    userMetrics.sits += row.sits ?? 0;
    userMetrics.sales += row.sales ?? 0;
    if (row.ap && row.ap > 0) {
      userMetrics.ap += row.ap;
    }
  });
  return metricsByUser;
};

const enrichMetricsWithRatios = (
  metricsByUser: Record<string, MetricCount>
): Record<string, MemberMetrics> => {
  const enrichedMetrics: Record<string, MemberMetrics> = {};
  Object.entries(metricsByUser).forEach(([userId, metrics]) => {
    const conversion =
      metrics.leads > 0 ? Math.round((metrics.sales / metrics.leads) * 100) : 0;
    enrichedMetrics[userId] = {
      ...metrics,
      conversion,
      ratios: convertRatiosToObject(calculateRatios(metrics)),
    };
  });
  return enrichedMetrics;
};

const organizeMeetingNotesByUser = (
  meetings: Meeting[],
  meetingNotes: MeetingNote[]
): Record<string, MeetingNote[]> => {
  const meetingIdToCreator: Record<string, string> = {};
  meetings.forEach((meeting) => {
    meetingIdToCreator[meeting.id] = meeting.created_by;
  });
  const meetingNotesByUser: Record<string, MeetingNote[]> = {};
  meetingNotes.forEach((note) => {
    const userId = meetingIdToCreator[note.meeting_id];
    if (!userId) return;
    if (!meetingNotesByUser[userId]) {
      meetingNotesByUser[userId] = [];
    }
    meetingNotesByUser[userId].push(note);
  });
  return meetingNotesByUser;
};

const convertRatiosToObject = (
  ratios: { label: string; value: string | number }[] | MetricRatios
): MetricRatios => {
  try {
    if (typeof ratios === "object" && !Array.isArray(ratios)) {
      return ratios;
    }
    if (!Array.isArray(ratios)) {
      console.warn("Ratios is not an array:", ratios);
      return {} as MetricRatios;
    }
    return ratios.reduce((acc, r) => {
      if (!r || typeof r !== "object" || !("label" in r) || !("value" in r)) {
        console.warn("Invalid ratio object:", r);
        return acc;
      }
      try {
        const key = r.label
          .replace(/\s+/g, " ")
          .replace(/[^a-zA-Z0-9 ]/g, "")
          .replace(/ ([a-z])/g, (_, c: string) => c.toUpperCase())
          .replace(/ /g, "");
        const camelKey = key.charAt(0).toLowerCase() + key.slice(1);
        acc[camelKey] = String(r.value);
        return acc;
      } catch (error) {
        console.warn("Error processing ratio:", r, error);
        return acc;
      }
    }, {} as MetricRatios);
  } catch (error) {
    console.error("Error in convertRatiosToObject:", error);
    return {} as MetricRatios;
  }
};

const transformMemberData = (
  members: TeamMember[],
  enrichedMetrics: Record<string, MemberMetrics>,
  meetingNotesByUser: Record<string, MeetingNote[]>,
  userRolesMap: Map<string, string[]>
): EnrichedMember[] => {
  try {
    if (!Array.isArray(members)) {
      console.warn("Invalid members array:", members);
      return [];
    }
    return members
      .map((member) => {
        try {
          if (!member || typeof member !== "object" || !("user_id" in member)) {
            console.warn("Invalid member object:", member);
            return null;
          }
          const defaultMetrics = {
            leads: 0,
            calls: 0,
            contacts: 0,
            scheduled: 0,
            sits: 0,
            sales: 0,
            ap: 0,
          } as MetricCount;
          const metrics = enrichedMetrics[member.user_id];
          const userRoles = userRolesMap.get(member.user_id) || [];
          const formattedRoles = formatAllRoles(userRoles);

          if (!metrics) {
            return {
              user_id: member.user_id,
              name: member.name || "Unknown User",
              role: formattedRoles,
              roles: userRoles,
              email: member.email || undefined,
              profile_image_url: member.profile_image_url || null,
              metrics: {
                ...defaultMetrics,
                conversion: 0,
                ratios: convertRatiosToObject(calculateRatios(defaultMetrics)),
              },
              notes: meetingNotesByUser[member.user_id] || [],
            };
          }
          const ratios =
            metrics.ratios ||
            calculateRatios({
              leads: metrics.leads,
              calls: metrics.calls,
              contacts: metrics.contacts,
              scheduled: metrics.scheduled,
              sits: metrics.sits,
              sales: metrics.sales,
              ap: metrics.ap,
            });
          return {
            user_id: member.user_id,
            name: member.name || "Unknown User",
            role: formattedRoles,
            roles: userRoles,
            email: member.email || undefined,
            profile_image_url: member.profile_image_url || null,
            metrics: {
              leads: Number(metrics.leads) || 0,
              calls: Number(metrics.calls) || 0,
              contacts: Number(metrics.contacts) || 0,
              scheduled: Number(metrics.scheduled) || 0,
              sits: Number(metrics.sits) || 0,
              sales: Number(metrics.sales) || 0,
              ap: Number(metrics.ap) || 0,
              conversion: Number(metrics.conversion) || 0,
              ratios: convertRatiosToObject(ratios),
            },
            notes: meetingNotesByUser[member.user_id] || [],
          };
        } catch (error) {
          console.error("Error processing member:", member, error);
          return null;
        }
      })
      .filter(
        (member): member is NonNullable<typeof member> => member !== null
      );
  } catch (error) {
    console.error("Error in transformMemberData:", error);
    return [];
  }
};

// Main component
const ManagerDashboard = () => {
  const { teams, fetchTeams } = useTeams();
  const [selectedTeam, setSelectedTeam] = useState<TransformedTeam | null>(
    null
  );
  const [selectedTeamNode, setSelectedTeamNode] = useState<TeamNode | null>(
    null
  );
  const [members, setMembers] = useState<EnrichedMember[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [timeRange, setTimeRange] = useState<TimeRange>("weekly");
  const [filterRole, setFilterRole] = useState<string>("all");

  const {
    bulletins,
    loading: bulletinsLoading,
    fetchBulletins,
  } = useBulletins(selectedTeam?.id || null);

  const handleTeamSelect = (
    teamId: string | null,
    teamData: TeamNode | null
  ) => {
    setSelectedTeamNode(teamData);
    if (teamData) {
      const transformedTeam = teams.find((team) => team.id === teamId);
      setSelectedTeam(transformedTeam || null);
    } else {
      setSelectedTeam(null);
    }
  };

  const getAllMemberIds = (teamNode: TeamNode): string[] => {
    const memberIds: string[] = [];
    const collectFromMembers = (
      members: { member: { id: string }; subordinates?: any[] }[]
    ) => {
      members.forEach((member) => {
        memberIds.push(member.member.id);
        if (member.subordinates && member.subordinates.length > 0) {
          collectFromMembers(member.subordinates);
        }
      });
    };
    collectFromMembers(teamNode.members);
    return memberIds;
  };

  const selectedTeamMemberIds = selectedTeamNode
    ? getAllMemberIds(selectedTeamNode)
    : [];

  const { data: teamMemberMetrics, isLoading: isLoadingTeamMetrics } = useQuery(
    {
      queryKey: ["team-member-metrics", selectedTeamMemberIds, timeRange],
      queryFn: async () => {
        if (!selectedTeamMemberIds.length) return [];
        const today = new Date();
        let startDate: Date;
        let endDate: Date = today;
        switch (timeRange) {
          case "weekly":
            // Week to date: start of current week (Monday) to today
            const dayOfWeek = today.getDay();
            const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Monday = 0, Sunday = 6
            startDate = new Date(today);
            startDate.setDate(today.getDate() - daysFromMonday);
            startDate.setHours(0, 0, 0, 0);
            break;
          case "monthly":
            // Month to date: start of current month to today
            startDate = startOfMonth(today);
            break;
          case "ytd":
          default:
            // Year to date: start of current year to today
            startDate = new Date(today.getFullYear(), 0, 1);
            break;
        }
        const monthStart = format(startDate, "yyyy-MM-dd");
        const monthEnd = format(endDate, "yyyy-MM-dd");
        // Get profiles and roles for all members
        const [profilesResult, userRolesResult] = await Promise.all([
          supabase
            .from("profiles")
            .select("id, first_name, last_name, email, profile_image_url")
            .in("id", selectedTeamMemberIds),
          supabase
            .from("user_roles")
            .select("user_id, role")
            .in("user_id", selectedTeamMemberIds)
        ]);

        if (profilesResult.error) throw profilesResult.error;
        if (userRolesResult.error) throw userRolesResult.error;

        const profileMap = profilesResult.data.reduce((acc, profile) => {
          acc[profile.id] = profile;
          return acc;
        }, {} as Record<string, { id: string; first_name: string | null; last_name: string | null; email: string | null; profile_image_url: string | null }>);

        // Create roles map
        const rolesMap = new Map<string, string[]>();
        userRolesResult.data.forEach((userRole) => {
          if (!rolesMap.has(userRole.user_id)) {
            rolesMap.set(userRole.user_id, []);
          }
          rolesMap.get(userRole.user_id)?.push(userRole.role);
        });
        return await Promise.all(
          selectedTeamMemberIds.map(async (userId) => {
            const { data: metrics, error: metricsError } = await supabase
              .from("daily_metrics")
              .select("leads, calls, contacts, scheduled, sits, sales, ap")
              .eq("user_id", userId)
              .gte("date", monthStart)
              .lte("date", monthEnd);
            if (metricsError) throw metricsError;
            const summary = metrics.reduce(
              (acc, curr) => ({
                leads: acc.leads + (curr.leads || 0),
                calls: acc.calls + (curr.calls || 0),
                contacts: acc.contacts + (curr.contacts || 0),
                scheduled: acc.scheduled + (curr.scheduled || 0),
                sits: acc.sits + (curr.sits || 0),
                sales: acc.sales + (curr.sales || 0),
                ap: acc.ap + (curr.ap && curr.ap > 0 ? curr.ap : 0),
              }),
              {
                leads: 0,
                calls: 0,
                contacts: 0,
                scheduled: 0,
                sits: 0,
                sales: 0,
                ap: 0,
              }
            );
            const profile = profileMap[userId] || {
              id: userId,
              first_name: null,
              last_name: null,
              email: null,
              profile_image_url: null,
            };
            const conversion =
              summary.leads > 0 ? (summary.sales / summary.leads) * 100 : 0;
            const ratiosArray = calculateRatios(summary as MetricCount);
            const ratios = ratiosArray.reduce((acc, ratio) => {
              const key = ratio.label
                .replace(/\s+/g, " ")
                .replace(/[^a-zA-Z0-9 ]/g, "")
                .replace(/ ([a-z])/g, (_, c: string) => c.toUpperCase())
                .replace(/ /g, "");
              const camelKey = key.charAt(0).toLowerCase() + key.slice(1);
              acc[camelKey] = ratio.value;
              return acc;
            }, {} as Record<string, string>);
            // Get user roles and format them
            const userRoles = rolesMap.get(userId) || [];
            const formattedRoles = userRoles.length > 0 
              ? userRoles.map(role => 
                  role.split("_")
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")
                ).join(", ")
              : "Agent";

            return {
              user_id: userId,
              name:
                `${profile.first_name || ""} ${
                  profile.last_name || ""
                }`.trim() || "Unknown",
              role: formattedRoles,
              profile_image_url: profile.profile_image_url,
              metrics: {
                ...summary,
                conversion: Math.round(conversion * 100) / 100,
                ratios: ratios,
              },
              notes: [],
            };
          })
        );
      },
      enabled: selectedTeamMemberIds.length > 0,
      staleTime: 1000 * 60 * 5,
    }
  );

  const fetchTeamMemberMetrics = async (): Promise<void> => {
    if (!selectedTeam) return;
    try {
      const userIds = selectedTeam.members.map((m) => m.user_id);
      if (!userIds.length) return;
      const [metricsData, { meetings, meetingNotes }, userRolesResult] =
        await Promise.all([
          fetchDailyMetrics(userIds, timeRange),
          fetchMeetingData(userIds),
          supabase
            .from("user_roles")
            .select("user_id, role")
            .in("user_id", userIds),
        ]);
      const metricsByUser = aggregateMetricsByUser(metricsData);
      const enrichedMetrics = enrichMetricsWithRatios(metricsByUser);
      const meetingNotesByUser = organizeMeetingNotesByUser(
        meetings,
        meetingNotes
      );
      const userRolesMap = createUserRolesMap(userRolesResult.data || []);
      const transformedMembers = transformMemberData(
        selectedTeam.members as TeamMember[],
        enrichedMetrics,
        meetingNotesByUser,
        userRolesMap
      );
      setMembers(transformedMembers);
    } catch (error) {
      console.error("Error fetching team member metrics:", error);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);
  useEffect(() => {
    if (teams.length > 0 && !selectedTeam) {
      setSelectedTeam(teams[0]);
    }
  }, [teams]);
  useEffect(() => {
    fetchBulletins();
  }, [selectedTeam]);
  useEffect(() => {
    if (selectedTeam) {
      fetchTeamMemberMetrics();
    }
  }, [selectedTeam, timeRange]);
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterRole]);

  return (
    <div className="w-full min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 py-4">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Team Dashboard</h2>
          <p className="text-muted-foreground mt-1">
            Manage your team and monitor performance
          </p>
        </div>
        <div className="space-y-6">
          <Card className="w-full p-4 sm:p-6 shadow-sm bg-[#F1F1F1]">
            <div className="space-y-6">
              {/* Teams and Bulletin */}
              <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SmartTeamDashboard onTeamSelect={handleTeamSelect} />
                <TeamBulletIns
                  bulletins={bulletins || []}
                  loading={bulletinsLoading}
                />
              </section>
              {/* Team Members Section */}
              <section className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold mb-6">TEAM METRICS</h2>
                <div className="space-y-6">
                  {/* Filters */}
                  <div className="flex justify-end gap-4 w-full sm:w-auto">
                    <Input
                      placeholder="Search members..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full sm:w-[200px]"
                    />
                    <Select value={filterRole} onValueChange={setFilterRole}>
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Filter by role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        {(() => {
                          // Get all unique roles from team members
                          const allRoles = new Set<string>();
                          if (teamMemberMetrics) {
                            teamMemberMetrics.forEach(member => {
                              if (member.role) {
                                // Split by comma and add each role
                                member.role.split(',').forEach(role => {
                                  allRoles.add(role.trim());
                                });
                              }
                            });
                          }
                          return Array.from(allRoles).sort().map(role => (
                            <SelectItem key={role} value={role}>{role}</SelectItem>
                          ));
                        })()}
                      </SelectContent>
                    </Select>
                    <Select
                      value={timeRange}
                      onValueChange={(value: TimeRange) => setTimeRange(value)}
                    >
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Select time range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Week to Date</SelectItem>
                        <SelectItem value="monthly">Month to Date</SelectItem>
                        <SelectItem value="ytd">Year to Date</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Team Members */}
                  {selectedTeamNode ? (
                    <div className="space-y-6">
                      <div className="flex items-center gap-2 mb-4">
                        <h3 className="text-lg font-semibold">
                          {selectedTeamNode.team.name} Members
                        </h3>
                        <span className="text-sm text-muted-foreground">
                          ({selectedTeamNode.members.length} members)
                        </span>
                      </div>

                      {(() => {
                        // Filter teamMemberMetrics based on search and role
                        const filteredTeamMembers = teamMemberMetrics?.filter((member) => {
                          const searchTerms = searchQuery.toLowerCase().trim().split(/\s+/);
                          const memberName = member.name.toLowerCase();
                          const matchesSearch = searchTerms.every((term) =>
                            memberName.includes(term)
                          );
                          const memberRole = member.role?.toLowerCase() || "";
                          const matchesRole =
                            filterRole === "all" ||
                            memberRole.includes(filterRole.toLowerCase());
                          return matchesSearch && matchesRole;
                        }) || [];

                        if (isLoadingTeamMetrics) {
                          return (
                            <div className="flex items-center justify-center h-full min-h-72">
                              <Loader2 className="w-4 h-4 animate-spin" />
                            </div>
                          );
                        }

                        if (filteredTeamMembers.length === 0) {
                          return (
                            <div className="text-center py-8 text-muted-foreground">
                              <p>No metrics data available for team members</p>
                            </div>
                          );
                        }

                        return (
                          <>
                            {filteredTeamMembers.map((member) => {
                          const successScore = calculateSuccessScore(
                            member.metrics.conversion
                          );
                          const timeRangeLabel = getTimeRangeLabel(timeRange);

                          return (
                            <div
                              key={member.user_id}
                              className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                            >
                              {/* Header Section */}
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                  {member.profile_image_url ? (
                                    <img
                                      src={member.profile_image_url}
                                      alt={`${member.name} profile`}
                                      className="size-10 rounded-full object-cover"
                                    />
                                  ) : (
                                    <div className="size-10 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium">
                                      {member.name.charAt(0).toUpperCase()}
                                    </div>
                                  )}
                                  <div>
                                    <h3 className="font-semibold">
                                      {member.name}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                      {member.role}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <div className="text-sm font-medium text-green-600">
                                    {member.metrics.conversion}% Conversion
                                  </div>
                                  <Progress
                                    value={member.metrics.conversion}
                                    className="w-24 h-2"
                                  />
                                </div>
                              </div>

                              {/* Primary Metrics */}
                              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
                                {PRIMARY_METRICS.map(
                                  ({ key, label, colorClass }) => (
                                    <div
                                      key={key}
                                      className="bg-blue-50 p-3 rounded-lg text-center"
                                    >
                                      <div
                                        className={`text-lg font-bold ${colorClass}`}
                                      >
                                        {
                                          member.metrics[
                                            key as keyof typeof member.metrics
                                          ] as number
                                        }
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        {label}
                                      </div>
                                    </div>
                                  )
                                )}
                                <div className="bg-green-50 p-3 rounded-lg text-center col-span-2">
                                  <div className="text-lg font-bold text-green-600">
                                    ${member.metrics.ap.toFixed(2)}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    AP
                                  </div>
                                </div>
                              </div>
                              {/* Ratio Cards */}
                              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
                                {RATIO_METRICS.map(({ key, label, format }) => (
                                  <div
                                    key={key}
                                    className="bg-gray-100 p-2 rounded text-center"
                                  >
                                    <div className="text-sm font-semibold">
                                      {formatValue(
                                        String(
                                          member.metrics.ratios[
                                            key as keyof typeof member.metrics.ratios
                                          ] || ""
                                        ),
                                        format
                                      )}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {label}
                                    </div>
                                  </div>
                                ))}
                              </div>
                              {/* Success Calculator and 1:1 Notes */}
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
                                {/* Success Calculator Section */}
                                <div className="space-y-4">
                                  <h3 className="text-sm font-semibold">
                                    SUCCESS CALCULATOR
                                  </h3>
                                  <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                      <div className="flex items-center space-x-2 mb-1">
                                        <TrendingUp className="h-4 w-4 text-green-600" />
                                        <span className="text-xs font-medium">
                                          Conversion Rate
                                        </span>
                                      </div>
                                      <div className="text-lg font-bold text-green-600">
                                        {member.metrics.conversion}%
                                      </div>
                                      <p className="text-xs text-muted-foreground">
                                        {timeRangeLabel} Rate
                                      </p>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                      <div className="flex items-center space-x-2 mb-1">
                                        <Target className="h-4 w-4 text-blue-600" />
                                        <span className="text-xs font-medium">
                                          Success Score
                                        </span>
                                      </div>
                                      <div className="text-lg font-bold text-blue-600">
                                        {successScore}
                                      </div>
                                      <p className="text-xs text-muted-foreground">
                                        {timeRangeLabel} Rating
                                      </p>
                                    </div>
                                  </div>
                                  <div>
                                    <div className="flex items-center justify-between text-xs mb-1">
                                      <span>Individual Progress</span>
                                      <span>{member.metrics.conversion}%</span>
                                    </div>
                                    <Progress
                                      value={member.metrics.conversion}
                                      className="h-1.5"
                                    />
                                  </div>
                                </div>
                                {/* 1:1 Notes Section */}
                                <div className="space-y-4">
                                  <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-semibold">
                                      1:1 NOTES
                                    </h3>
                                    <div className="flex items-center space-x-2">
                                      <Phone className="h-4 w-4 text-muted-foreground" />
                                      <Calendar className="h-4 w-4 text-muted-foreground" />
                                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                  </div>
                                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                                    {member.notes.length > 0 ? (
                                      member.notes.map((note) => (
                                        <div
                                          key={note.id}
                                          className="p-2 bg-gray-50 rounded-lg"
                                        >
                                          <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs font-medium">
                                              {new Date(
                                                note.created_at
                                              ).toLocaleDateString()}
                                            </span>
                                          </div>
                                          <p className="text-xs text-gray-600">
                                            {note.content}
                                          </p>
                                        </div>
                                      ))
                                    ) : (
                                      <p className="text-xs text-muted-foreground">
                                        No 1:1 notes available
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                            );
                            })}
                          </>
                        );
                      })()}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>Select a team to view its members</p>
                    </div>
                  )}
                </div>
              </section>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
