import { useState, useEffect } from "react";
import { Settings, Filter, ArrowDownUp } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TeamSelector } from "@/components/team/TeamSelector";
import { TeamBulletinBoard } from "@/components/team/TeamBulletinBoard";
import { TeamMembersList } from "@/components/team/TeamMembersList";
import { TeamMetricsOverview } from "@/components/team/TeamMetricsOverview";
import { useTeamManagement } from "@/hooks/useTeamManagement";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { useRoleCheck } from "@/hooks/useRoleCheck";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Skeleton } from "@/components/ui/skeleton";
import { TeamHierarchyView } from "@/components/team/TeamHierarchyView";

export default function TeamPage() {
  const { teams, isLoadingTeams, refreshTeams } = useTeamManagement();
  const [selectedTeamId, setSelectedTeamId] = useState<string | undefined>(undefined);
  const [timePeriod, setTimePeriod] = useState("7d");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [viewMode, setViewMode] = useState<"hierarchy" | "single">("single");
  const { hasRequiredRole } = useRoleCheck();
  
  const canViewHierarchy = hasRequiredRole(['manager_pro_gold', 'manager_pro_platinum', 'system_admin']);

  useEffect(() => {
    if (teams && teams.length > 0 && !selectedTeamId) {
      console.log("Auto-selecting first team:", teams[0].id);
      setSelectedTeamId(teams[0].id);
    }
  }, [teams, selectedTeamId]);

  useEffect(() => {
    refreshTeams().catch(err => {
      console.error("Error refreshing teams on page load:", err);
    });
  }, [refreshTeams]);

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your team, track performance, and communicate with your agents.
          </p>
        </div>
        <div className="flex flex-col md:flex-row gap-2 md:items-center">
          <TeamSelector 
            selectedTeamId={selectedTeamId} 
            onTeamSelect={setSelectedTeamId}
          />
          
          <div className="flex gap-2">
            {canViewHierarchy && (
              <ToggleGroup 
                type="single" 
                value={viewMode}
                onValueChange={(value) => {
                  if (value) setViewMode(value as "hierarchy" | "single");
                }}
                className="border rounded-md"
              >
                <ToggleGroupItem value="single" size="sm">
                  Single Team
                </ToggleGroupItem>
                <ToggleGroupItem value="hierarchy" size="sm">
                  Hierarchy View
                </ToggleGroupItem>
              </ToggleGroup>
            )}
            
            <Select 
              value={timePeriod} 
              onValueChange={setTimePeriod}
            >
              <SelectTrigger className="w-[110px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Last 24h</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>

            {timePeriod === 'custom' && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[130px]">
                    {date ? format(date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>
      </div>

      {isLoadingTeams ? (
        <div className="border rounded-md p-8 text-center bg-muted/30">
          <h2 className="text-xl font-semibold mb-2">Loading teams...</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Please wait while we load your teams.
          </p>
        </div>
      ) : teams && teams.length === 0 ? (
        <div className="border rounded-md p-8 text-center bg-muted/30">
          <h2 className="text-xl font-semibold mb-2">No Teams Found</h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-4">
            You don't have any teams yet. Create a new team to get started with team management.
          </p>
          <Alert className="max-w-md mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Create a team using the "New Team" button in the team selector above.
            </AlertDescription>
          </Alert>
        </div>
      ) : !selectedTeamId ? (
        <div className="border rounded-md p-8 text-center bg-muted/30">
          <h2 className="text-xl font-semibold mb-2">Select or Create a Team</h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-4">
            Choose a team from the dropdown above or create a new team to get started with team management.
          </p>
        </div>
      ) : (
        <>
          {viewMode === 'hierarchy' && canViewHierarchy ? (
            <div className="mb-6">
              <TeamHierarchyView 
                rootTeamId={selectedTeamId} 
                timePeriod={timePeriod} 
                customDate={timePeriod === 'custom' ? date : undefined} 
              />
            </div>
          ) : (
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12 md:col-span-3 space-y-6">
                <TeamMembersList teamId={selectedTeamId} />
                <TeamBulletinBoard teamId={selectedTeamId} />
              </div>
              <div className="col-span-12 md:col-span-9">
                <TeamMetricsOverview teamId={selectedTeamId} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <Card className="p-4">
                    <h2 className="text-xl font-bold mb-4 flex items-center justify-between">
                      SUCCESS CALCULATOR
                      <Button variant="ghost" size="icon">
                        <Settings className="h-5 w-5" />
                      </Button>
                    </h2>
                    <div className="h-[300px] flex items-center justify-center border-2 border-dashed border-gray-200 rounded-md">
                      <p className="text-muted-foreground">Success calculator coming soon</p>
                    </div>
                  </Card>
                  <Card className="p-4">
                    <h2 className="text-xl font-bold mb-4 flex items-center justify-between">
                      1:1 NOTES
                      <Button variant="ghost" size="icon">
                        <Settings className="h-5 w-5" />
                      </Button>
                    </h2>
                    <div className="h-[300px] flex items-center justify-center border-2 border-dashed border-gray-200 rounded-md">
                      <p className="text-muted-foreground">One-on-one notes coming soon</p>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
