
import { useState } from "react";
import { TeamBulletin } from "@/types/team";
import { Pin, PinOff, Edit, Trash2 } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import ProfileAvatar from "@/components/profile/ProfileAvatar";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface BulletinItemProps {
  bulletin: TeamBulletin;
  isBulletinAuthor: boolean;
  onEdit: (bulletin: TeamBulletin) => void;
  onTogglePin: (bulletin: TeamBulletin) => void;
  onDelete: (bulletinId: string) => void;
}

export function BulletinItem({ 
  bulletin, 
  isBulletinAuthor, 
  onEdit, 
  onTogglePin, 
  onDelete 
}: BulletinItemProps) {
  return (
    <div 
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
          {bulletin.pinned && (
            <Badge variant="outline" className="bg-primary/10 text-primary">
              <Pin className="h-3 w-3 mr-1" />
              Pinned
            </Badge>
          )}
          
          {isBulletinAuthor && (
            <BulletinActions 
              bulletin={bulletin} 
              onEdit={onEdit}
              onTogglePin={onTogglePin}
              onDelete={onDelete}
            />
          )}
        </div>
      </div>
      
      <h3 className="font-medium text-base mb-2">{bulletin.title}</h3>
      <div className="whitespace-pre-wrap text-sm">{bulletin.content}</div>
      
      <div className="mt-3 text-xs text-muted-foreground">
        {bulletin.updated_at !== bulletin.created_at && (
          <span>Edited {formatDistanceToNow(new Date(bulletin.updated_at), { addSuffix: true })}</span>
        )}
      </div>
    </div>
  );
}

function BulletinActions({ 
  bulletin, 
  onEdit, 
  onTogglePin, 
  onDelete 
}: Omit<BulletinItemProps, 'isBulletinAuthor'>) {
  return (
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
        <DropdownMenuItem onClick={() => onEdit(bulletin)}>
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onTogglePin(bulletin)}>
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
          onClick={() => onDelete(bulletin.id)}
          className="text-destructive"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
