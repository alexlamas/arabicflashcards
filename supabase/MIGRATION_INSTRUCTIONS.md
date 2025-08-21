# Database Migration Instructions

## Overview
These migrations transform the app from a single-user system to a multi-user system with starter packs.

## Prerequisites
1. Back up your existing database
2. Get your Supabase user UUID:
   - Go to Supabase Dashboard > Authentication > Users
   - Copy your user ID (it will look like: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)

## Migration Steps

### Step 1: Run Migrations in Order
Execute these SQL files in your Supabase SQL editor in this exact order:

1. **001_user_isolation.sql** - Adds user_id columns to words and phrases
2. **002_starter_packs.sql** - Creates starter pack tables
3. **003_row_level_security.sql** - Enables RLS policies
4. **004_user_roles.sql** - Adds role-based access control

### Step 2: Assign Existing Data to Your User
After running the migrations, execute this SQL with your actual user UUID:

```sql
-- Replace 'YOUR-USER-UUID-HERE' with your actual UUID from Supabase
UPDATE words SET user_id = 'YOUR-USER-UUID-HERE' WHERE user_id IS NULL;
UPDATE phrases SET user_id = 'YOUR-USER-UUID-HERE' WHERE user_id IS NULL;

-- Make user_id required going forward
ALTER TABLE words ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE phrases ALTER COLUMN user_id SET NOT NULL;

-- Make yourself an admin
INSERT INTO user_roles (user_id, role) VALUES ('YOUR-USER-UUID-HERE', 'admin');
```

### Step 3: Create Your First Starter Pack (Optional)
This will copy your existing words/phrases into a starter pack for new users:

```sql
-- Create a starter pack from your existing data
INSERT INTO starter_packs (name, description, language, level, icon)
VALUES (
  'Lebanese Arabic Essentials',
  'Core vocabulary and phrases for everyday Lebanese Arabic',
  'Lebanese Arabic',
  'beginner',
  '🇱🇧'
);

-- Copy your words to the starter pack (adjust the pack_id after creation)
INSERT INTO starter_pack_words (pack_id, arabic, english, transliteration, type, notes, example_sentences, order_index)
SELECT 
  (SELECT id FROM starter_packs WHERE name = 'Lebanese Arabic Essentials'),
  arabic,
  english,
  transliteration,
  type,
  notes,
  example_sentences,
  ROW_NUMBER() OVER (ORDER BY english)
FROM words
WHERE user_id = 'YOUR-USER-UUID-HERE';

-- Copy your phrases to the starter pack
INSERT INTO starter_pack_phrases (pack_id, arabic, english, transliteration, notes, order_index)
SELECT 
  (SELECT id FROM starter_packs WHERE name = 'Lebanese Arabic Essentials'),
  arabic,
  english,
  transliteration,
  notes,
  ROW_NUMBER() OVER (ORDER BY english)
FROM phrases
WHERE user_id = 'YOUR-USER-UUID-HERE';
```

### Step 4: Verify Migration
Run these queries to verify everything worked:

```sql
-- Check that words have user_id
SELECT COUNT(*) as words_with_user FROM words WHERE user_id IS NOT NULL;

-- Check that you're an admin
SELECT * FROM user_roles WHERE role = 'admin';

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('words', 'phrases', 'word_progress');
```

## Rollback (if needed)
If something goes wrong, you can rollback:

```sql
-- Disable RLS
ALTER TABLE words DISABLE ROW LEVEL SECURITY;
ALTER TABLE phrases DISABLE ROW LEVEL SECURITY;
ALTER TABLE word_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE word_phrases DISABLE ROW LEVEL SECURITY;

-- Drop new tables
DROP TABLE IF EXISTS user_starter_packs CASCADE;
DROP TABLE IF EXISTS starter_pack_phrases CASCADE;
DROP TABLE IF EXISTS starter_pack_words CASCADE;
DROP TABLE IF EXISTS starter_packs CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;

-- Remove user_id columns
ALTER TABLE words DROP COLUMN IF EXISTS user_id;
ALTER TABLE phrases DROP COLUMN IF EXISTS user_id;

-- Drop functions
DROP FUNCTION IF EXISTS is_admin(UUID);
DROP FUNCTION IF EXISTS get_user_roles();
```

## Next Steps
After running migrations, the app code needs to be updated to:
1. Pass user context in all queries
2. Remove hardcoded admin checks
3. Implement starter pack selection UI