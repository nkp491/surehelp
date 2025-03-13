
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { UserWithRoles } from "@/hooks/useRoleManagement";
import { formatRoleName } from "./SingleUserRoleManager";

interface UserCheckboxListProps {
  users: UserWithRoles[] | undefined;
  isLoadingUsers: boolean;
  selectedUserIds: string[];
  toggleUserSelection: (userId: string) => void;
}

export function UserCheckboxList({ 
  users, 
  isLoadingUsers, 
  selectedUserIds, 
  toggleUserSelection 
}: UserCheckboxListProps) {
  if (isLoadingUsers) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="border rounded-md divide-y max-h-[400px] overflow-y-auto">
      {users?.map(user => (
        <div key={user.id} className="p-3 flex items-center hover:bg-muted/50">
          <Checkbox 
            id={`user-${user.id}`}
            checked={selectedUserIds.includes(user.id)}
            onCheckedChange={() => toggleUserSelection(user.id)}
            className="mr-3"
          />
          <label htmlFor={`user-${user.id}`} className="flex-1 cursor-pointer">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full">
              <div>
                <p className="font-medium">
                  {user.first_name} {user.last_name}
                  {!user.first_name && !user.last_name && 'Unknown User'}
                </p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
              {user.roles.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2 sm:mt-0">
                  {user.roles.map((role, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {formatRoleName(role)}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </label>
        </div>
      ))}
    </div>
  );
}
