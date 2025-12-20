-- Admin RLS Policies
-- Run this in your Supabase SQL editor to allow admins to view all data

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION is_current_user_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Allow admins to view all words
CREATE POLICY "Admins can view all words" ON words
  FOR SELECT
  USING (is_current_user_admin());

-- Allow admins to view all phrases
CREATE POLICY "Admins can view all phrases" ON phrases
  FOR SELECT
  USING (is_current_user_admin());

-- Allow admins to view all word_progress
CREATE POLICY "Admins can view all word_progress" ON word_progress
  FOR SELECT
  USING (is_current_user_admin());

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename IN ('words', 'phrases', 'word_progress')
ORDER BY tablename, policyname;
