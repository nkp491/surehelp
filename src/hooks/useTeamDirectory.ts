
import { useTeamMembersFetch } from './directory/useTeamMembersFetch';
import { useTeamMembersSearch } from './directory/useTeamMembersSearch';
import { useMemberDetails } from './directory/useMemberDetails';
import { useSimplifiedReporting } from './directory/useSimplifiedReporting';

export const useTeamDirectory = () => {
  const {
    members,
    filteredMembers,
    setFilteredMembers,
    departments,
    isLoading,
    error,
    refreshMembers
  } = useTeamMembersFetch();

  const { searchTeamMembers, filterByDepartment } = useTeamMembersSearch(
    members,
    setFilteredMembers
  );

  const { getMemberById } = useMemberDetails(members);
  
  const { getReportingStructure, isLoading: isLoadingStructure, error: structureError } = useSimplifiedReporting();

  return {
    members,
    filteredMembers,
    departments,
    isLoading,
    error,
    refreshMembers,
    searchTeamMembers,
    filterByDepartment,
    getMemberById,
    getReportingStructure,
    isLoadingStructure,
    structureError
  };
};
