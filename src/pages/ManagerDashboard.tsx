import {
  Settings,
  Phone,
  Calendar,
  MessageSquare,
  Target,
  TrendingUp,
  Plus,
  Minus,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { Metrics, teamAgents, notes } from "@/lib/data";
import { supabase } from "@/integrations/supabase/client";
import { TransformedTeam, TeamBulletins } from "@/types/team";
import TeamList from "@/components/manager/TeamList";
import TeamBulletIns from "@/components/manager/TeamBulletIns";

type TimeRange = "weekly" | "monthly" | "ytd";

const ManagerDashboard = () => {
  const [teams, setTeams] = useState<TransformedTeam[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<TransformedTeam | null>(null);
  const [selectedTeams, setSelectedTeams] = useState(null);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAddAgentModalOpen, setIsAddAgentModalOpen] = useState(false);
  const [isRemoveAgentModalOpen, setIsRemoveAgentModalOpen] = useState(false);
  const [agentToRemove, setAgentToRemove] = useState<{ name: string; team: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [teamsLoading, setTeamsLoading] = useState(false);
  const [bulletins, setBulletins] = useState<TeamBulletins[]>([]);
  const [bulletinsLoading, setBulletinsLoading] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>("ytd");
  const [sortBy, setSortBy] = useState<{
    field: string;
    direction: "asc" | "desc";
  }>({ field: "name", direction: "asc" });
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterMetrics, setFilterMetrics] = useState<{
    conversion: { min: number; max: number };
    ap: { min: number; max: number };
  }>({
    conversion: { min: 0, max: 100 },
    ap: { min: 0, max: 5000 },
  });
  const [newAgent, setNewAgent] = useState({
    name: "",
    role: "",
    team: "",
  });

  const fetchData = async () => {
    try {
      setTeamsLoading(true);
      const { data: teams, error: teamsError } = await supabase.from("teams").select("*");
      const { data: teamMembers, error: membersError } = await supabase
        .from("team_members")
        .select("*");
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, email, profile_image_url")
        .in("id", teamMembers?.map((member) => member.user_id) || []);
      if (teamsError || membersError || profilesError) {
        console.error("Error fetching data:", { teamsError, membersError, profilesError });
        return;
      }
      const profileMap = new Map(
        profiles.map((profile) => [
          profile.id,
          {
            name:
              profile.first_name && profile.last_name
                ? `${profile.first_name ?? ""} ${profile.last_name ?? ""}`
                : profile.email?.split("@")[0] ?? "Unknown User",
            email: profile.email,
            profile_image_url: profile.profile_image_url,
          },
        ])
      );
      const teamsWithMembers = teams.map((team) => ({
        ...team,
        performance: 0,
        members: teamMembers
          .filter((member) => member.team_id === team.id)
          .map((member) => ({
            ...member,
            name: profileMap.get(member.user_id)?.name ?? "Unknown User",
            email: profileMap.get(member.user_id)?.email,
            profile_image_url: profileMap.get(member.user_id)?.profile_image_url ?? null,
          })),
      }));
      setTeams(teamsWithMembers);
      if (teamsWithMembers.length > 0) {
        setSelectedTeam(teamsWithMembers[0]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setTeamsLoading(false);
    }
  };

  const fetchBulletins = async () => {
    if (!selectedTeam?.id) return;
    try {
      setBulletinsLoading(true);
      const { data, error } = await supabase
        .from("team_bulletins")
        .select("*")
        .eq("team_id", selectedTeam.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setBulletins(data ?? []);
    } catch (error) {
      console.error("Error fetching bulletins:", error);
    } finally {
      setBulletinsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchBulletins();
  }, [selectedTeam]);

  // Add new helper function to generate time-based metrics
  const generateTimeBasedMetrics = (
    baseMetrics: Metrics
  ): { weekly: Metrics; monthly: Metrics } => {
    const generateVariation = (value: number): { weekly: number; monthly: number } => {
      const weeklyVariation = value * (0.8 + Math.random() * 0.4); // 80-120% of base value
      const monthlyVariation = value * (0.9 + Math.random() * 0.2); // 90-110% of base value
      return {
        weekly: Math.round(weeklyVariation),
        monthly: Math.round(monthlyVariation),
      };
    };

    const generateRatioVariation = (value: number): { weekly: number; monthly: number } => {
      const weeklyVariation = Math.max(0, Math.min(100, value * (0.9 + Math.random() * 0.2)));
      const monthlyVariation = Math.max(0, Math.min(100, value * (0.95 + Math.random() * 0.1)));
      return {
        weekly: Math.round(weeklyVariation),
        monthly: Math.round(monthlyVariation),
      };
    };

    const weekly: Metrics = {
      ...baseMetrics,
      ...generateVariation(baseMetrics.leads),
      ...generateVariation(baseMetrics.calls),
      ...generateVariation(baseMetrics.contacts),
      ...generateVariation(baseMetrics.scheduled),
      ...generateVariation(baseMetrics.sits),
      ...generateVariation(baseMetrics.sales),
      ...generateVariation(baseMetrics.ap),
      ...generateRatioVariation(baseMetrics.conversion),
      ratios: Object.entries(baseMetrics.ratios).reduce(
        (acc, [key, value]) => ({
          ...acc,
          [key]: generateRatioVariation(value).weekly,
        }),
        {} as Metrics["ratios"]
      ),
    };

    const monthly: Metrics = {
      ...baseMetrics,
      ...generateVariation(baseMetrics.leads),
      ...generateVariation(baseMetrics.calls),
      ...generateVariation(baseMetrics.contacts),
      ...generateVariation(baseMetrics.scheduled),
      ...generateVariation(baseMetrics.sits),
      ...generateVariation(baseMetrics.sales),
      ...generateVariation(baseMetrics.ap),
      ...generateRatioVariation(baseMetrics.conversion),
      ratios: Object.entries(baseMetrics.ratios).reduce(
        (acc, [key, value]) => ({
          ...acc,
          [key]: generateRatioVariation(value).monthly,
        }),
        {} as Metrics["ratios"]
      ),
    };

    return { weekly, monthly };
  };

  // Add time-based metrics to each agent
  const enrichedTeamAgents = Object.entries(teamAgents).reduce(
    (acc, [teamName, agents]) => ({
      ...acc,
      [teamName]: agents.map((agent) => ({
        ...agent,
        timeBasedMetrics: generateTimeBasedMetrics(agent.metrics),
      })),
    }),
    {} as typeof teamAgents
  );

  const handleMemberClick = (memberName: string) => {
    if (selectedMember === memberName) {
      setSelectedMember(null);
    } else {
      setSelectedMember(memberName);
      setTimeout(() => {
        const memberCard = document.getElementById(
          `member-full-card-${memberName.replace(/\s+/g, "-")}`
        );
        if (memberCard) {
          memberCard.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100);
    }
  };

  const handleEditModeToggle = () => {
    setIsEditMode(!isEditMode);
  };

  const handleAddAgent = (teamName: string) => {
    setNewAgent((prev) => ({ ...prev, team: teamName }));
    setIsAddAgentModalOpen(true);
  };

  const handleAddAgentSubmit = () => {
    setIsAddAgentModalOpen(false);
    setNewAgent({ name: "", role: "", team: "" });
  };

  const handleRemoveAgent = (teamName: string, agentName: string) => {
    setAgentToRemove({ name: agentName, team: teamName });
    setIsRemoveAgentModalOpen(true);
  };

  const handleRemoveAgentConfirm = () => {
    if (agentToRemove) {
      // This would typically make an API call to remove the agent
      setIsRemoveAgentModalOpen(false);
      setAgentToRemove(null);
    }
  };

  useEffect(() => {
    console.log("selectedTeam", selectedTeam);
  }, [selectedTeam]);

  // Filter and sort function for team members
  const getFilteredMembers = () => {
    let members = selectedTeams
      ? enrichedTeamAgents[selectedTeams]
      : Object.values(enrichedTeamAgents).flat();

    // Apply search filter
    if (searchQuery) {
      members = members.filter(
        (member) =>
          member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          member.role.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Get the appropriate metrics based on selected time range
    const getMetricsForTimeRange = (member: any) => {
      switch (timeRange) {
        case "weekly":
          return member.timeBasedMetrics.weekly;
        case "monthly":
          return member.timeBasedMetrics.monthly;
        default:
          return member.metrics;
      }
    };

    // Apply role filter
    if (filterRole !== "all") {
      members = members.filter((member) => member.role === filterRole);
    }

    // Apply metrics filters using time-based metrics
    members = members.filter((member) => {
      const metrics = getMetricsForTimeRange(member);
      return (
        metrics.conversion >= filterMetrics.conversion.min &&
        metrics.conversion <= filterMetrics.conversion.max &&
        metrics.ap >= filterMetrics.ap.min &&
        metrics.ap <= filterMetrics.ap.max
      );
    });

    // Apply sorting using time-based metrics
    members.sort((a, b) => {
      const metricsA = getMetricsForTimeRange(a);
      const metricsB = getMetricsForTimeRange(b);

      let comparison = 0;
      switch (sortBy.field) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "conversion":
          comparison = metricsA.conversion - metricsB.conversion;
          break;
        case "ap":
          comparison = metricsA.ap - metricsB.ap;
          break;
      }
      return sortBy.direction === "asc" ? comparison : -comparison;
    });

    return members;
  };

  // Get paginated members
  const getPaginatedMembers = () => {
    const filtered = getFilteredMembers();
    const startIndex = (currentPage - 1) * itemsPerPage;
    return {
      members: filtered.slice(startIndex, startIndex + itemsPerPage),
      totalPages: Math.ceil(filtered.length / itemsPerPage),
      totalMembers: filtered.length,
    };
  };

  return (
    <div className="w-full min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Team Dashboard</h2>
            <p className="text-muted-foreground mt-1">Manage your team and monitor performance</p>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="w-full p-4 sm:p-6 shadow-sm bg-[#F1F1F1]">
            <div className="space-y-6">
              {/* Teams and Bulletin */}
              <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TeamList teams={teams} setSelectedTeam={setSelectedTeam} loading={teamsLoading} />
                <TeamBulletIns bulletins={bulletins || []} loading={bulletinsLoading} />
              </section>
              {/* Agents Section */}
              <section className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">TEAM MEMBERS</h2>
                  <div className="flex items-center space-x-2">
                    {isEditMode && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddAgent(selectedTeams || "All")}
                        className="flex bg-orange-300 items-center space-x-1"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add Member</span>
                      </Button>
                    )}
                    <Button
                      variant={isEditMode ? "secondary" : "ghost"}
                      size="icon"
                      onClick={handleEditModeToggle}
                    >
                      {isEditMode ? <X className="h-5 w-5" /> : <Settings className="h-5 w-5" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-6">
                  {/* Filters */}
                  <div className="flex flex-col bg-red-200 sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
                      <Input
                        placeholder="Search members..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full sm:w-[200px]"
                      />
                      <div className="flex flex-wrap gap-2">
                        <Select value={filterRole} onValueChange={setFilterRole}>
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
                          onValueChange={(value: TimeRange) => setTimeRange(value)}
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
                          onValueChange={(value) => setItemsPerPage(Number(value))}
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
                          setSortBy((prev) => ({
                            ...prev,
                            direction: prev.direction === "asc" ? "desc" : "asc",
                          }))
                        }
                      >
                        {sortBy.direction === "asc" ? "Sort ↑" : "Sort ↓"}
                      </Button>
                    </div>
                  </div>
                  {/* Pagination */}
                  <div className="flex bg-blue-200 items-center justify-between py-4">
                    <div className="text-sm text-muted-foreground">
                      Showing {getPaginatedMembers().members.length} of{" "}
                      {getPaginatedMembers().totalMembers} members
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <div className="text-sm">
                        Page {currentPage} of {getPaginatedMembers().totalPages}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(getPaginatedMembers().totalPages, prev + 1)
                          )
                        }
                        disabled={currentPage === getPaginatedMembers().totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>

                  {/* Update the team members rendering to use paginated results */}
                  <div className="space-y-6">
                    {getPaginatedMembers().members.map((agent, index) => {
                      const currentMetrics =
                        timeRange === "weekly"
                          ? agent.timeBasedMetrics.weekly
                          : timeRange === "monthly"
                          ? agent.timeBasedMetrics.monthly
                          : agent.metrics;

                      return (
                        <div
                          key={index}
                          id={`member-full-card-${agent.name.replace(/\s+/g, "-")}`}
                          className={`bg-gray-50 bg-emerald-100 p-4 rounded-lg relative cursor-pointer transition-all ${
                            selectedMember === agent.name ? "ring-2 ring-blue-500" : ""
                          }`}
                          onClick={() => handleMemberClick(agent.name)}
                        >
                          {isEditMode && (
                            <Button
                              variant="destructive"
                              size="icon"
                              className="absolute -right-2 -top-2 h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveAgent("All", agent.name);
                              }}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                          )}
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                {agent.name.charAt(0)}
                              </div>
                              <div>
                                <h3 className="font-semibold">{agent.name}</h3>
                                <p className="text-sm text-muted-foreground">{agent.role}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="text-sm font-medium text-green-600">
                                {currentMetrics.conversion}% Conversion
                              </div>
                              <Progress value={currentMetrics.conversion} className="w-24 h-2" />
                            </div>
                          </div>

                          {/* Primary Metrics */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
                            <div className="bg-blue-50 p-3 rounded-lg text-center">
                              <div className="text-lg font-bold text-blue-600">
                                {currentMetrics.leads}
                              </div>
                              <div className="text-xs text-muted-foreground">Leads</div>
                            </div>
                            <div className="bg-blue-50 p-3 rounded-lg text-center">
                              <div className="text-lg font-bold text-blue-600">
                                {currentMetrics.calls}
                              </div>
                              <div className="text-xs text-muted-foreground">Calls</div>
                            </div>
                            <div className="bg-blue-50 p-3 rounded-lg text-center">
                              <div className="text-lg font-bold text-blue-600">
                                {currentMetrics.contacts}
                              </div>
                              <div className="text-xs text-muted-foreground">Contacts</div>
                            </div>
                            <div className="bg-blue-50 p-3 rounded-lg text-center">
                              <div className="text-lg font-bold text-blue-600">
                                {currentMetrics.scheduled}
                              </div>
                              <div className="text-xs text-muted-foreground">Scheduled</div>
                            </div>
                            <div className="bg-blue-50 p-3 rounded-lg text-center">
                              <div className="text-lg font-bold text-blue-600">
                                {currentMetrics.sits}
                              </div>
                              <div className="text-xs text-muted-foreground">Sits</div>
                            </div>
                            <div className="bg-blue-50 p-3 rounded-lg text-center">
                              <div className="text-lg font-bold text-blue-600">
                                {currentMetrics.sales}
                              </div>
                              <div className="text-xs text-muted-foreground">Sales</div>
                            </div>
                            <div className="bg-green-50 p-3 rounded-lg text-center col-span-2">
                              <div className="text-lg font-bold text-green-600">
                                ${currentMetrics.ap}
                              </div>
                              <div className="text-xs text-muted-foreground">AP</div>
                            </div>
                          </div>

                          {/* Ratio Cards */}
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
                            {/* Lead Based Ratios */}
                            <div className="bg-gray-100 p-2 rounded text-center">
                              <div className="text-sm font-semibold">
                                {currentMetrics.ratios.leadToContact}%
                              </div>
                              <div className="text-xs text-muted-foreground">Lead to Contact</div>
                            </div>
                            <div className="bg-gray-100 p-2 rounded text-center">
                              <div className="text-sm font-semibold">
                                {currentMetrics.ratios.leadToScheduled}%
                              </div>
                              <div className="text-xs text-muted-foreground">Lead to Scheduled</div>
                            </div>
                            <div className="bg-gray-100 p-2 rounded text-center">
                              <div className="text-sm font-semibold">
                                {currentMetrics.ratios.leadToSits}%
                              </div>
                              <div className="text-xs text-muted-foreground">Lead to Sits</div>
                            </div>
                            <div className="bg-gray-100 p-2 rounded text-center">
                              <div className="text-sm font-semibold">
                                {currentMetrics.ratios.leadToSales}%
                              </div>
                              <div className="text-xs text-muted-foreground">Lead to Sales</div>
                            </div>
                            <div className="bg-gray-100 p-2 rounded text-center">
                              <div className="text-sm font-semibold">
                                ${currentMetrics.ratios.apPerLead}
                              </div>
                              <div className="text-xs text-muted-foreground">AP per Lead</div>
                            </div>
                            <div className="bg-gray-100 p-2 rounded text-center">
                              <div className="text-sm font-semibold">
                                {currentMetrics.ratios.contactToScheduled}%
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Contact to Scheduled
                              </div>
                            </div>
                            <div className="bg-gray-100 p-2 rounded text-center">
                              <div className="text-sm font-semibold">
                                {currentMetrics.ratios.contactToSits}%
                              </div>
                              <div className="text-xs text-muted-foreground">Contact to Sits</div>
                            </div>

                            {/* Call Based Ratios */}
                            <div className="bg-gray-100 p-2 rounded text-center">
                              <div className="text-sm font-semibold">
                                {currentMetrics.ratios.callsToContact}%
                              </div>
                              <div className="text-xs text-muted-foreground">Calls to Contact</div>
                            </div>
                            <div className="bg-gray-100 p-2 rounded text-center">
                              <div className="text-sm font-semibold">
                                {currentMetrics.ratios.callsToScheduled}%
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Calls to Scheduled
                              </div>
                            </div>
                            <div className="bg-gray-100 p-2 rounded text-center">
                              <div className="text-sm font-semibold">
                                {currentMetrics.ratios.callsToSits}%
                              </div>
                              <div className="text-xs text-muted-foreground">Calls to Sits</div>
                            </div>
                            <div className="bg-gray-100 p-2 rounded text-center">
                              <div className="text-sm font-semibold">
                                {currentMetrics.ratios.callsToSales}%
                              </div>
                              <div className="text-xs text-muted-foreground">Calls to Sales</div>
                            </div>
                            <div className="bg-gray-100 p-2 rounded text-center">
                              <div className="text-sm font-semibold">
                                ${currentMetrics.ratios.apPerCall}
                              </div>
                              <div className="text-xs text-muted-foreground">AP per Call</div>
                            </div>
                            <div className="bg-gray-100 p-2 rounded text-center">
                              <div className="text-sm font-semibold">
                                {currentMetrics.ratios.contactToSales}%
                              </div>
                              <div className="text-xs text-muted-foreground">Contact to Sales</div>
                            </div>
                            <div className="bg-gray-100 p-2 rounded text-center">
                              <div className="text-sm font-semibold">
                                ${currentMetrics.ratios.apPerContact}
                              </div>
                              <div className="text-xs text-muted-foreground">AP per Contact</div>
                            </div>

                            {/* Scheduled and Sits Based Ratios */}
                            <div className="bg-gray-100 p-2 rounded text-center">
                              <div className="text-sm font-semibold">
                                {currentMetrics.ratios.scheduledToSits}%
                              </div>
                              <div className="text-xs text-muted-foreground">Scheduled to Sits</div>
                            </div>
                            <div className="bg-gray-100 p-2 rounded text-center">
                              <div className="text-sm font-semibold">
                                {currentMetrics.ratios.sitsToSales}%
                              </div>
                              <div className="text-xs text-muted-foreground">Sits to Sales</div>
                            </div>
                            <div className="bg-gray-100 p-2 rounded text-center">
                              <div className="text-sm font-semibold">
                                ${currentMetrics.ratios.apPerSit}
                              </div>
                              <div className="text-xs text-muted-foreground">AP per Sit</div>
                            </div>
                            <div className="bg-gray-100 p-2 rounded text-center">
                              <div className="text-sm font-semibold">
                                ${currentMetrics.ratios.apPerSale}
                              </div>
                              <div className="text-xs text-muted-foreground">AP per Sale</div>
                            </div>
                          </div>

                          {/* Success Calculator and 1:1 Notes */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
                            {/* Success Calculator Section */}
                            <div className="space-y-4">
                              <h3 className="text-sm font-semibold">SUCCESS CALCULATOR</h3>
                              <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-gray-50 rounded-lg">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <TrendingUp className="h-4 w-4 text-green-600" />
                                    <span className="text-xs font-medium">Conversion Rate</span>
                                  </div>
                                  <div className="text-lg font-bold text-green-600">
                                    {currentMetrics.conversion}%
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    {timeRange === "weekly"
                                      ? "Weekly"
                                      : timeRange === "monthly"
                                      ? "Monthly"
                                      : "Year to Date"}{" "}
                                    Rate
                                  </p>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <Target className="h-4 w-4 text-blue-600" />
                                    <span className="text-xs font-medium">Success Score</span>
                                  </div>
                                  <div className="text-lg font-bold text-blue-600">
                                    {Math.round((currentMetrics.conversion / 100) * 100)}
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    {timeRange === "weekly"
                                      ? "Weekly"
                                      : timeRange === "monthly"
                                      ? "Monthly"
                                      : "Year to Date"}{" "}
                                    Rating
                                  </p>
                                </div>
                              </div>
                              <div>
                                <div className="flex items-center justify-between text-xs mb-1">
                                  <span>Individual Progress</span>
                                  <span>{currentMetrics.conversion}%</span>
                                </div>
                                <Progress value={currentMetrics.conversion} className="h-1.5" />
                              </div>
                            </div>

                            {/* 1:1 Notes Section */}
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <h3 className="text-sm font-semibold">1:1 NOTES</h3>
                                <div className="flex items-center space-x-2">
                                  <Phone className="h-4 w-4 text-muted-foreground" />
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                                </div>
                              </div>
                              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                                {notes
                                  .filter((note) => note.agent === agent.name)
                                  .map((note, index) => (
                                    <div key={index} className="p-2 bg-gray-50 rounded-lg">
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-medium">{note.date}</span>
                                      </div>
                                      <p className="text-xs text-gray-600">{note.summary}</p>
                                    </div>
                                  ))}
                                {notes.filter((note) => note.agent === agent.name).length === 0 && (
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
                  </div>
                </div>
              </section>
            </div>
          </Card>
        </div>
      </div>

      {/* Add Agent Modal */}
      <Dialog open={isAddAgentModalOpen} onOpenChange={setIsAddAgentModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Team Member</DialogTitle>
            <DialogDescription>
              Enter the details for the new team member. All fields are required.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Enter agent name"
                value={newAgent.name}
                onChange={(e) => setNewAgent((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={newAgent.role}
                onValueChange={(value) => setNewAgent((prev) => ({ ...prev, role: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Agent">Agent</SelectItem>
                  <SelectItem value="Manager">Manager</SelectItem>
                  <SelectItem value="Agency Owner">Agency Owner</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="team">Team</Label>
              <Select
                value={newAgent.team}
                onValueChange={(value) => setNewAgent((prev) => ({ ...prev, team: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select team" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Alpha Team">Alpha Team</SelectItem>
                  <SelectItem value="Beta Team">Beta Team</SelectItem>
                  <SelectItem value="Gamma Team">Gamma Team</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddAgentModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddAgentSubmit}>Add Member</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Agent Confirmation Dialog */}
      <Dialog open={isRemoveAgentModalOpen} onOpenChange={setIsRemoveAgentModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Team Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove {agentToRemove?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRemoveAgentModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRemoveAgentConfirm}>
              Remove Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManagerDashboard;
