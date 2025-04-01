
import { useState, useEffect } from "react";
import { useProfileManagement } from "@/hooks/useProfileManagement";
import { TeamBulletinBoard } from "@/components/team/TeamBulletinBoard";
import { RoleBasedRoute } from "@/components/auth/RoleBasedRoute";
import ProfileLoading from "@/components/profile/ProfileLoading";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle } from "lucide-react";

export default function BulletinsPage() {
  const { profile, loading } = useProfileManagement();
  const [teamId, setTeamId] = useState<string | undefined>(undefined);
  
  // Determine if user is a manager or has a manager
  const isManager = profile?.role?.includes('manager_pro') || 
                    profile?.roles?.some(r => r.includes('manager_pro'));
  
  const hasManager = !!profile?.manager_id;

  useEffect(() => {
    // For managers, we'll use their ID as the team ID
    // For agents with managers, we'll use their manager's ID as the team ID
    if (profile) {
      if (isManager) {
        setTeamId(profile.id);
      } else if (hasManager) {
        setTeamId(profile.manager_id);
      }
    }
  }, [profile, isManager, hasManager]);

  if (loading) {
    return <ProfileLoading />;
  }

  // User needs to either be a manager or have a manager
  if (!isManager && !hasManager) {
    return (
      <div className="container max-w-7xl mx-auto py-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Team Bulletins</CardTitle>
            <CardDescription>
              You need to have a manager assigned to your profile to view team bulletins.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <MessageCircle className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              Please update your profile to select a manager to access team bulletins.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <RoleBasedRoute requiredRoles={['agent', 'agent_pro', 'manager_pro', 'manager_pro_gold', 'manager_pro_platinum']}>
      <div className="container max-w-7xl mx-auto py-6 space-y-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Team Bulletins</h1>
          <p className="text-muted-foreground">
            {isManager 
              ? "Post bulletins and communicate with your team members." 
              : "View bulletins from your manager and team."}
          </p>
        </div>

        <TeamBulletinBoard teamId={teamId} />
      </div>
    </RoleBasedRoute>
  );
}
