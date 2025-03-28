
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log("Verify-user-roles function called");
    const startTime = Date.now();
    
    // Create a Supabase client with the Auth context of the logged in user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Get the session and user from the request
    const {
      data: { session },
    } = await supabaseClient.auth.getSession()

    if (!session) {
      return new Response(
        JSON.stringify({ error: 'Not authenticated' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    // Parse the body to get required roles
    const { requiredRoles } = await req.json()
    console.log(`Verifying roles for user ${session.user.id}:`, { requiredRoles });
    
    if (!requiredRoles || !Array.isArray(requiredRoles) || requiredRoles.length === 0) {
      console.log("No required roles specified, granting access");
      return new Response(
        JSON.stringify({ hasRequiredRole: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get the user's roles
    const { data: userRoles, error: rolesError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)

    if (rolesError) {
      console.error('Error fetching user roles:', rolesError)
      return new Response(
        JSON.stringify({ hasRequiredRole: false, error: rolesError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Extract roles from the result
    const roles = userRoles.map(r => r.role)
    
    // Always grant access to system_admin regardless of required roles
    if (roles.includes('system_admin')) {
      console.log(`User ${session.user.id} is system_admin, access granted`)
      return new Response(
        JSON.stringify({ hasRequiredRole: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if the user has any of the required roles
    const hasRequiredRole = requiredRoles.some(role => roles.includes(role))

    console.log(`User ${session.user.id} roles: ${roles.join(', ')}`)
    console.log(`Required roles: ${requiredRoles.join(', ')}`)
    console.log(`Has required role: ${hasRequiredRole}`)
    console.log(`Verification completed in ${Date.now() - startTime}ms`);

    return new Response(
      JSON.stringify({ hasRequiredRole }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error verifying roles:', error)
    return new Response(
      JSON.stringify({ hasRequiredRole: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
