
import { TeamBulletin } from "@/types/team";
import { BulletinItem } from "./BulletinItem";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface BulletinListProps {
  bulletins?: TeamBulletin[];
  isLoading: boolean;
  currentUserId?: string;
  teamId?: string;
  onCreateBulletin: () => void;
  onEditBulletin: (bulletin: TeamBulletin) => void;
  onToggleBulletinPin: (bulletin: TeamBulletin) => void;
  onDeleteBulletin: (bulletinId: string) => void;
}

export function BulletinList({
  bulletins,
  isLoading,
  currentUserId,
  teamId,
  onCreateBulletin,
  onEditBulletin,
  onToggleBulletinPin,
  onDeleteBulletin
}: BulletinListProps) {
  const isBulletinAuthor = (bulletin: TeamBulletin) => {
    return bulletin.created_by === currentUserId;
  };

  if (isLoading) {
    return (
      <>
        {Array.from({ length: 3 }).map((_, index) => (
          <BulletinSkeleton key={index} />
        ))}
      </>
    );
  }

  if (!bulletins?.length) {
    return (
      <div className="text-center p-6 border rounded-md bg-muted/30">
        <p className="text-lg font-medium mb-2">No bulletins yet</p>
        <p className="text-muted-foreground mb-4">
          Post your first team bulletin to share updates with your team.
        </p>
        <Button 
          onClick={onCreateBulletin}
          disabled={!teamId}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create First Bulletin
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bulletins.map((bulletin) => (
        <BulletinItem
          key={bulletin.id}
          bulletin={bulletin}
          isBulletinAuthor={isBulletinAuthor(bulletin)}
          onEdit={onEditBulletin}
          onTogglePin={onToggleBulletinPin}
          onDelete={onDeleteBulletin}
        />
      ))}
    </div>
  );
}

function BulletinSkeleton() {
  return (
    <div className="mb-4 p-4 border rounded-md">
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
  );
}
