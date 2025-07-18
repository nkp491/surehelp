
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
   <div className="relative">
  <div className="flex gap-2 mb-3">
    <Button
      variant={showUserSearch ? "default" : "outline"}
      onClick={() => setShowUserSearch(true)}
      type="button"
      className="flex items-center gap-1 px-3"
    >
      <Search className="h-4 w-4" />
      <span className="text-sm">Search Users</span>
    </Button>
  </div>

  {showUserSearch && (
    <div className="mt-2 border border-border rounded-xl p-4 bg-background shadow-lg space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-base font-semibold text-foreground">Search Users</h3>
        <button
          onClick={() => setShowUserSearch(false)}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Close
        </button>
      </div>

      <Input
        placeholder="Type name or email..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full border focus:ring-2 focus:ring-ring focus:border-ring transition-all"
      />

      <div className="bg-muted/40 rounded-md overflow-y-auto max-h-64 border border-muted shadow-inner">
        {filteredUsers.length > 0 ? (
          <ul className="divide-y divide-border">
            {filteredUsers.map((user) => (
              <li key={user.id}>
                <button
                  onClick={() => {
                    // onSelectUser(user);
                    // setShowUserSearch(false);
                  }}
                  className="cursor-pointer w-full text-left px-4 py-3 hover:bg-accent hover:text-accent-foreground transition-colors rounded-sm"
                >
                  <div className="font-medium text-base select-text">
                    {user.first_name || user.last_name
                      ? `${user.first_name ?? ""} ${user.last_name ?? ""}`
                      : "Unknown User"}
                  </div>
                  <div className="text-sm text-muted-foreground select-text">{user.email}</div>
                  <div className="text-xs text-muted-foreground mt-1 select-text">{user.id}</div>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-4 text-center text-sm text-muted-foreground italic">
            {searchQuery
              ? "No users found for your search."
              : "Start typing to find users by name or email."}
          </div>
        )}
      </div>
    </div>
  )}
</div>

  );
}
