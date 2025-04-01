
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ManagerTeamList } from "@/components/team/ManagerTeamList";
import { useProfileManagement } from "@/hooks/useProfileManagement";
import ProfileLoading from "@/components/profile/ProfileLoading";
import { TeamBulletinBoard } from "@/components/team/TeamBulletinBoard";
import { RoleBasedRoute } from "@/components/auth/RoleBasedRoute";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function TeamPage() {
  const { profile, loading } = useProfileManagement();
  const [activeTab, setActiveTab] = useState("members");

  if (loading) {
    return <ProfileLoading />;
  }

  const isManager = profile?.role?.includes('manager_pro') || 
                    profile?.roles?.some(r => r.includes('manager_pro'));

  return (
    <RoleBasedRoute requiredRoles={['manager_pro', 'manager_pro_gold', 'manager_pro_platinum', 'beta_user', 'system_admin']}>
      <div className="container max-w-7xl mx-auto py-6 space-y-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
          <p className="text-muted-foreground">
            {isManager 
              ? "Manage your team members and communicate through bulletins." 
              : "View your team information and bulletins."}
          </p>
        </div>

        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start mb-6">
            <TabsTrigger value="members">Team Members</TabsTrigger>
            {isManager && <TabsTrigger value="bulletins">Bulletins</TabsTrigger>}
          </TabsList>
          
          <TabsContent value="members" className="space-y-6">
            {isManager ? (
              <ManagerTeamList managerId={profile?.id} />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Your Manager</CardTitle>
                  <CardDescription>View information about your assigned manager</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted rounded-lg p-6 text-center">
                    <h3 className="text-lg font-medium mb-2">Your Manager</h3>
                    <p className="text-muted-foreground">
                      {profile?.manager_id 
                        ? "Your manager information will be displayed here" 
                        : "You don't have a manager assigned yet. Please update your profile to select a manager."}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          {isManager && (
            <TabsContent value="bulletins">
              <TeamBulletinBoard teamId={undefined} />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </RoleBasedRoute>
  );
}
