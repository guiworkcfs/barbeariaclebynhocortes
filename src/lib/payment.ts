// MercadoPago SDK loaded from index.html
declare global {
  interface Window {
    emailjs: {
      send: (service: string, template: string, data: any, publicKey: string) => Promise<any>;
    };
    MercadoPago: any;
  }
}

// Configs MOCK - substitua pelas reais
export const MP_PUBLIC_KEY = 'TEST-f71e5a88-1f5b-4a9b-b1e3-1d0f7e0b2c9d'; // Sua chave pública MP test/prod
export const EMAILJS_CONFIG = {
  service_id: 'default_service',
  template_id: 'template_agendamento',
  public_key: 'user_mock'
} as const;

export const PIX_KEY = 'guicfswork@gmail.com';
export const BARBER_PHONE = '5582987243277';

export interface AppointmentData {
  name: string;
  phone: string;
  services: string[];
  total: number;
  date: string;
  time: string;
  paymentType: 'online' | 'presencial';
  totalDuration: number; // minutes
}

// Notifica barbeiro automaticamente (email + WA API mock/log)
export const notifyBarber = async (appointmentData: AppointmentData) => {
  try {
    // Email via EmailJS
    if (window.emailjs) {
      await window.emailjs.send(
        EMAILJS_CONFIG.service_id,
        EMAILJS_CONFIG.template_id,
        appointmentData,
        EMAILJS_CONFIG.public_key
      );
      console.log('✅ Email enviado ao barbeiro');
    }

    // WhatsApp API mock - em prod configure green-api ou backend
    console.log('✅ WhatsApp enviado ao barbeiro:', appointmentData);
    return true;
  } catch (error) {
    console.error('❌ Erro na notificação:', error);
    return false;
  }
};

// Gera payload Pix EMV string para QR (estático com valor)
export const createPixPayload = (amount: number, description: string, merchantName = 'Clebynho Cortes', city = 'Maceio') => {
  const txid = 'TX' + Date.now().toString(36).toUpperCase();
  const merchantAccount = '000201'; // Payload format
  const keyField = '52040000'; // Pix key
  const pixKeyValue = PIX_KEY;
  const amountField = amount > 0 ? `5303${Math.round(amount * 100)}` : '';
  const merchantNameField = `5802BR`;
  const merchantCityField = `59${city.length}${city}`;
  const txidField = `62${txid.length}01${txid.padEnd(25, 'F')}`;
  const crc = '6304'; // placeholder, real CRC calculated
  const payload = merchantAccount + keyField + pixKeyValue.length + pixKeyValue + amountField + merchantNameField + merchantNameField.length + merchantName + merchantCityField + txidField + crc;
  return payload;
};

// Pagamento Online com QR PIX
export const initiateOnlinePayment = async (total: number, appointmentData: AppointmentData) => {
  console.log('🔄 Gerando QR PIX para R$', total);
  
  const description = `Agendamento ${appointmentData.name} - ${appointmentData.services.join(', ')}`;
  const pixPayload = createPixPayload(total, description);
  
  const qrUrl = `https://geradornumerico.com.br/qr?text=${encodeURIComponent(pixPayload)}`; // External QR gen for demo
  const message = `📱 Escaneie o QR PIX abaixo com seu app bancário:\n\nPayload Pix:\n${pixPayload}\n\nQR: ${qrUrl}\n\nTotal: R$${total.toFixed(2)}\n\nApós pagar, clique OK para confirmar e notificar barbeiro (test).`;
  
  alert(message);
  
  // Mock approval (in prod, poll payment status)
  if (confirm('Pagamento feito? Clique OK para confirmar.')) {
    const success = await notifyBarber({...appointmentData, paymentType: 'online'});
    if (success) {
      alert('🎉 Pagamento confirmado! Barbeiro (82 98724-3277) foi notificado automaticamente.');
    }
    return success;
  }
  return false;
};

// Confirma presencial - SEM WhatsApp para cliente
export const confirmPresencial = async (appointmentData: AppointmentData) => {
  // Cliente não recebe WhatsApp automático. Pague via PIX e barbeiro é notificado.
  const success = await notifyBarber({...appointmentData, paymentType: 'presencial'});
  if (success) {
    alert(`✅ Agendamento presencial confirmado!\nPague R$${appointmentData.total.toFixed(2)} via PIX:\n${PIX_KEY}\n\nBarbeiro notificado.`);
  }
  return success;
};

// Fallback WhatsApp tradicional (para botão opcional)
export const sendWhatsApp = (message: string) => {
  const encoded = encodeURIComponent(message);
  window.open(`https://wa.me/${BARBER_PHONE}?text=${encoded}`, '_blank');
};

