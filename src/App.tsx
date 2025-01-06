import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Index from "./pages/Index";
import SubmittedForms from "./pages/SubmittedForms";
import MetricsVisualization from "./pages/MetricsVisualization";
import ClientAssessmentForm from "./pages/ClientAssessmentForm";

const App = () => {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />}>
              <Route path="submitted-forms" element={<SubmittedForms />} />
              <Route path="metrics" element={<MetricsVisualization />} />
              <Route path="client-assessment" element={<ClientAssessmentForm />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;