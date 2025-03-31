
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
        
        console.log("Current session:", session);
        
        if (!session) {
          console.log("No session found");
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

        console.log("Profile data:", data);
        console.log("Profile query error:", error);

        if (error) {
          console.error("Error checking terms acceptance:", error);
          setHasAcceptedTerms(false);
          setIsLoading(false);
          return;
        }

        const acceptedTerms = data?.terms_accepted_at !== null;
        console.log("Has accepted terms:", acceptedTerms);
        console.log("Terms accepted at:", data?.terms_accepted_at);
        
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
    console.log("acceptTerms function called");
    try {
      setIsAccepting(true);
      
      // Get the current user session
      const { data: { session } } = await supabase.auth.getSession();
      console.log("User session for terms acceptance:", session);
      
      if (!session) {
        console.error("No session found when accepting terms");
        toast({
          title: "Error",
          description: "You must be logged in to accept terms.",
          variant: "destructive",
        });
        setIsAccepting(false);
        return Promise.reject(new Error("Not logged in"));
      }

      // Set current timestamp
      const now = new Date().toISOString();
      console.log("Setting terms_accepted_at to:", now);
      console.log("User ID:", session.user.id);
      
      // Direct, simple update to the terms_accepted_at field
      const result = await supabase
        .from("profiles")
        .update({ terms_accepted_at: now })
        .eq("id", session.user.id);
      
      console.log("Update result:", result);
      
      if (result.error) {
        console.error("Database error:", result.error);
        toast({
          title: "Error",
          description: "Failed to accept terms. Please try again.",
          variant: "destructive",
        });
        throw result.error;
      }

      // Check if the update actually affected any rows
      if (result.count === 0) {
        console.warn("Update query succeeded but no rows were affected");
      }

      // Verify the update worked by fetching the profile again
      const { data: updatedProfile, error: fetchError } = await supabase
        .from("profiles")
        .select("terms_accepted_at")
        .eq("id", session.user.id)
        .single();
        
      console.log("Updated profile after acceptance:", updatedProfile);
      
      if (fetchError) {
        console.error("Error verifying update:", fetchError);
      }

      // Update local state
      setHasAcceptedTerms(true);
      setTermsAcceptedAt(now);
      
      toast({
        title: "Terms Accepted",
        description: "You have successfully accepted the Terms and Conditions.",
      });
      
      return Promise.resolve();
    } catch (error: any) {
      console.error("Error accepting terms:", error);
      toast({
        title: "Error",
        description: "Failed to accept terms. Please try again later.",
        variant: "destructive",
      });
      return Promise.reject(error);
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
