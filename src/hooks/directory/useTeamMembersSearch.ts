
import { Profile } from '@/types/profile';

export const useTeamMembersSearch = (
  members: Profile[],
  setFilteredMembers: (members: Profile[]) => void
) => {
  // Function to search team members by name, email, role, etc.
  const searchTeamMembers = (query: string) => {
    if (!query.trim()) {
      setFilteredMembers(members);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const results = members.filter((member) => {
      const fullName = `${member.first_name || ''} ${member.last_name || ''}`.toLowerCase();
      const skills = (member.skills || []).join(' ').toLowerCase();
      const jobDept = `${member.job_title || ''} ${member.department || ''}`.toLowerCase();
      
      return (
        fullName.includes(lowerQuery) ||
        (member.email && member.email.toLowerCase().includes(lowerQuery)) ||
        (member.role && member.role.toLowerCase().includes(lowerQuery)) ||
        skills.includes(lowerQuery) ||
        jobDept.includes(lowerQuery)
      );
    });

    setFilteredMembers(results);
  };

  // Function to filter team members by department
  const filterByDepartment = (department: string | null) => {
    if (!department) {
      setFilteredMembers(members);
      return;
    }

    const results = members.filter((member) => member.department === department);
    setFilteredMembers(results);
  };

  return {
    searchTeamMembers,
    filterByDepartment
  };
};
