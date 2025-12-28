-- Add source_pack_id to track which pack a word came from
ALTER TABLE words ADD COLUMN IF NOT EXISTS source_pack_id UUID REFERENCES starter_packs(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_words_source_pack_id ON words(source_pack_id);

-- Allow users to delete from user_starter_packs
CREATE POLICY "Users can delete their own starter pack records" ON user_starter_packs
  FOR DELETE
  USING (auth.uid() = user_id);
