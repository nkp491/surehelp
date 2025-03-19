
import { useState } from "react";
import { useTeamBulletins } from "@/hooks/useTeamBulletins";
import { TeamBulletin as TeamBulletinType } from "@/types/team";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Pin, Settings } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { CreateBulletinDialog } from "./CreateBulletinDialog";
import ProfileAvatar from "@/components/profile/ProfileAvatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface DashboardBulletinBoardProps {
  teamId?: string;
}

export function DashboardBulletinBoard({ teamId }: DashboardBulletinBoardProps) {
  const { 
    bulletins, 
    isLoadingBulletins, 
    createBulletin, 
    isLoading
  } = useTeamBulletins(teamId);
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const handleCreateBulletin = async (data: { title: string; content: string; pinned?: boolean }) => {
    if (!teamId) return;
    await createBulletin.mutateAsync(data);
    setShowCreateDialog(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex-1">Team Bulletins</CardTitle>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
          >
            <Settings className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            onClick={() => setShowCreateDialog(true)}
            disabled={!teamId || isLoading}
            className="h-8"
          >
            <Plus className="h-4 w-4 mr-2" />
            Post
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoadingBulletins ? (
          Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="mb-4 p-3 border rounded-md">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center">
                  <Skeleton className="h-6 w-6 rounded-full mr-2" />
                  <div>
                    <Skeleton className="h-3 w-20 mb-1" />
                    <Skeleton className="h-2 w-16" />
                  </div>
                </div>
                <Skeleton className="h-5 w-12" />
              </div>
              <Skeleton className="h-4 w-3/4 mb-1" />
              <Skeleton className="h-12 w-full" />
            </div>
          ))
        ) : bulletins?.length === 0 ? (
          <div className="text-center p-4 border rounded-md bg-muted/30">
            <p className="text-sm mb-2">No bulletins yet</p>
            <Button 
              size="sm"
              onClick={() => setShowCreateDialog(true)}
              disabled={!teamId}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create First Bulletin
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {bulletins?.slice(0, 3).map((bulletin) => (
              <div 
                key={bulletin.id} 
                className={`p-3 border rounded-md ${bulletin.pinned ? 'bg-muted/30 border-primary/30' : ''}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center">
                    <ProfileAvatar
                      imageUrl={bulletin.author_image}
                      firstName={bulletin.author_name?.split(' ')[0]}
                      className="h-6 w-6 mr-2"
                    />
                    <div>
                      <p className="font-medium text-xs">{bulletin.author_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(bulletin.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  
                  {bulletin.pinned && (
                    <Badge variant="outline" className="bg-primary/10 text-primary text-xs">
                      <Pin className="h-3 w-3 mr-1" />
                      Pinned
                    </Badge>
                  )}
                </div>
                
                <h3 className="font-medium text-sm mb-1">{bulletin.title}</h3>
                <div className="whitespace-pre-wrap text-xs max-h-12 overflow-hidden text-ellipsis">
                  {bulletin.content.length > 100 
                    ? `${bulletin.content.substring(0, 100)}...` 
                    : bulletin.content
                  }
                </div>
              </div>
            ))}
            
            {bulletins && bulletins.length > 3 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full text-xs text-muted-foreground"
              >
                View all {bulletins.length} bulletins
              </Button>
            )}
          </div>
        )}
      </CardContent>
      
      <CreateBulletinDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSubmit={handleCreateBulletin}
        isLoading={isLoading}
      />
    </Card>
  );
}
