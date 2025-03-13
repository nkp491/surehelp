
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { UserWithRoles } from "@/hooks/useRoleManagement";
import { filterUsers } from "@/components/role-management/roleUtils";

interface UserSearchProps {
  users: UserWithRoles[] | undefined;
  onSelectUser: (user: { id: string; first_name: string | null; last_name: string | null; email: string | null }) => void;
}

export function UserSearch({ users, onSelectUser }: UserSearchProps) {
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = users && searchQuery.trim() 
    ? filterUsers(users, searchQuery)
    : [];

  return (
    <div>
      <div className="flex gap-2 mb-2">
        <Button 
          variant="outline" 
          onClick={() => setShowUserSearch(!showUserSearch)}
          type="button"
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>
      
      {showUserSearch && (
        <div className="mt-2 mb-4">
          <Input
            placeholder="Search users by name or email"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-2"
          />
          
          <div className="bg-muted/50 rounded-md max-h-64 overflow-y-auto">
            {filteredUsers.length > 0 ? (
              <div className="divide-y">
                {filteredUsers.map(user => (
                  <button
                    key={user.id}
                    onClick={() => {
                      onSelectUser(user);
                      setShowUserSearch(false);
                    }}
                    className="w-full text-left p-2 hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    <div className="font-medium">
                      {user.first_name} {user.last_name}
                      {!user.first_name && !user.last_name && 'Unknown User'}
                    </div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                    <div className="text-xs text-muted-foreground mt-1">{user.id}</div>
                  </button>
                ))}
              </div>
            ) : searchQuery ? (
              <p className="p-3 text-sm text-muted-foreground">No users found</p>
            ) : (
              <p className="p-3 text-sm text-muted-foreground">Start typing to search users</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
