-- Update RLS policies for profiles table to allow necessary access while maintaining security

-- Drop the overly restrictive policy
DROP POLICY IF EXISTS "profiles access for all" ON public.profiles;

-- Allow public read access to basic profile information (needed for pre-auth flows)
CREATE POLICY "Public read access to basic profile info"
ON public.profiles
FOR SELECT
TO public
USING (true);

-- Allow users to update their own profiles
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Allow users to delete their own profile
CREATE POLICY "Users can delete own profile"
ON public.profiles
FOR DELETE
TO authenticated
USING (auth.uid() = id);