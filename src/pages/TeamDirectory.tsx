
import { useState, useEffect } from "react";
import { useTeamDirectory } from "@/hooks/useTeamDirectory";
import { Profile } from "@/types/profile";
import { MemberCard } from "@/components/directory/MemberCard";
import { TeamSearch } from "@/components/directory/TeamSearch";
import { MemberDetailDialog } from "@/components/directory/MemberDetailDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Users } from "lucide-react";

export default function TeamDirectory() {
  const { members, filteredMembers, isLoading, error, refreshMembers, searchTeamMembers, filterByDepartment, departments } = useTeamDirectory();
  const [selectedMember, setSelectedMember] = useState<Profile | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [displayedMembers, setDisplayedMembers] = useState<Profile[]>([]);

  useEffect(() => {
    refreshMembers();
  }, [refreshMembers]);

  useEffect(() => {
    if (filteredMembers.length > 0) {
      // Apply active filters
      filterMembers(filteredMembers, activeTab, selectedDepartment);
    }
  }, [filteredMembers, activeTab, selectedDepartment]);

  const handleSearch = (query: string) => {
    if (query.trim() === "") {
      refreshMembers();
    } else {
      searchTeamMembers(query);
    }
  };

  const handleMemberClick = (member: Profile) => {
    setSelectedMember(member);
    setIsDetailOpen(true);
  };

  const handleDepartmentFilter = (department: string | null) => {
    setSelectedDepartment(department);
  };

  const filterMembers = (
    members: Profile[], 
    tab: string, 
    department: string | null
  ) => {
    let filtered = [...members];
    
    // Filter by role type based on tab
    if (tab !== "all") {
      filtered = filtered.filter(member => {
        if (tab === "managers") {
          return member.role?.includes("manager");
        } else if (tab === "agents") {
          return member.role?.includes("agent");
        } else if (tab === "admin") {
          return member.role?.includes("admin");
        }
        return true;
      });
    }
    
    // Filter by department
    if (department) {
      filtered = filtered.filter(
        member => member.department === department
      );
    }
    
    setDisplayedMembers(filtered);
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center">
          <Users className="mr-2 h-6 w-6" />
          Team Directory
        </h1>
        <p className="text-muted-foreground mt-1">
          Browse and search for team members across the organization
        </p>
      </div>
      
      <div className="mb-6">
        <TeamSearch 
          onSearch={handleSearch}
          onDepartmentFilter={handleDepartmentFilter}
          departments={departments}
        />
      </div>
      
      <Tabs
        defaultValue="all"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full mb-6"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="managers">Managers</TabsTrigger>
          <TabsTrigger value="agents">Agents</TabsTrigger>
          <TabsTrigger value="admin">Admin</TabsTrigger>
        </TabsList>
      </Tabs>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="p-4 border rounded-md">
              <div className="flex items-center space-x-4 mb-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : displayedMembers.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium">No team members found</h3>
          <p className="text-muted-foreground mt-2">
            Try adjusting your search or filters
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedMembers.map((member) => (
            <MemberCard
              key={member.id}
              member={member}
              onClick={() => handleMemberClick(member)}
            />
          ))}
        </div>
      )}
      
      <MemberDetailDialog
        member={selectedMember}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />
    </div>
  );
}
