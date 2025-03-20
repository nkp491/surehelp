
import { Notification } from "@/types/notification";
import { formatDistanceToNow } from "date-fns";
import { Bell, CheckCircle, Clock, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface NotificationItemProps {
  notification: Notification;
  onRead: (id: string) => void;
}

export function NotificationItem({ notification, onRead }: NotificationItemProps) {
  const timeAgo = notification.created_at
    ? formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })
    : "";

  const getIcon = () => {
    const iconProps = { className: "h-5 w-5 mr-2 shrink-0" };
    
    switch (notification.category) {
      case "team":
        return <Users {...iconProps} />;
      case "meeting":
        return <Calendar {...iconProps} />;
      case "performance":
        return <BarChart3 {...iconProps} />;
      case "system":
        return <Info {...iconProps} />;
      case "role":
        return <ShieldCheck {...iconProps} />;
      case "message":
        return <MessageSquare {...iconProps} />;
      default:
        return <Bell {...iconProps} />;
    }
  };

  const getPriorityStyles = () => {
    switch (notification.priority) {
      case "urgent":
        return "border-l-4 border-red-500";
      case "high":
        return "border-l-4 border-orange-500";
      case "low":
        return "border-l-2 border-slate-300";
      default:
        return "border-l-2 border-slate-200";
    }
  };

  return (
    <div 
      className={cn(
        "p-4 mb-2 rounded-md bg-card hover:bg-accent/50 transition-colors",
        notification.is_read ? "opacity-70" : "shadow-sm",
        getPriorityStyles()
      )}
      onClick={() => !notification.is_read && onRead(notification.id)}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="ml-2 flex-1">
          <div className="flex justify-between items-start">
            <h4 className={cn(
              "text-sm font-medium",
              notification.is_read ? "text-muted-foreground" : "text-foreground"
            )}>
              {notification.title}
            </h4>
            <span className="text-xs text-muted-foreground ml-2">
              {timeAgo}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {notification.content}
          </p>
          {notification.link && (
            <a 
              href={notification.link}
              className="text-xs text-primary hover:underline mt-2 inline-block"
              onClick={(e) => e.stopPropagation()}
            >
              View details
            </a>
          )}
        </div>
        {!notification.is_read && (
          <button
            className="ml-2 text-primary hover:text-primary/80"
            onClick={(e) => {
              e.stopPropagation();
              onRead(notification.id);
            }}
          >
            <CheckCircle className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}

// Import missing icons
import { Users, Calendar, BarChart3, ShieldCheck, MessageSquare } from "lucide-react";
