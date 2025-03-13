
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  setRolesInCache, 
  setRolesInSessionStorage, 
  getRolesFromStorage, 
  getRolesFromSessionStorage 
} from "@/lib/role-cache";

/**
 * Fetch user roles from the database
 */
export const fetchUserRoles = async (): Promise<string[]> => {
  console.log('Fetching user roles from database...');
  
  // First try session storage for fastest access
  const sessionRoles = getRolesFromSessionStorage();
  if (sessionRoles) {
    console.log('Using session storage roles:', sessionRoles);
    return sessionRoles;
  }
  
  // Then try local storage
  const storageRoles = getRolesFromStorage();
  if (Array.isArray(storageRoles) && storageRoles.length > 0) {
    console.log('Using roles from storage:', storageRoles);
    setRolesInSessionStorage(storageRoles);
    return storageRoles;
  }

  // Finally, fetch from database
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('No authenticated user found, returning empty roles array');
      return [];
    }

    const { data: userRoles, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);
      
    if (error) {
      console.error('Error fetching user roles:', error);
      toast.error("Error loading user permissions");
      return [];
    } 
    
    const roles = userRoles?.map(r => r.role) || [];
    console.log('Fetched user roles from database:', roles);
    
    // Store the roles in all caches
    setRolesInCache(roles);
    setRolesInSessionStorage(roles);
    
    // Also store in localStorage as fallback
    try {
      localStorage.setItem('user-roles-backup', JSON.stringify(roles));
    } catch (e) {
      console.error('Error saving to storage:', e);
    }
    
    return roles;
  } catch (error) {
    console.error('Error fetching user roles:', error);
    toast.error("Failed to load permissions");
    
    // Try fallback from localStorage 
    try {
      const backupRoles = localStorage.getItem('user-roles-backup');
      if (backupRoles) {
        console.log('Using backup roles from localStorage');
        return JSON.parse(backupRoles);
      }
    } catch (e) {
      console.error('Error reading backup roles:', e);
    }
    
    return [];
  }
};
