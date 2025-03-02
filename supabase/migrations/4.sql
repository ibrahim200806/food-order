-- Drop your existing users register policy
DROP POLICY IF EXISTS "Users can register" ON users;

-- Create a more permissive policy for inserts
CREATE POLICY "Allow public inserts to users" 
ON users 
FOR INSERT 
TO public
WITH CHECK (true);