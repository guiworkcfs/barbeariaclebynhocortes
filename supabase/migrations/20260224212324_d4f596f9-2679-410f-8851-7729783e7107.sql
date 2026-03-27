
-- Create a function that returns booked times for a given date (no sensitive data exposed)
CREATE OR REPLACE FUNCTION public.get_booked_times(target_date DATE)
RETURNS TABLE(booked_time TIME) AS $$
  SELECT appointment_time FROM public.appointments WHERE appointment_date = target_date;
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;
