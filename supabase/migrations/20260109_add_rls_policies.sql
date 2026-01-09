-- RLS Policies for Core Tables (Applied via MCP)
-- This migration adds Row Level Security policies to ensure users can only access their own data

-- =====================================================
-- Helper functions with secure search_path
-- =====================================================

CREATE OR REPLACE FUNCTION is_current_user_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = user_uuid
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION get_user_roles()
RETURNS TABLE(user_id UUID, role VARCHAR) AS $$
BEGIN
  RETURN QUERY SELECT ur.user_id, ur.role FROM public.user_roles ur;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- =====================================================
-- WORDS TABLE
-- =====================================================

ALTER TABLE words ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own words" ON words;
DROP POLICY IF EXISTS "Users can insert own words" ON words;
DROP POLICY IF EXISTS "Users can update own words" ON words;
DROP POLICY IF EXISTS "Users can delete own words" ON words;
DROP POLICY IF EXISTS "Admins can view all words" ON words;

CREATE POLICY "Users can view own words"
  ON words FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own words"
  ON words FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own words"
  ON words FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own words"
  ON words FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all words"
  ON words FOR SELECT USING (is_current_user_admin());

-- =====================================================
-- WORD_PROGRESS TABLE
-- =====================================================

ALTER TABLE word_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all users" ON word_progress;
DROP POLICY IF EXISTS "Users can view own word_progress" ON word_progress;
DROP POLICY IF EXISTS "Users can insert own word_progress" ON word_progress;
DROP POLICY IF EXISTS "Users can update own word_progress" ON word_progress;
DROP POLICY IF EXISTS "Users can delete own word_progress" ON word_progress;
DROP POLICY IF EXISTS "Admins can view all word_progress" ON word_progress;

CREATE POLICY "Users can view own word_progress"
  ON word_progress FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own word_progress"
  ON word_progress FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own word_progress"
  ON word_progress FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own word_progress"
  ON word_progress FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all word_progress"
  ON word_progress FOR SELECT USING (is_current_user_admin());

-- =====================================================
-- USER_ROLES TABLE
-- =====================================================

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own role" ON user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can insert roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can delete roles" ON user_roles;

CREATE POLICY "Users can view own role"
  ON user_roles FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON user_roles FOR SELECT USING (is_current_user_admin());

CREATE POLICY "Admins can insert roles"
  ON user_roles FOR INSERT WITH CHECK (is_current_user_admin());

CREATE POLICY "Admins can update roles"
  ON user_roles FOR UPDATE USING (is_current_user_admin());

CREATE POLICY "Admins can delete roles"
  ON user_roles FOR DELETE USING (is_current_user_admin());

-- =====================================================
-- PACKS TABLE
-- =====================================================

ALTER TABLE packs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view packs" ON packs;
DROP POLICY IF EXISTS "Admins can manage packs" ON packs;

CREATE POLICY "Anyone can view packs"
  ON packs FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage packs"
  ON packs FOR ALL USING (is_current_user_admin());

-- =====================================================
-- SENTENCES TABLE
-- =====================================================

ALTER TABLE sentences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view sentences" ON sentences;
DROP POLICY IF EXISTS "Admins can manage sentences" ON sentences;

CREATE POLICY "Anyone can view sentences"
  ON sentences FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage sentences"
  ON sentences FOR ALL USING (is_current_user_admin());

-- =====================================================
-- FEEDBACK TABLE
-- =====================================================

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert feedback" ON feedback;
DROP POLICY IF EXISTS "Users can insert own feedback" ON feedback;

CREATE POLICY "Users can insert own feedback"
  ON feedback FOR INSERT WITH CHECK (auth.uid() = user_id);
