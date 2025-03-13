
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AdminActionsPage from "@/components/admin/AdminActionsPage";

// Create a client
const queryClient = new QueryClient();

export default function AdminActions() {
  return (
    <QueryClientProvider client={queryClient}>
      <AdminActionsPage />
    </QueryClientProvider>
  );
}
