
import { useToast as useToastUI } from "@/components/ui/use-toast";
import { toast as toastUI } from "@/components/ui/use-toast";

export const useToast = useToastUI;
export const toast = toastUI;

// Export a debugging helper
export const debugToast = (message: string, data?: any) => {
  console.log(`[DEBUG] ${message}`, data);
  return toastUI({
    title: "Debug Info",
    description: message,
    duration: 5000,
  });
};
