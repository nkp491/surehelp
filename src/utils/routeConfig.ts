
/**
 * Defines routes that should be accessible without authentication
 */
export const publicRoutes = [
  '/auth',
  '/auth/terms',
  '/terms',
  '/auth/callback'
];

/**
 * Checks if the current path is a public route that doesn't require authentication
 */
export const isPublicRoute = (path: string): boolean => {
  return publicRoutes.some(route => {
    // Check for exact match
    if (route === path) return true;
    
    // Check if path starts with a public route pattern
    if (route.endsWith('/*') && path.startsWith(route.slice(0, -2))) {
      return true;
    }
    
    return false;
  });
};
