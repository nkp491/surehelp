
// Create this file to handle team directory functionality
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/profile';
import { useToast } from '@/hooks/use-toast';

export const useTeamDirectory = () => {
  const [members, setMembers] = useState<Profile[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Profile[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

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

      // Map the database profiles to our Profile type
      const mappedProfiles: Profile[] = profileData.map(profile => ({
        id: profile.id,
        first_name: profile.first_name,
        last_name: profile.last_name,
        email: profile.email,
        phone: profile.phone,
        profile_image_url: profile.profile_image_url,
        role: profile.role,
        roles: profile.roles,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
        last_sign_in: profile.last_sign_in,
        language_preference: profile.language_preference,
        privacy_settings: profile.privacy_settings,
        notification_preferences: profile.notification_preferences,
        skills: profile.skills || [],
        bio: profile.bio || null,
        job_title: profile.job_title || null,
        department: profile.department || null,
        location: profile.location || null,
        reports_to: profile.reports_to || null,
        hire_date: profile.hire_date || null,
        extended_contact: profile.extended_contact || {
          work_email: null,
          personal_email: null,
          work_phone: null,
          home_phone: null,
          emergency_contact: null
        }
      }));

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
  const searchMembers = (query: string) => {
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

      // Map to proper Profile type
      return {
        id: data.id,
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone,
        profile_image_url: data.profile_image_url,
        role: data.role,
        roles: data.roles,
        created_at: data.created_at,
        updated_at: data.updated_at,
        last_sign_in: data.last_sign_in,
        language_preference: data.language_preference,
        privacy_settings: data.privacy_settings,
        notification_preferences: data.notification_preferences,
        skills: data.skills || [],
        bio: data.bio || null,
        job_title: data.job_title || null,
        department: data.department || null,
        location: data.location || null,
        reports_to: data.reports_to || null,
        hire_date: data.hire_date || null,
        extended_contact: data.extended_contact || {
          work_email: null,
          personal_email: null,
          work_phone: null,
          home_phone: null,
          emergency_contact: null
        }
      };
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
    searchMembers,
    filterByDepartment,
    getMemberById
  };
};
