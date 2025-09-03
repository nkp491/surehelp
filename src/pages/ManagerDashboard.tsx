import { Button } from "@/components/ui/button";
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
import TeamList from "@/components/manager/TeamList";
import TeamBulletIns from "@/components/manager/TeamBulletIns";
import MemberCard from "@/components/manager/MemberCard";
import { calculateRatios } from "@/utils/metricsUtils";
import { Loader2 } from "lucide-react";
import { MetricCount } from "@/types/metrics";

type TimeRange = "weekly" | "monthly" | "ytd";

const useTeams = () => {
  const [teams, setTeams] = useState<TransformedTeam[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTeams = async (): Promise<void> => {
    try {
      setLoading(true);
      const [teamsResult, membersResult, profilesResult] = await Promise.all([
        supabase.from("teams").select("*"),
        supabase.from("team_members").select("*"),
        supabase
          .from("profiles")
          .select("id, first_name, last_name, email, profile_image_url"),
      ]);
      if (teamsResult.error || membersResult.error || profilesResult.error) {
        console.error("Error fetching data:", {
          teamsError: teamsResult.error,
          membersError: membersResult.error,
          profilesError: profilesResult.error,
        });
        return;
      }
      const profileMap = createProfileMap(profilesResult.data as Profile[]);
      const teamsWithMembers = transformTeamsData(
        teamsResult.data,
        membersResult.data,
        profileMap
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

const transformTeamsData = (
  teams,
  teamMembers,
  profileMap: Map<string, ProfileInfo>
): TransformedTeam[] => {
  return teams.map((team) => ({
    ...team,
    performance: 0,
    members: teamMembers
      .filter((member) => member.team_id === team.id)
      .map(
        (member): TeamMember => ({
          ...member,
          name: profileMap.get(member.user_id)?.name ?? "Unknown User",
          email: profileMap.get(member.user_id)?.email,
          profile_image_url:
            profileMap.get(member.user_id)?.profile_image_url ?? null,
          created_at: member.created_at ?? new Date().toISOString(),
          updated_at: member.updated_at ?? new Date().toISOString(),
        })
      ),
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
    
    // For AP, sum all values (don't average)
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
    // If ratios is already an object, return it
    if (typeof ratios === "object" && !Array.isArray(ratios)) {
      return ratios as MetricRatios;
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
  meetingNotesByUser: Record<string, MeetingNote[]>
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
          if (!metrics) {
            return {
              user_id: member.user_id,
              name: member.name || "Unknown User",
              role: member.role || "Unknown Role",
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
            role: member.role || "Unknown Role",
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
      .filter((member): member is NonNullable<typeof member> => member !== null);
  } catch (error) {
    console.error("Error in transformMemberData:", error);
    return [];
  }
};

// Main component
const ManagerDashboard = () => {
  const { teams, loading: teamsLoading, fetchTeams } = useTeams();
  const [selectedTeam, setSelectedTeam] = useState<TransformedTeam | null>(
    null
  );
  const [members, setMembers] = useState<EnrichedMember[]>([]);
  const [teamMetricsLoading, setTeamMetricsLoading] = useState(false);
  // UI state
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [timeRange, setTimeRange] = useState<TimeRange>("ytd");
  const [sortBy, setSortBy] = useState<"asc" | "desc">("asc");
  const [filterRole, setFilterRole] = useState<string>("all");

  const {
    bulletins,
    loading: bulletinsLoading,
    fetchBulletins,
  } = useBulletins(selectedTeam?.id || null);

  const fetchTeamMemberMetrics = async (): Promise<void> => {
    if (!selectedTeam) return;
    setTeamMetricsLoading(true);
    try {
      const userIds = selectedTeam.members.map((m) => m.user_id);
      if (!userIds.length) return;
      const [metricsData, { meetings, meetingNotes }] = await Promise.all([
        fetchDailyMetrics(userIds, timeRange),
        fetchMeetingData(userIds),
      ]);
      const metricsByUser = aggregateMetricsByUser(metricsData);
      const enrichedMetrics = enrichMetricsWithRatios(metricsByUser);
      const meetingNotesByUser = organizeMeetingNotesByUser(
        meetings,
        meetingNotes
      );
      const transformedMembers = transformMemberData(
        selectedTeam.members as TeamMember[],
        enrichedMetrics,
        meetingNotesByUser
      );
      setMembers(transformedMembers);
    } catch (error) {
      console.error("Error fetching team member metrics:", error);
    } finally {
      setTeamMetricsLoading(false);
    }
  };

  // Effects
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
  }, [searchQuery, filterRole, itemsPerPage]);

  const filteredMembers = members.filter((member) => {
    const searchTerms = searchQuery.toLowerCase().trim().split(/\s+/);
    const memberName = member.name.toLowerCase();
    const matchesSearch = searchTerms.every((term) =>
      memberName.includes(term)
    );
    const memberRole = member.role?.toLowerCase() || "";
    const matchesRole =
      filterRole === "all" ||
      (filterRole === "Agent" && memberRole.includes("agent")) ||
      (filterRole === "Manager" && memberRole.includes("manager"));
    return matchesSearch && matchesRole;
  });

  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMembers = filteredMembers.slice(startIndex, endIndex);

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
                <TeamList
                  teams={teams}
                  setSelectedTeam={setSelectedTeam}
                  loading={teamsLoading}
                />
                <TeamBulletIns
                  bulletins={bulletins || []}
                  loading={bulletinsLoading}
                />
              </section>
              {/* Team Members Section */}
              <section className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold mb-6">TEAM MEMBERS</h2>
                <div className="space-y-6">
                  {/* Filters */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
                      <Input
                        placeholder="Search members..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full sm:w-[200px]"
                      />
                      <div className="flex flex-wrap gap-2">
                        <Select
                          value={filterRole}
                          onValueChange={setFilterRole}
                        >
                          <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Filter by role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Roles</SelectItem>
                            <SelectItem value="Agent">Agent</SelectItem>
                            <SelectItem value="Manager">Manager</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select
                          value={timeRange}
                          onValueChange={(value: TimeRange) =>
                            setTimeRange(value)
                          }
                        >
                          <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Select time range" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="ytd">Year to Date</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select
                          value={itemsPerPage.toString()}
                          onValueChange={(value) =>
                            setItemsPerPage(Number(value))
                          }
                        >
                          <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Items per page" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="10">10 per page</SelectItem>
                            <SelectItem value="20">20 per page</SelectItem>
                            <SelectItem value="50">50 per page</SelectItem>
                            <SelectItem value="100">100 per page</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setSortBy(sortBy === "asc" ? "desc" : "asc")
                        }
                      >
                        {sortBy === "asc" ? "Sort ↑" : "Sort ↓"}
                      </Button>
                    </div>
                  </div>
                  {/* Pagination */}
                  <div className="flex items-center justify-between py-4">
                    <div className="text-sm text-muted-foreground">
                      Showing {startIndex + 1}-
                      {Math.min(endIndex, filteredMembers.length)} of{" "}
                      {filteredMembers.length} members
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(1, prev - 1))
                        }
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <div className="text-sm">
                        Page {currentPage} of {totalPages}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(totalPages, prev + 1)
                          )
                        }
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                  {/* Team Members */}
                  {teamMetricsLoading ? (
                    <div className="flex items-center justify-center h-full min-h-72">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                  ) : (
                    currentMembers.map((member) => (
                      <MemberCard
                        data={member}
                        key={member.user_id}
                        timeRange={timeRange}
                      />
                    ))
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
