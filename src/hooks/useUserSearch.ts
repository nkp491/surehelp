
import { useState } from "react";
import { UserWithRoles } from "@/hooks/useRoleManagement";

export const useUserSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const filterUsers = (users: UserWithRoles[] | undefined) => {
    if (!users || !searchQuery.trim()) return users;
    
    const query = searchQuery.toLowerCase();
    
    return users.filter(user => {
      const fullName = `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase();
      const email = (user.email || '').toLowerCase();
      
      return fullName.includes(query) || email.includes(query);
    });
  };

  return {
    searchQuery,
    setSearchQuery,
    filterUsers,
  };
};
