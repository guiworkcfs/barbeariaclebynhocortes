import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { TablesInsert } from '@/integrations/supabase/types';
import { format } from 'date-fns';

type AppointmentData = {
  client_name: string;
  client_phone: string;
  services: string[];
  total_price: number;
  appointment_date: string; // YYYY-MM-DD
  appointment_time: string; // HH:MM
};

// Custom hook factory pattern for React Query composables
export const useAppointments = () => {
  const queryClient = useQueryClient();

  const useBookedTimes = (date: Date | undefined) => {
    return useQuery({
      queryKey: ['bookedTimes', date?.toISOString().split('T')[0]],
      queryFn: async () => {
        if (!date) return [];
        const { data, error } = await supabase.rpc('get_booked_times', { 
          target_date: format(date, 'yyyy-MM-dd') 
        });
        if (error) throw error;
        return data || [];
      },
      enabled: !!date,
    });
  };

  const useSaveAppointment = () => {
    return useMutation({
      mutationFn: async (appointment: TablesInsert<'appointments'>) => {
        const { data, error } = await supabase
          .from('appointments')
          .insert(appointment)
          .select()
          .single();
        if (error) throw error;
        return data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['appointments'] });
        queryClient.invalidateQueries({ queryKey: ['bookedTimes'] });
      },
    });
  };

  return {
    useBookedTimes,
    useSaveAppointment,
  };
};



</xai:function_call?



<xai:function_call name="edit_file">
<parameter name="path">c:/Users/UserGui/Desktop/clebynhocortes-contact-main/TODO.md
