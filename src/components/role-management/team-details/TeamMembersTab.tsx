
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { TeamMember } from "@/types/team";
import { Trash2, Mail, Calendar } from "lucide-react";

interface TeamMembersTabProps {
  teamMembers: TeamMember[];
  formatDate: (date: string) => string;
  onDeleteTeam: () => void;
}

export function TeamMembersTab({ 
  teamMembers,
  formatDate,
  onDeleteTeam
}: TeamMembersTabProps) {
  const getDisplayName = (member: TeamMember): string => {
    const name = [member.first_name, member.last_name].filter(Boolean).join(' ');
    return name || member.email || 'Unknown User';
  };

  const getRoleBadgeColor = (role: string) => {
    if (role.includes('manager')) return 'bg-blue-100 text-blue-800 border-blue-300';
    if (role.includes('admin')) return 'bg-purple-100 text-purple-800 border-purple-300';
    return 'bg-gray-100 text-gray-800 border-gray-300';
  };

  return (
    <div className="space-y-6">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teamMembers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                  No team members found
                </TableCell>
              </TableRow>
            ) : (
              teamMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{getDisplayName(member)}</TableCell>
                  <TableCell>
                    <Badge className={`${getRoleBadgeColor(member.role)}`}>
                      {member.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {member.email ? (
                      <div className="flex items-center gap-1">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{member.email}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">No email</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{formatDate(member.created_at)}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="flex justify-end">
        <Button 
          variant="destructive" 
          size="sm" 
          onClick={onDeleteTeam}
          className="flex items-center gap-1"
        >
          <Trash2 className="h-4 w-4" />
          Delete Team
        </Button>
      </div>
    </div>
  );
}
