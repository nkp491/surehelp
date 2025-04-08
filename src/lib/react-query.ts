
import { 
  QueryClient as QueryClientOriginal,
  QueryClientProvider,
  useQuery,
  useMutation
} from "@tanstack/react-query";

// Re-export with the correct name
export const QueryClient = QueryClientOriginal;
export { 
  QueryClientProvider,
  useQuery,
  useMutation
};

// Default query client config
export const defaultQueryClientConfig = {
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
};

// Create a queryClient instance
export const queryClient = new QueryClient(defaultQueryClientConfig);
