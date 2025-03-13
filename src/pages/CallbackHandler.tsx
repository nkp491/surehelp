
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import LoadingScreen from '@/components/ui/loading-screen';

/**
 * This component handles OAuth callback redirects
 * It processes the authentication response and redirects to the appropriate page
 */
const CallbackHandler: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Get the hash fragment from the URL
    const handleAuthCallback = async () => {
      try {
        // Process the callback and set the session
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          navigate('/auth?error=callback_error');
          return;
        }
        
        if (data.session) {
          // Successful authentication, redirect to the default page
          navigate('/');
        } else {
          // No session, redirect back to auth
          navigate('/auth');
        }
      } catch (e) {
        console.error('Error processing auth callback:', e);
        navigate('/auth?error=callback_processing');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return <LoadingScreen message="Processing authentication..." />;
};

export default CallbackHandler;
