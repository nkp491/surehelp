
import { useTeamMembersFetch } from './directory/useTeamMembersFetch';
import { useTeamMembersSearch } from './directory/useTeamMembersSearch';
import { useMemberDetails } from './directory/useMemberDetails';
import { useReportingStructure } from './directory/useReportingStructure';
import { ReportingStructure } from '@/types/profile';

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
  
  const { getReportingStructure, isLoadingStructure, structureError } = useReportingStructure(getMemberById);

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
