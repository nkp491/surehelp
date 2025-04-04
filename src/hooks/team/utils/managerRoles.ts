
import { supabase } from "@/integrations/supabase/client";

/**
 * Get a manager role for a user based on their existing roles
 */
export const getManagerRole = async (userId: string): Promise<string> => {
  // Get user roles to determine the manager role to use
  const { data: userRoles } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .or('role.eq.manager_pro,role.eq.manager_pro_gold,role.eq.manager_pro_platinum');
  
  // Determine the manager role to use - use the first manager role found or default to manager_pro
  let managerRole = 'manager_pro';
  if (userRoles && userRoles.length > 0) {
    const managerRoles = userRoles.filter(r => 
      r.role === 'manager_pro' || 
      r.role === 'manager_pro_gold' || 
      r.role === 'manager_pro_platinum'
    );
    if (managerRoles.length > 0) {
      managerRole = managerRoles[0].role;
    }
  }
  
  return managerRole;
};
