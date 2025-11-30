-- Add admin@gmail.com user with password admin123

INSERT INTO public.users (name, email, provider, password, type)
VALUES ('Admin Gmail User', 'admin@gmail.com', 'email', '$2a$10$8K1p/a0dURXAm7QiTRqNa.E3YPWs8UkrpC4orE/DCL0rycTSKH.cK', 'admin')
ON CONFLICT (email) DO NOTHING;