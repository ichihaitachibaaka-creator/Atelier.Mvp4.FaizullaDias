/*
# Create rate_limit_log table for API rate limiting

1. New Tables
- `rate_limit_log`: tracks API request timestamps per IP address for rate limiting
  - `id` (uuid, primary key)
  - `ip_hash` (text, NOT NULL — SHA-256 hash of the IP address, not the raw IP, for privacy)
  - `endpoint` (text, NOT NULL — which API endpoint was hit, e.g. 'generate-pattern')
  - `created_at` (timestamptz, defaults to now())

2. Security
- Enable RLS on rate_limit_log.
- Allow anon + authenticated INSERT (the edge function needs to insert rate limit records using the service role key, but we also allow anon for safety).
- No SELECT/UPDATE/DELETE from the client — the edge function uses the service role key which bypasses RLS.
- Only the server-side edge function (with service role key) reads and cleans up this table.

3. Index
- Composite index on (ip_hash, endpoint, created_at) for fast rate limit queries.
- Auto-cleanup: old records are deleted by the edge function on each request (older than 5 minutes).
*/

CREATE TABLE IF NOT EXISTS rate_limit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_hash text NOT NULL,
  endpoint text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE rate_limit_log ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_rate_limit_lookup ON rate_limit_log(ip_hash, endpoint, created_at);

DROP POLICY IF EXISTS "insert_rate_limit" ON rate_limit_log;
CREATE POLICY "insert_rate_limit"
  ON rate_limit_log FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
