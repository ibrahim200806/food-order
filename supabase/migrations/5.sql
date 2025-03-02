-- Run this in Supabase SQL Editor to check policies
SELECT * FROM pg_policies WHERE tablename = 'orders';

-- If needed, disable RLS for orders table for testing
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;

-- Or create a permissive policy
CREATE POLICY "Allow insert to orders" ON orders
FOR INSERT
WITH CHECK (true);