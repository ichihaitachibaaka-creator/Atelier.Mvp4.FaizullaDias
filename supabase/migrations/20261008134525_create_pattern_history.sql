/*
# Create pattern_history table for user pattern storage

1. New Tables
- `pattern_history`: stores each user's generated pattern drafts
  - `id` (uuid, primary key)
  - `user_id` (uuid, NOT NULL, defaults to auth.uid(), references auth.users with CASCADE delete)
  - `tshirt_type` (text, the garment style: oversize, polo, regular, slim)
  - `measurements` (jsonb, the input measurements: height, chest, waist, hips)
  - `svg_content` (text, the full SVG markup of the generated pattern)
  - `report_text` (text, the calculation report with all formulas)
  - `created_at` (timestamptz, defaults to now())

2. Security
- Enable RLS on pattern_history.
- Owner-scoped CRUD: each authenticated user can only SELECT, INSERT, UPDATE, DELETE rows they own.
- user_id defaults to auth.uid() so inserts from the client work without explicitly passing user_id.
- Anon role has no access (this table requires authentication).

3. Index
- Index on user_id for fast per-user queries.
*/

CREATE TABLE IF NOT EXISTS pattern_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  tshirt_type text NOT NULL,
  measurements jsonb NOT NULL,
  svg_content text NOT NULL,
  report_text text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE pattern_history ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_pattern_history_user_id ON pattern_history(user_id);

DROP POLICY IF EXISTS "select_own_patterns" ON pattern_history;
CREATE POLICY "select_own_patterns"
  ON pattern_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_patterns" ON pattern_history;
CREATE POLICY "insert_own_patterns"
  ON pattern_history FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_patterns" ON pattern_history;
CREATE POLICY "update_own_patterns"
  ON pattern_history FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_patterns" ON pattern_history;
CREATE POLICY "delete_own_patterns"
  ON pattern_history FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
