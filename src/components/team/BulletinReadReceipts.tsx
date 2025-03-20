
import { useEffect, useState } from "react";
import { TeamBulletin } from "@/types/team";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check, CheckCheck } from "lucide-react";

interface BulletinReadReceiptsProps {
  bulletin: TeamBulletin;
  currentUserId?: string;
}

export function BulletinReadReceipts({ bulletin, currentUserId }: BulletinReadReceiptsProps) {
  const [readBy, setReadBy] = useState<{ userId: string; name: string; image?: string }[]>([]);
  
  // Process read receipts from bulletin
  useEffect(() => {
    if (bulletin.read_receipts && bulletin.read_receipts.length > 0) {
      const processedReadBy = bulletin.read_receipts.map(receipt => ({
        userId: receipt.user_id,
        name: receipt.user_name || 'Unknown',
        image: receipt.user_image
      }));
      setReadBy(processedReadBy);
    } else {
      setReadBy([]);
    }
  }, [bulletin]);
  
  const readCount = readBy.length;
  const isRead = currentUserId ? readBy.some(r => r.userId === currentUserId) : false;
  
  // For now, show max 3 avatars
  const displayAvatars = readBy.slice(0, 3);
  
  return (
    <div className="flex items-center text-muted-foreground">
      {readCount > 0 ? (
        <>
          <div className="flex -space-x-2 mr-2">
            {displayAvatars.map((reader) => (
              <Avatar key={reader.userId} className="h-6 w-6 border-2 border-background">
                <AvatarImage src={reader.image} />
                <AvatarFallback className="text-xs">
                  {reader.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
          <span className="text-xs">
            {readCount === 1 
              ? "Read by 1 person" 
              : `Read by ${readCount} people`}
          </span>
        </>
      ) : (
        <div className="flex items-center">
          <Check className="h-4 w-4 mr-1" />
          <span className="text-xs">Not read yet</span>
        </div>
      )}
    </div>
  );
}
