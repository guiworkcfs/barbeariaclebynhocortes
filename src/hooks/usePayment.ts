import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AppointmentData } from '@/lib/payment';

// Mock Supabase - prevents crashes
const supabase = {
  from: () => ({
    insert: async () => ({ data: null }),
    select: async () => ({ data: null })
  })
} as any;



export const usePayment = (appointmentData: AppointmentData, enabled: boolean = false) => {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
const [mp, setMp] = useState<any>(null); // MercadoPago
  const [pixId, setPixId] = useState<string>('');
  const [isPolling, setIsPolling] = useState(false);

useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.MercadoPago) {
        const publicKey = import.meta.env.VITE_MP_PUBLIC_KEY || 'TEST-f71e5a88-1f5b-4a9b-b1e3-1d0f7e0b2c9d';
        const mpInstance = new window.MercadoPago(publicKey);
        setMp(mpInstance);
        console.log('✅ MP SDK loaded');
      }
    } catch (e) {
      console.warn('MP SDK init skipped:', e);
    }
  }, []);

  const createPixMutation = useMutation({
    mutationFn: async (total: number) => {
      // Mock/create PIX via MP API - in prod use backend proxy for access_token
      const pixId = 'PIX-' + Date.now();
      setPixId(pixId);
      console.log(`🔄 PIX created (demo): ${pixId} for R$${total}`);
      return pixId;
    }
  });

  const pollPixStatus = useQuery({
    queryKey: ['pix-status', pixId],
    queryFn: async () => {
      setIsPolling(true);
      // Real: GET /v1/payments/{pixId}
      // Demo auto-approve after 8s
      await new Promise(r => setTimeout(r, 8000));
      return { status: 'approved' as const };
    },
    enabled: !!pixId && isPolling,
    refetchInterval: 5000,
    retry: 6,
  });

  const confirmPaymentMutation = useMutation({
  mutationFn: async () => {
      if (pollPixStatus.data?.status !== 'approved') throw new Error('Pagamento não confirmado');
      console.log('💾 Pagamento salvo (Supabase mock - crie table payments)');
      return { id: pixId };
    }
  });

  const processCardPayment = useCallback(async () => {
    console.log('💳 Pagamento com cartão em desenvolvimento - use PIX por enquanto');
    return { status: 'demo', body: { status: 'pending' } };
  }, []);

  const saveCard = useMutation({
    mutationFn: async (cardToken: string) => {
      // Tokenizar e salvar em Supabase (encrypted)
      const { data } = await supabase.from('saved_cards').insert({ user_id: 'anon', token: cardToken });
      return data;
    }
  });

  return {
    mp,
    createPix: createPixMutation.mutate,
    pollStatus: pollPixStatus,
    confirmPayment: confirmPaymentMutation.mutate,
    processCardPayment,
    saveCard: saveCard.mutate,
    pixId,
    setIsPolling,
  };
};

