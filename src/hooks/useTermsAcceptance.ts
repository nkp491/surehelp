import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useTermsAcceptance = () => {
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);
  const [termsAcceptedAt, setTermsAcceptedAt] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const checkTermsAcceptance = async () => {
      try {
        setIsLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setHasAcceptedTerms(false);
          setIsLoading(false);
          return;
        }

        // Check profile table for terms_accepted_at field
        const { data, error } = await supabase
          .from("profiles")
          .select("terms_accepted_at")
          .eq("id", session.user.id)
          .single();

        if (error) {
          console.error("Error checking terms acceptance:", error);
          setHasAcceptedTerms(false);
          setIsLoading(false);
          return;
        }

        const acceptedTerms = data?.terms_accepted_at !== null;
        setHasAcceptedTerms(acceptedTerms);
        setTermsAcceptedAt(data?.terms_accepted_at);
      } catch (error) {
        console.error("Error checking terms acceptance:", error);
        setHasAcceptedTerms(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkTermsAcceptance();
  }, []);

  const acceptTerms = async () => {
    try {
      setIsAccepting(true);
      
      // Get the current user session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Error",
          description: "You must be logged in to accept terms.",
          variant: "destructive",
        });
        setIsAccepting(false);
        return;
      }

      // Set current timestamp
      const now = new Date().toISOString();
      
      // Update profile with terms acceptance timestamp
      // Important: Keep this query as simple as possible to avoid SQL errors
      const { error } = await supabase
        .from("profiles")
        .update({ terms_accepted_at: now })
        .eq("id", session.user.id);

      if (error) {
        console.error("Database error:", error);
        throw error;
      }

      // Update the local state
      setHasAcceptedTerms(true);
      setTermsAcceptedAt(now);
      
      toast({
        title: "Terms Accepted",
        description: "You have successfully accepted the Terms and Conditions.",
      });
    } catch (error: any) {
      console.error("Error accepting terms:", error);
      toast({
        title: "Error",
        description: "Failed to accept terms. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAccepting(false);
    }
  };

  return {
    hasAcceptedTerms,
    termsAcceptedAt,
    isLoading,
    isAccepting,
    acceptTerms
  };
};
