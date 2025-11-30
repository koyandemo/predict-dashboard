-- Create Users table
CREATE TABLE IF NOT EXISTS public.users (
  user_id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  provider VARCHAR(20) CHECK (provider IN ('google', 'facebook', 'twitter', 'email')) NOT NULL,
  password VARCHAR(255),
  type VARCHAR(10) CHECK (type IN ('user', 'admin', 'seed')) DEFAULT 'user' NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- Create index on provider for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_provider ON public.users(provider);

-- Create index on type for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_type ON public.users(type);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
-- Allow users to view their own record
CREATE POLICY "Users can view their own record" ON public.users
  FOR SELECT USING (user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::int);

-- Allow admins to view all users
CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::int
      AND type = 'admin'
    )
  );

-- Allow users to insert their own record (signup)
CREATE POLICY "Users can insert their own record" ON public.users
  FOR INSERT WITH CHECK (user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::int OR provider = 'email');

-- Allow users to update their own record
CREATE POLICY "Users can update their own record" ON public.users
  FOR UPDATE USING (user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::int);

-- Allow admins to update any user
CREATE POLICY "Admins can update any user" ON public.users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::int
      AND type = 'admin'
    )
  );

-- Allow users to delete their own record
CREATE POLICY "Users can delete their own record" ON public.users
  FOR DELETE USING (user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::int);

-- Allow admins to delete any user
CREATE POLICY "Admins can delete any user" ON public.users
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::int
      AND type = 'admin'
    )
  );

-- Insert a default admin user (you should change this password)
INSERT INTO public.users (name, email, provider, password, type)
VALUES ('Admin User', 'admin@example.com', 'email', '$2a$10$8K1p/a0dURXAm7QiTRqNa.E3YPWs8UkrpC4orE/DCL0rycTSKH.cK', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update the updated_at column
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();