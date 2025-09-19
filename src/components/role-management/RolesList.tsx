import { useState, useMemo, useCallback } from "react";
import { UserWithRoles } from "@/hooks/useRoleManagement";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { UserRoleItem } from "@/components/role-management/UserRoleItem";
import { RolesListFilters } from "@/components/role-management/RolesListFilters";
import { filterUsers } from "@/components/role-management/roleUtils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface RolesListProps {
  users: UserWithRoles[];
  availableRoles: string[];
  getUserLoading: (userId: string, loadingType: string) => boolean;
  onAssignRole: (data: {
    userId: string;
    role: string;
  }) => void;
  onAssignManager: (data: { userId: string; managerId: string | null }) => void;
}

export function RolesList({
  users,
  availableRoles,
  getUserLoading,
  onAssignRole,
  onAssignManager,
}: Readonly<RolesListProps>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string | undefined>(
    undefined
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const { toast } = useToast();

  // Memoize filtered users to prevent recalculation on every render
  const filteredUsers = useMemo(() => {
    return filterUsers(users, searchQuery);
  }, [users, searchQuery]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  
  // Get users for current page
  const displayedUsers = useMemo(() => {
    return filteredUsers.slice(startIndex, endIndex);
  }, [filteredUsers, startIndex, endIndex]);

  // Reset to first page when filters change
  const resetPagination = useCallback(() => {
    setCurrentPage(1);
  }, []);

  // Memoize role assignment handler
  const handleAssignRole = useCallback(
    (userId: string) => {
      if (!selectedRole) {
        toast({
          title: "Select a role",
          description: "Please select a role to assign",
          variant: "default",
        });
        return;
      }

      onAssignRole({ userId, role: selectedRole });
    },
    [selectedRole, onAssignRole, toast]
  );

  // Memoize search change handler
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    resetPagination();
  }, [resetPagination]);

  // Memoize role change handler
  const handleRoleChange = useCallback((role: string | undefined) => {
    setSelectedRole(role);
    // No pagination reset needed since role selection is not filtering
  }, []);

  return (
    <div className="space-y-6">
      <RolesListFilters
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        selectedRole={selectedRole}
        onRoleChange={handleRoleChange}
        availableRoles={availableRoles}
      />

      <Card>
        <CardHeader>
          <CardTitle>User Roles</CardTitle>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredUsers.length)} of {filteredUsers.length} users
              {totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {displayedUsers.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                {searchQuery.trim()
                  ? "No users found matching your search"
                  : "No users found"}
              </p>
            ) : (
              displayedUsers.map((user) => (
                <UserRoleItem
                  key={user.id}
                  user={user}
                  allUsers={users}
                  selectedRole={selectedRole}
                  isAssigningRole={getUserLoading(user.id, 'isAssigningRole')}
                  isAssigningManager={getUserLoading(user.id, 'isAssigningManager')}
                  isRemovingManager={getUserLoading(user.id, 'isRemovingManager')}
                  onAssignRole={handleAssignRole}
                  onAssignManager={onAssignManager}
                />
              ))
            )}
          </div>
        </CardContent>
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              
              {/* Page Numbers */}
              <div className="flex items-center space-x-1">
                {(() => {
                  const pages = [];
                  const maxVisiblePages = 5;
                  
                  // Calculate start and end page numbers to show
                  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                  const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
                  
                  // Adjust start page if we're near the end
                  if (endPage - startPage + 1 < maxVisiblePages) {
                    startPage = Math.max(1, endPage - maxVisiblePages + 1);
                  }
                  
                  // Add first page and ellipsis if needed
                  if (startPage > 1) {
                    pages.push(
                      <Button
                        key={1}
                        variant={currentPage === 1 ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(1)}
                        className="w-8 h-8 p-0"
                      >
                        1
                      </Button>
                    );
                    if (startPage > 2) {
                      pages.push(
                        <span key="ellipsis-start" className="px-2 text-muted-foreground">
                          ...
                        </span>
                      );
                    }
                  }
                  
                  // Add visible page numbers
                  for (let i = startPage; i <= endPage; i++) {
                    pages.push(
                      <Button
                        key={i}
                        variant={currentPage === i ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(i)}
                        className="w-8 h-8 p-0"
                      >
                        {i}
                      </Button>
                    );
                  }
                  
                  // Add ellipsis and last page if needed
                  if (endPage < totalPages) {
                    if (endPage < totalPages - 1) {
                      pages.push(
                        <span key="ellipsis-end" className="px-2 text-muted-foreground">
                          ...
                        </span>
                      );
                    }
                    pages.push(
                      <Button
                        key={totalPages}
                        variant={currentPage === totalPages ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(totalPages)}
                        className="w-8 h-8 p-0"
                      >
                        {totalPages}
                      </Button>
                    );
                  }
                  
                  return pages;
                })()}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
