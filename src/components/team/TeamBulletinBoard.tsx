
import { useState, useEffect, useMemo } from "react";
import { useTeamBulletins } from "@/hooks/useTeamBulletins";
import { TeamBulletin as TeamBulletinType } from "@/types/team";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Pin, PinOff, Edit, Trash2, Loader2, CheckCircle2, Tag } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { CreateBulletinDialog } from "./CreateBulletinDialog";
import ProfileAvatar from "@/components/profile/ProfileAvatar";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { BulletinReadReceipts } from "./BulletinReadReceipts";
import { BulletinContent } from "./BulletinContent";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TeamBulletinBoardProps {
  teamId?: string;
}

export function TeamBulletinBoard({ teamId }: TeamBulletinBoardProps) {
  const { 
    bulletins, 
    isLoadingBulletins, 
    createBulletin, 
    updateBulletin,
    toggleBulletinPin,
    deleteBulletin,
    markBulletinAsRead,
    isLoading
  } = useTeamBulletins(teamId);
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingBulletin, setEditingBulletin] = useState<TeamBulletinType | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Check if current user is the author of a bulletin
  const { data: currentUserId } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user?.id;
    }
  });

  // Mark bulletins as read when they are viewed
  useEffect(() => {
    if (bulletins && bulletins.length > 0 && currentUserId && teamId) {
      // Find all unread bulletins
      const unreadBulletins = bulletins.filter(bulletin => 
        !bulletin.read_receipts?.some(receipt => receipt.user_id === currentUserId)
      );
      
      setUnreadCount(unreadBulletins.length);
      
      // Mark them as read
      unreadBulletins.forEach(bulletin => {
        markBulletinAsRead.mutate({ bulletinId: bulletin.id });
      });
    }
  }, [bulletins, currentUserId, teamId, markBulletinAsRead]);

  const isBulletinAuthor = (bulletin: TeamBulletinType) => {
    return bulletin.created_by === currentUserId;
  };

  const handleCreateBulletin = async (data: { 
    title: string; 
    content: string; 
    pinned?: boolean;
    category?: string;
    mentioned_users?: string[];
  }) => {
    if (!teamId) return;
    await createBulletin.mutateAsync(data);
    setShowCreateDialog(false);
  };

  const handleUpdateBulletin = async (data: { 
    title: string; 
    content: string; 
    pinned?: boolean;
    category?: string;
    mentioned_users?: string[];
  }) => {
    if (!editingBulletin) return;
    await updateBulletin.mutateAsync({
      bulletinId: editingBulletin.id,
      ...data
    });
    setEditingBulletin(null);
  };

  const handleTogglePin = async (bulletin: TeamBulletinType) => {
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
        <div>
          <CardTitle>Team Bulletins</CardTitle>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-2">
              {unreadCount} unread
            </Badge>
          )}
        </div>
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
        {isLoadingBulletins ? (
          Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="mb-4 p-4 border rounded-md">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center">
                  <Skeleton className="h-8 w-8 rounded-full mr-2" />
                  <div>
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-16 w-full" />
            </div>
          ))
        ) : bulletins?.length === 0 ? (
          <div className="text-center p-6 border rounded-md bg-muted/30">
            <p className="text-lg font-medium mb-2">No bulletins yet</p>
            <p className="text-muted-foreground mb-4">
              Post your first team bulletin to share updates with your team.
            </p>
            <Button 
              onClick={() => setShowCreateDialog(true)}
              disabled={!teamId}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create First Bulletin
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {bulletins?.map((bulletin) => (
              <div 
                key={bulletin.id} 
                className={`p-4 border rounded-md ${bulletin.pinned ? 'bg-muted/30 border-primary/30' : ''}`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center">
                    <ProfileAvatar
                      imageUrl={bulletin.author_image}
                      firstName={bulletin.author_name?.split(' ')[0]}
                      className="h-8 w-8 mr-2"
                    />
                    <div>
                      <p className="font-medium text-sm">{bulletin.author_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(bulletin.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {bulletin.category && (
                      <Badge variant="outline" className="text-xs">
                        <Tag className="h-3 w-3 mr-1" />
                        {bulletin.category}
                      </Badge>
                    )}
                    
                    {bulletin.pinned && (
                      <Badge variant="outline" className="bg-primary/10 text-primary">
                        <Pin className="h-3 w-3 mr-1" />
                        Pinned
                      </Badge>
                    )}
                    
                    {(isBulletinAuthor(bulletin)) && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="lucide lucide-more-vertical"
                            >
                              <circle cx="12" cy="12" r="1" />
                              <circle cx="12" cy="5" r="1" />
                              <circle cx="12" cy="19" r="1" />
                            </svg>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditingBulletin(bulletin)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleTogglePin(bulletin)}>
                            {bulletin.pinned ? (
                              <>
                                <PinOff className="h-4 w-4 mr-2" />
                                Unpin
                              </>
                            ) : (
                              <>
                                <Pin className="h-4 w-4 mr-2" />
                                Pin
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(bulletin.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
                
                <h3 className="font-medium text-base mb-2">{bulletin.title}</h3>
                
                <BulletinContent content={bulletin.content} mentionedUsers={bulletin.mentioned_users} />
                
                <div className="mt-3 flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">
                    {bulletin.updated_at !== bulletin.created_at && (
                      <span>Edited {formatDistanceToNow(new Date(bulletin.updated_at), { addSuffix: true })}</span>
                    )}
                  </div>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          <BulletinReadReceipts bulletin={bulletin} currentUserId={currentUserId} />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Read receipts</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      
      <CreateBulletinDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSubmit={handleCreateBulletin}
        isLoading={isLoading}
        teamId={teamId}
      />
      
      {editingBulletin && (
        <CreateBulletinDialog
          open={!!editingBulletin}
          onOpenChange={(open) => !open && setEditingBulletin(null)}
          onSubmit={handleUpdateBulletin}
          isLoading={isLoading}
          initialData={editingBulletin}
          teamId={teamId}
        />
      )}
    </Card>
  );
}
