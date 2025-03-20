
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Profile, ReportingStructure } from '@/types/profile';
import { useToast } from '@/hooks/use-toast';
import { useProfileSanitization } from './profile/useProfileSanitization';

export const useTeamDirectory = () => {
  const [members, setMembers] = useState<Profile[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Profile[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { sanitizeProfileData } = useProfileSanitization();

  // Function to fetch all team members
  const fetchTeamMembers = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*');

      if (profileError) {
        throw profileError;
      }

      if (!profileData) {
        throw new Error('No data returned from profiles');
      }

      // Map and sanitize the database profiles to our Profile type
      const mappedProfiles: Profile[] = profileData.map(profile => 
        sanitizeProfileData(profile)
      );

      // Extract unique departments
      const uniqueDepartments: string[] = Array.from(
        new Set(
          mappedProfiles
            .filter(member => member.department)
            .map(member => member.department as string)
        )
      ).sort();

      setMembers(mappedProfiles);
      setFilteredMembers(mappedProfiles);
      setDepartments(uniqueDepartments);
    } catch (error: any) {
      console.error('Error fetching team directory:', error);
      setError(error.message || 'Failed to load team directory');
      toast({
        title: 'Error',
        description: 'Failed to load team directory',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

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

  // Function to get member details by ID
  const getMemberById = async (memberId: string): Promise<Profile> => {
    try {
      // First check if member exists in already loaded members
      const cachedMember = members.find((m) => m.id === memberId);
      if (cachedMember) return cachedMember;

      // If not found, fetch from database
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', memberId)
        .single();

      if (error) throw error;
      
      if (!data) {
        throw new Error('Member not found');
      }

      // Sanitize and return the profile
      return sanitizeProfileData(data);
    } catch (error: any) {
      console.error('Error fetching member details:', error);
      toast({
        title: 'Error',
        description: 'Failed to load member details',
        variant: 'destructive'
      });
      
      // Return a dummy profile on error to avoid breaking the UI
      const errorProfile: Profile = {
        id: memberId,
        first_name: "Error",
        last_name: "Loading Profile",
        email: null,
        phone: null,
        profile_image_url: null,
        role: null,
        roles: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_sign_in: null,
        language_preference: null,
        privacy_settings: null,
        notification_preferences: null,
        skills: [],
        bio: null,
        job_title: null,
        department: null,
        location: null,
        reports_to: null,
        hire_date: null,
        extended_contact: null
      };
      
      return errorProfile;
    }
  };

  // Function to get reporting structure for a team member
  const getReportingStructure = async (profileId: string): Promise<ReportingStructure | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Get the requested profile
      const member = await getMemberById(profileId);
      
      // If profile has a reports_to field, get the manager
      let manager: Profile | null = null;
      if (member.reports_to) {
        manager = await getMemberById(member.reports_to);
      }
      
      // Get direct reports (people who report to this profile)
      const { data: reportingData, error: reportingError } = await supabase
        .from('profiles')
        .select('*')
        .eq('reports_to', profileId);

      if (reportingError) {
        throw reportingError;
      }

      // Map and sanitize direct reports to Profile type
      const directReports: Profile[] = (reportingData || []).map(profile => 
        sanitizeProfileData(profile)
      );

      return {
        manager: manager || member, // If no manager found, use the profile itself
        directReports: directReports
      };
    } catch (error: any) {
      console.error('Error fetching reporting structure:', error);
      setError(error.message || 'Failed to load reporting structure');
      toast({
        title: 'Error',
        description: 'Failed to load reporting structure',
        variant: 'destructive'
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Load team members on component mount
  useEffect(() => {
    fetchTeamMembers();
  }, []);

  return {
    members,
    filteredMembers,
    departments,
    isLoading,
    error,
    refreshMembers: fetchTeamMembers,
    searchTeamMembers,
    filterByDepartment,
    getMemberById,
    getReportingStructure
  };
};
