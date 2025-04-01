
import { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Mail } from "lucide-react";
import { TeamMember } from "@/types/team";

interface TeamMembersTabProps {
  teamMembers: TeamMember[];
  formatDate: (dateString: string) => string;
}

export function TeamMembersTab({ teamMembers, formatDate }: TeamMembersTabProps) {
  // Helper functions for formatting and displaying data
  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    if (!firstName && !lastName) return '??';
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const getDisplayName = (member: TeamMember) => {
    const name = [member.first_name, member.last_name].filter(Boolean).join(' ');
    return name || member.email || 'Unknown User';
  };

  const getRoleBadgeVariant = (role: string) => {
    if (role.includes('manager_pro_platinum')) return "default";
    if (role.includes('manager_pro_gold')) return "warning";
    if (role.includes('manager_pro')) return "outline";
    if (role.includes('agent_pro')) return "secondary";
    return "secondary";
  };

  const getRoleDisplayName = (role: string) => {
    if (role === 'manager_pro_platinum') return 'Manager Pro Platinum';
    if (role === 'manager_pro_gold') return 'Manager Pro Gold';
    if (role === 'manager_pro') return 'Manager Pro';
    if (role === 'agent_pro') return 'Agent Pro';
    if (role === 'agent') return 'Agent';
    return role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="rounded-md border max-h-[400px] overflow-y-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Joined</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teamMembers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                This team has no members
              </TableCell>
            </TableRow>
          ) : (
            teamMembers.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.profile_image_url || undefined} />
                      <AvatarFallback>
                        {getInitials(member.first_name, member.last_name)}
                      </AvatarFallback>
                    </Avatar>
                    <span>{getDisplayName(member)}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {member.email ? (
                    <div className="flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-sm">{member.email}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">No email</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={getRoleBadgeVariant(member.role)}>
                    {getRoleDisplayName(member.role)}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(member.created_at)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
