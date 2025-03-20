
import { Profile } from "@/types/profile";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ProfileAvatar from "@/components/profile/ProfileAvatar";
import { Mail, Phone, MapPin, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface MemberCardProps {
  member: Profile;
  onClick?: () => void;
}

export function MemberCard({ member, onClick }: MemberCardProps) {
  const fullName = `${member.first_name || ''} ${member.last_name || ''}`.trim();
  const joinedDate = member.hire_date 
    ? formatDistanceToNow(new Date(member.hire_date), { addSuffix: true })
    : "Unknown";

  // Format role for display
  const formatRoleName = (role: string | null) => {
    if (!role) return "No Role";
    return role
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <Card 
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <ProfileAvatar 
            imageUrl={member.profile_image_url}
            firstName={member.first_name}
            className="h-16 w-16"
          />
          
          <div className="flex-1">
            <h3 className="font-medium text-lg">{fullName}</h3>
            
            <div className="flex flex-col gap-1 mt-1">
              {member.job_title && (
                <p className="text-muted-foreground text-sm">{member.job_title}</p>
              )}
              
              {member.department && (
                <p className="text-muted-foreground text-sm">{member.department}</p>
              )}
              
              <div className="flex items-center text-sm text-muted-foreground mt-1">
                <Calendar className="h-3.5 w-3.5 mr-1" />
                <span>Joined {joinedDate}</span>
              </div>
            </div>
          </div>
          
          <Badge variant="outline">
            {formatRoleName(member.role)}
          </Badge>
        </div>
        
        {/* Contact information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4 text-sm">
          {member.email && (
            <div className="flex items-center text-muted-foreground">
              <Mail className="h-3.5 w-3.5 mr-2" />
              <span className="truncate">{member.email}</span>
            </div>
          )}
          
          {member.phone && (
            <div className="flex items-center text-muted-foreground">
              <Phone className="h-3.5 w-3.5 mr-2" />
              <span>{member.phone}</span>
            </div>
          )}
          
          {member.location && (
            <div className="flex items-center text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 mr-2" />
              <span>{member.location}</span>
            </div>
          )}
        </div>
        
        {/* Skills */}
        {member.skills && member.skills.length > 0 && (
          <div className="mt-4">
            <div className="flex flex-wrap gap-1">
              {member.skills.map((skill, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
