
import { queryClient } from "@/lib/react-query";

const ROLES_CACHE_KEY = ["user-roles"];
const ROLE_VERIFICATION_CACHE_KEY = ["role-verification"];

// Increase cache time for better performance
const ROLES_CACHE_TIME = 30 * 60 * 1000; // 30 minutes

export const getRolesFromCache = () => {
  return queryClient.getQueryData<string[]>(ROLES_CACHE_KEY) || [];
};

export const setRolesInCache = (roles: string[]) => {
  queryClient.setQueryData(ROLES_CACHE_KEY, roles);
  
  // Store in localStorage as fallback
  try {
    localStorage.setItem(ROLES_CACHE_KEY[0], JSON.stringify(roles));
    
    // Add timestamp for cache invalidation
    localStorage.setItem(`${ROLES_CACHE_KEY[0]}_timestamp`, Date.now().toString());
  } catch (error) {
    console.error("Failed to store roles in localStorage:", error);
  }
};

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
        console.log('Roles cache expired, will fetch fresh data');
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

export const invalidateRolesCache = () => {
  queryClient.invalidateQueries({ queryKey: ROLES_CACHE_KEY });
  queryClient.invalidateQueries({ queryKey: ROLE_VERIFICATION_CACHE_KEY });
  
  try {
    // Clear all role-related items from storage
    localStorage.removeItem(ROLES_CACHE_KEY[0]);
    localStorage.removeItem(`${ROLES_CACHE_KEY[0]}_timestamp`);
    
    // Also clear verification cache
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('role-verify:') || key.startsWith('role-verification:'))) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // Clear session storage as well
    sessionStorage.removeItem('user-roles');
  } catch (error) {
    console.error("Failed to remove roles from storage:", error);
  }
};

// Cache verification results for specific role requirements
export const cacheVerificationResult = (requiredRoles: string[], result: boolean) => {
  const cacheKey = getVerificationCacheKey(requiredRoles);
  queryClient.setQueryData([...ROLE_VERIFICATION_CACHE_KEY, cacheKey], result);
  
  // Also store in localStorage with timestamp
  try {
    localStorage.setItem(`role-verification:${cacheKey}`, result.toString());
    localStorage.setItem(`role-verification:${cacheKey}_timestamp`, Date.now().toString());
  } catch (error) {
    console.error("Failed to store verification in localStorage:", error);
  }
};

export const getVerificationFromCache = (requiredRoles: string[] | undefined) => {
  const cacheKey = getVerificationCacheKey(requiredRoles);
  
  // First check React Query cache
  const cachedResult = queryClient.getQueryData<boolean>([...ROLE_VERIFICATION_CACHE_KEY, cacheKey]);
  if (cachedResult !== undefined) {
    return cachedResult;
  }
  
  // Then check localStorage
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
