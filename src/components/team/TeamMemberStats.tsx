
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import ProfileAvatar from "@/components/profile/ProfileAvatar";
import { TeamMemberMetrics } from "@/hooks/useTeamMetrics";
import { MetricCount } from "@/types/metrics";
import { Calculator, MessageSquare, ChevronDown, ChevronRight, Info } from "lucide-react";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { TeamMemberSuccessCalculator } from "./TeamMemberSuccessCalculator";
import { TeamMemberOneOnOneNotes } from "./TeamMemberOneOnOneNotes";
import { TeamMemberRatios } from "./TeamMemberRatios";

interface TeamMemberStatsProps {
  isLoading: boolean;
  teamMetrics?: TeamMemberMetrics[];
  aggregatedMetrics: MetricCount | null;
  hierarchicalView?: boolean;
}

export function TeamMemberStats({ 
  isLoading, 
  teamMetrics, 
  aggregatedMetrics,
  hierarchicalView = false
}: TeamMemberStatsProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-4 text-center">
          {Array.from({ length: 6 }).map((_, idx) => (
            <Skeleton key={idx} className="h-16 w-full" />
          ))}
        </div>
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="flex items-center justify-between border p-3 rounded-md">
            <div className="flex items-center space-x-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div>
                <Skeleton className="h-4 w-24 mb-1" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <div className="flex space-x-2">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-16" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (teamMetrics?.length === 0) {
    return (
      <div className="text-center p-6">
        <p className="text-muted-foreground">No team metrics available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AggregatedMetricsGrid 
        aggregatedMetrics={aggregatedMetrics} 
        hierarchicalView={hierarchicalView}
      />
      
      {teamMetrics?.map((member) => (
        <TeamMemberCard key={member.user_id} member={member} />
      ))}
    </div>
  );
}

function TeamMemberCard({ member }: { member: TeamMemberMetrics }) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Convert member metrics to MetricCount format for ratios
  const memberMetrics: MetricCount = {
    leads: member.metrics.total_leads,
    calls: member.metrics.total_calls,
    contacts: member.metrics.total_contacts,
    scheduled: member.metrics.total_scheduled,
    sits: member.metrics.total_sits,
    sales: member.metrics.total_sales,
    ap: member.metrics.average_ap
  };

  return (
    <div className="border rounded-md p-3">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center space-x-3">
          <ProfileAvatar
            imageUrl={member.profile_image_url}
            firstName={member.first_name}
            className="h-10 w-10"
          />
          <div>
            <p className="font-medium">
              {member.first_name} {member.last_name}
            </p>
            <p className="text-xs text-muted-foreground">
              {member.email}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="ml-2">
            AP: ${(member.metrics.average_ap / 100).toFixed(2)}
          </Badge>
          <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      
      <MemberMetricsGrid metrics={member.metrics} />
      
      {/* Show ratios for this team member */}
      <div className="mt-3">
        <TeamMemberRatios metrics={memberMetrics} />
      </div>
      
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded} className="mt-3">
        <CollapsibleContent className="space-y-4 mt-4 pt-4 border-t">
          <TeamMemberSuccessCalculator userId={member.user_id} metrics={member.metrics} />
          <TeamMemberOneOnOneNotes userId={member.user_id} name={`${member.first_name} ${member.last_name}`} />
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

function AggregatedMetricsGrid({ 
  aggregatedMetrics, 
  hierarchicalView 
}: { 
  aggregatedMetrics: MetricCount | null,
  hierarchicalView: boolean
}) {
  return (
    <div className="relative">
      {hierarchicalView && (
        <div className="absolute -top-7 right-0">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  Hierarchical View
                </Badge>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className="text-xs max-w-xs">
                  Showing metrics for this team and all sub-teams in the hierarchy
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
      
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-4 text-center">
        <div className="p-2 bg-muted/30 rounded-md">
          <p className="text-xs text-muted-foreground">Leads</p>
          <p className="font-medium text-lg">
            {aggregatedMetrics?.leads || 0}
          </p>
        </div>
        <div className="p-2 bg-muted/30 rounded-md">
          <p className="text-xs text-muted-foreground">Calls</p>
          <p className="font-medium text-lg">
            {aggregatedMetrics?.calls || 0}
          </p>
        </div>
        <div className="p-2 bg-muted/30 rounded-md">
          <p className="text-xs text-muted-foreground">Contacts</p>
          <p className="font-medium text-lg">
            {aggregatedMetrics?.contacts || 0}
          </p>
        </div>
        <div className="p-2 bg-muted/30 rounded-md">
          <p className="text-xs text-muted-foreground">Scheduled</p>
          <p className="font-medium text-lg">
            {aggregatedMetrics?.scheduled || 0}
          </p>
        </div>
        <div className="p-2 bg-muted/30 rounded-md">
          <p className="text-xs text-muted-foreground">Sits</p>
          <p className="font-medium text-lg">
            {aggregatedMetrics?.sits || 0}
          </p>
        </div>
        <div className="p-2 bg-muted/30 rounded-md">
          <p className="text-xs text-muted-foreground">Sales</p>
          <p className="font-medium text-lg">
            {aggregatedMetrics?.sales || 0}
          </p>
        </div>
      </div>
    </div>
  );
}

function MemberMetricsGrid({ metrics }: { metrics: TeamMemberMetrics['metrics'] }) {
  return (
    <div className="grid grid-cols-3 md:grid-cols-6 gap-2 text-center mt-3">
      <div className="text-xs p-1 bg-muted/20 rounded">
        <span className="block text-muted-foreground">Leads</span>
        <span className="font-medium">{metrics.total_leads}</span>
      </div>
      <div className="text-xs p-1 bg-muted/20 rounded">
        <span className="block text-muted-foreground">Calls</span>
        <span className="font-medium">{metrics.total_calls}</span>
      </div>
      <div className="text-xs p-1 bg-muted/20 rounded">
        <span className="block text-muted-foreground">Contacts</span>
        <span className="font-medium">{metrics.total_contacts}</span>
      </div>
      <div className="text-xs p-1 bg-muted/20 rounded">
        <span className="block text-muted-foreground">Scheduled</span>
        <span className="font-medium">{metrics.total_scheduled}</span>
      </div>
      <div className="text-xs p-1 bg-muted/20 rounded">
        <span className="block text-muted-foreground">Sits</span>
        <span className="font-medium">{metrics.total_sits}</span>
      </div>
      <div className="text-xs p-1 bg-muted/20 rounded">
        <span className="block text-muted-foreground">Sales</span>
        <span className="font-medium">{metrics.total_sales}</span>
      </div>
    </div>
  );
}
