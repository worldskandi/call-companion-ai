-- Update existing user to admin role
UPDATE public.user_roles 
SET role = 'admin' 
WHERE user_id = '68a3b678-9796-481e-89f8-89b3041c93ed';