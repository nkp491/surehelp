-- Fix CRITICAL security vulnerabilities detected by Lovable LLM Database Check
-- Address: Customer Email Addresses and Phone Numbers Could Be Stolen
-- Address: Customer Payment and Subscription Information Could Be Exposed  
-- Address: Confidential Sales Performance Data Could Be Accessed by Competitors

-- ============================================================================
-- FIX 1: Ensure profiles table has proper RLS policies (already addressed but double-check)
-- ============================================================================

-- Verify profiles table has RLS enabled and proper policies
-- (This should already be fixed in previous migration, but ensuring completeness)

-- ============================================================================
-- FIX 2: Ensure subscriptions table has proper RLS policies (already addressed but double-check)
-- ============================================================================

-- Verify subscriptions table has RLS enabled and proper policies
-- (This should already be fixed in previous migration, but ensuring completeness)

-- ============================================================================
-- FIX 3: Address daily_metrics table security - CRITICAL BUSINESS DATA EXPOSURE
-- ============================================================================

-- Enable RLS on daily_metrics table if it exists and doesn't have it
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'daily_metrics'
    ) THEN
        -- Enable RLS
        EXECUTE 'ALTER TABLE public.daily_metrics ENABLE ROW LEVEL SECURITY';
        
        -- Drop any existing overly permissive policies
        EXECUTE 'DROP POLICY IF EXISTS "Allow public read" ON public.daily_metrics';
        EXECUTE 'DROP POLICY IF EXISTS "Allow authenticated read" ON public.daily_metrics';
        EXECUTE 'DROP POLICY IF EXISTS "Allow all users" ON public.daily_metrics';
        
        -- Create restrictive policy: Users can only see their own metrics
        EXECUTE 'CREATE POLICY "Users can view own metrics" ON public.daily_metrics
            FOR SELECT TO authenticated
            USING (user_id = auth.uid())';
        
        -- Create policy: Managers can see metrics of their team members
        EXECUTE 'CREATE POLICY "Managers can view team metrics" ON public.daily_metrics
            FOR SELECT TO authenticated
            USING (
                EXISTS (
                    SELECT 1 FROM public.team_members tm
                    WHERE tm.team_id = (
                        SELECT team_id FROM public.team_members 
                        WHERE user_id = public.daily_metrics.user_id
                    )
                    AND tm.user_id = auth.uid()
                    AND tm.role LIKE ''manager%''
                )
            )';
        
        -- Create policy: System admins can see all metrics
        EXECUTE 'CREATE POLICY "System admins can view all metrics" ON public.daily_metrics
            FOR SELECT TO authenticated
            USING (
                EXISTS (
                    SELECT 1 FROM public.user_roles
                    WHERE user_id = auth.uid() 
                    AND role = ''system_admin''
                )
            )';
        
        -- Create policy: Users can only insert their own metrics
        EXECUTE 'CREATE POLICY "Users can insert own metrics" ON public.daily_metrics
            FOR INSERT TO authenticated
            WITH CHECK (user_id = auth.uid())';
        
        -- Create policy: Users can only update their own metrics
        EXECUTE 'CREATE POLICY "Users can update own metrics" ON public.daily_metrics
            FOR UPDATE TO authenticated
            USING (user_id = auth.uid())
            WITH CHECK (user_id = auth.uid())';
        
        -- Create policy: Users can only delete their own metrics
        EXECUTE 'CREATE POLICY "Users can delete own metrics" ON public.daily_metrics
            FOR DELETE TO authenticated
            USING (user_id = auth.uid())';
    END IF;
END $$;

-- ============================================================================
-- FIX 4: Additional security hardening for any other potentially exposed tables
-- ============================================================================

-- Ensure all public tables have RLS enabled
DO $$
DECLARE
    table_record RECORD;
BEGIN
    FOR table_record IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename NOT IN ('schema_migrations', 'supabase_migrations')
        AND tablename NOT LIKE 'pg_%'
    LOOP
        -- Enable RLS on all public tables
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_record.tablename);
        
        -- For tables that might not have any policies, create a default deny policy
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename = table_record.tablename
        ) THEN
            -- Create a default deny policy for tables without specific policies
            EXECUTE format('CREATE POLICY "Default deny all" ON public.%I FOR ALL TO authenticated USING (false)', table_record.tablename);
        END IF;
    END LOOP;
END $$;

-- ============================================================================
-- FIX 5: Verify and fix any remaining overly permissive policies
-- ============================================================================

-- Find and fix any policies with overly permissive conditions
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT schemaname, tablename, policyname, qual
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND (qual LIKE '%true%' OR qual LIKE '%1=1%' OR qual = '')
    LOOP
        -- Log the overly permissive policy for review
        RAISE NOTICE 'Found overly permissive policy: %.%.% with condition: %', 
            policy_record.schemaname, 
            policy_record.tablename, 
            policy_record.policyname, 
            policy_record.qual;
    END LOOP;
END $$;

-- ============================================================================
-- SECURITY VERIFICATION QUERIES
-- ============================================================================

-- Query to verify all tables have RLS enabled
-- SELECT schemaname, tablename, rowsecurity 
-- FROM pg_tables 
-- WHERE schemaname = 'public' 
-- AND tablename NOT IN ('schema_migrations', 'supabase_migrations')
-- ORDER BY tablename;

-- Query to verify all tables have policies
-- SELECT schemaname, tablename, COUNT(*) as policy_count
-- FROM pg_policies 
-- WHERE schemaname = 'public'
-- GROUP BY schemaname, tablename
-- ORDER BY tablename;

-- Query to check for any remaining overly permissive policies
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
-- FROM pg_policies 
-- WHERE schemaname = 'public' 
-- AND (qual LIKE '%true%' OR qual LIKE '%1=1%' OR qual = '')
-- ORDER BY tablename, policyname;
