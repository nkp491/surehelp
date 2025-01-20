import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, UserPlus, TrendingUp } from "lucide-react";
import DashboardHeader from "@/components/manager/DashboardHeader";
import TeamMembersList from "@/components/manager/TeamMembersList";
import InvitationsList from "@/components/manager/InvitationsList";
import PerformanceTab from "@/components/manager/PerformanceTab";
import { useTeamDashboard } from "@/hooks/useTeamDashboard";

const ManagerDashboard = () => {
  const {
    teamMembers,
    invitations,
    isLoading,
    handleInviteMember,
    handleRemoveMember,
    handleCancelInvitation,
  } = useTeamDashboard();

  return (
    <div className="container mx-auto py-8 space-y-8">
      <DashboardHeader onInviteMember={handleInviteMember} />

      <Tabs defaultValue="members" className="space-y-4">
        <TabsList>
          <TabsTrigger value="members" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Team Members
          </TabsTrigger>
          <TabsTrigger value="invitations" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Pending Invitations
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Performance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members">
          <TeamMembersList 
            members={teamMembers}
            isLoading={isLoading}
            onRemoveMember={handleRemoveMember}
          />
        </TabsContent>

        <TabsContent value="invitations">
          <InvitationsList 
            invitations={invitations}
            onCancelInvitation={handleCancelInvitation}
          />
        </TabsContent>

        <TabsContent value="performance">
          <PerformanceTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ManagerDashboard;