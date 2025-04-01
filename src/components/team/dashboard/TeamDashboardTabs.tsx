
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ManagerTeamList } from "@/components/team/ManagerTeamList";
import { PlaceholderContent } from "./PlaceholderContent";

interface TeamDashboardTabsProps {
  managerId?: string;
  selectedTeamId?: string;
}

export function TeamDashboardTabs({ managerId, selectedTeamId }: TeamDashboardTabsProps) {
  return (
    <Tabs defaultValue="team" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="team">Your Team</TabsTrigger>
        <TabsTrigger value="meetings">1:1 Meetings</TabsTrigger>
        <TabsTrigger value="calculator">Success Calculator</TabsTrigger>
      </TabsList>
      
      <TabsContent value="team">
        <Card className="p-4 h-full">
          <CardHeader className="px-0 pt-0">
            <CardTitle>Your Team Members</CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <ManagerTeamList managerId={managerId} selectedTeamId={selectedTeamId} />
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="meetings">
        <PlaceholderContent 
          title="1:1 Meetings" 
          description="Schedule and manage one-on-one meetings with your team members" 
        />
      </TabsContent>
      
      <TabsContent value="calculator">
        <PlaceholderContent 
          title="Success Calculator" 
          description="Calculate and visualize success metrics for your team" 
        />
      </TabsContent>
    </Tabs>
  );
}
