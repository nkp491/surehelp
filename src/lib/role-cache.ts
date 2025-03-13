
import { queryClient } from "@/lib/react-query";

const ROLES_CACHE_KEY = ["user-roles"];
const ROLE_VERIFICATION_CACHE_KEY = ["role-verification"];

// Reduce cache time to prevent stale data
const ROLES_CACHE_TIME = 5 * 60 * 1000; // 5 minutes

/**
 * Get cached roles from React Query cache
 */
export const getRolesFromCache = () => {
  return queryClient.getQueryData<string[]>(ROLES_CACHE_KEY) || [];
};

/**
 * Store roles in React Query cache and localStorage
 */
export const setRolesInCache = (roles: string[]) => {
  queryClient.setQueryData(ROLES_CACHE_KEY, roles);
  
  // Store in localStorage as fallback
  try {
    localStorage.setItem(ROLES_CACHE_KEY[0], JSON.stringify(roles));
    localStorage.setItem(`${ROLES_CACHE_KEY[0]}_timestamp`, Date.now().toString());
  } catch (error) {
    console.error("Failed to store roles in localStorage:", error);
  }
};

/**
 * Get roles from localStorage with expiration check
 */
export const getRolesFromStorage = (): string[] => {
  try {
    const storedRoles = localStorage.getItem(ROLES_CACHE_KEY[0]);
    const timestamp = localStorage.getItem(`${ROLES_CACHE_KEY[0]}_timestamp`);
    
    // Check if cache is expired
    if (timestamp && storedRoles) {
      const cacheTime = parseInt(timestamp, 10);
      if (Date.now() - cacheTime < ROLES_CACHE_TIME) {
        return JSON.parse(storedRoles);
      } else {
        // Clear expired cache
        localStorage.removeItem(ROLES_CACHE_KEY[0]);
        localStorage.removeItem(`${ROLES_CACHE_KEY[0]}_timestamp`);
      }
    }
    return [];
  } catch (error) {
    console.error("Failed to retrieve roles from localStorage:", error);
    return [];
  }
};

/**
 * Get roles from session storage (fastest)
 */
export const getRolesFromSessionStorage = (): string[] | null => {
  try {
    const sessionRoles = sessionStorage.getItem('user-roles');
    if (sessionRoles) {
      console.log('Using cached roles from session storage');
      return JSON.parse(sessionRoles);
    }
  } catch (e) {
    console.error('Error reading session roles:', e);
  }
  return null;
};

/**
 * Store roles in session storage
 */
export const setRolesInSessionStorage = (roles: string[]): void => {
  try {
    sessionStorage.setItem('user-roles', JSON.stringify(roles));
  } catch (e) {
    console.error('Error saving to session storage:', e);
  }
};

/**
 * Invalidate all role-related caches
 */
export const invalidateRolesCache = () => {
  try {
    queryClient.invalidateQueries({ queryKey: ROLES_CACHE_KEY });
    queryClient.invalidateQueries({ queryKey: ROLE_VERIFICATION_CACHE_KEY });
    
    // Clear session storage too
    try {
      sessionStorage.removeItem('user-roles');
    } catch (e) {
      console.error('Error clearing session storage:', e);
    }
    
    // Clear all role-related items from storage with error handling
    const keysToRemove: string[] = [];
    try {
      localStorage.removeItem(ROLES_CACHE_KEY[0]);
      localStorage.removeItem(`${ROLES_CACHE_KEY[0]}_timestamp`);
      
      // Find all keys related to roles
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('role-verify:') || key.startsWith('role-verification:'))) {
          keysToRemove.push(key);
        }
      }
    } catch (error) {
      console.error("Error accessing localStorage:", error);
    }
    
    // Remove each key individually with error handling
    keysToRemove.forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error(`Failed to remove ${key} from localStorage:`, error);
      }
    });
  } catch (error) {
    console.error("Failed to invalidate roles cache:", error);
  }
};

/**
 * Cache role verification results
 */
export const cacheVerificationResult = (requiredRoles: string[], result: boolean) => {
  const cacheKey = getVerificationCacheKey(requiredRoles);
  queryClient.setQueryData([...ROLE_VERIFICATION_CACHE_KEY, cacheKey], result);
  
  try {
    localStorage.setItem(`role-verification:${cacheKey}`, result.toString());
    localStorage.setItem(`role-verification:${cacheKey}_timestamp`, Date.now().toString());
  } catch (error) {
    console.error("Failed to store verification in localStorage:", error);
  }
};

/**
 * Get cached verification results
 */
export const getVerificationFromCache = (requiredRoles: string[] | undefined) => {
  if (!requiredRoles) return undefined;
  
  const cacheKey = getVerificationCacheKey(requiredRoles);
  
  // First check React Query cache
  const cachedResult = queryClient.getQueryData<boolean>([...ROLE_VERIFICATION_CACHE_KEY, cacheKey]);
  if (cachedResult !== undefined) {
    return cachedResult;
  }
  
  // Then check localStorage with error handling
  try {
    const storedResult = localStorage.getItem(`role-verification:${cacheKey}`);
    const timestamp = localStorage.getItem(`role-verification:${cacheKey}_timestamp`);
    
    if (storedResult && timestamp) {
      const cacheTime = parseInt(timestamp, 10);
      if (Date.now() - cacheTime < ROLES_CACHE_TIME) {
        return storedResult === 'true';
      }
    }
  } catch (error) {
    console.error("Failed to retrieve verification from localStorage:", error);
  }
  
  return undefined;
};

// Create a stable cache key from role requirements
const getVerificationCacheKey = (requiredRoles: string[] | undefined) => {
  if (!requiredRoles || requiredRoles.length === 0) return "no-roles";
  return requiredRoles.sort().join(":");
};
