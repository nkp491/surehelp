
import { useState } from "react";
import { useTeamBulletins } from "@/hooks/useTeamBulletins";
import { TeamBulletin } from "@/types/team";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { CreateBulletinDialog } from "./CreateBulletinDialog";
import { BulletinList } from "./bulletin/BulletinList";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface TeamBulletinBoardProps {
  teamId?: string;
  directReportsOnly?: boolean;
}

export function TeamBulletinBoard({ teamId, directReportsOnly = false }: TeamBulletinBoardProps) {
  const { 
    bulletins, 
    isLoadingBulletins, 
    createBulletin, 
    updateBulletin,
    toggleBulletinPin,
    deleteBulletin,
    isLoading
  } = useTeamBulletins(teamId, directReportsOnly);
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingBulletin, setEditingBulletin] = useState<TeamBulletin | null>(null);

  // Check if current user is the author of a bulletin
  const { data: currentUserId } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user?.id;
    }
  });

  const handleCreateBulletin = async (data: { title: string; content: string; pinned?: boolean }) => {
    if (!teamId) return;
    await createBulletin.mutateAsync(data);
    setShowCreateDialog(false);
  };

  const handleUpdateBulletin = async (data: { title: string; content: string; pinned?: boolean }) => {
    if (!editingBulletin) return;
    await updateBulletin.mutateAsync({
      bulletinId: editingBulletin.id,
      ...data
    });
    setEditingBulletin(null);
  };

  const handleTogglePin = async (bulletin: TeamBulletin) => {
    await toggleBulletinPin.mutateAsync({
      bulletinId: bulletin.id,
      pinned: !bulletin.pinned
    });
  };

  const handleDelete = async (bulletinId: string) => {
    await deleteBulletin.mutateAsync(bulletinId);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Team Bulletins</CardTitle>
        <Button
          size="sm"
          onClick={() => setShowCreateDialog(true)}
          disabled={!teamId || isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Plus className="h-4 w-4 mr-2" />
          )}
          Post Bulletin
        </Button>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto">
        <BulletinList
          bulletins={bulletins}
          isLoading={isLoadingBulletins}
          currentUserId={currentUserId}
          teamId={teamId}
          onCreateBulletin={() => setShowCreateDialog(true)}
          onEditBulletin={setEditingBulletin}
          onToggleBulletinPin={handleTogglePin}
          onDeleteBulletin={handleDelete}
        />
      </CardContent>
      
      <CreateBulletinDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSubmit={handleCreateBulletin}
        isLoading={isLoading}
      />
      
      {editingBulletin && (
        <CreateBulletinDialog
          open={!!editingBulletin}
          onOpenChange={(open) => !open && setEditingBulletin(null)}
          onSubmit={handleUpdateBulletin}
          isLoading={isLoading}
          initialData={editingBulletin}
        />
      )}
    </Card>
  );
}
