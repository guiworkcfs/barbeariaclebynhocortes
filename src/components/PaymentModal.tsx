import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, XCircle, CreditCard, Copy } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { AppointmentData } from '@/lib/payment';

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  appointmentData: AppointmentData;
  pixPayload: string;
  pixUrl: string;
}

const PaymentModal = ({ open, onClose, onSuccess, appointmentData, pixPayload, pixUrl }: PaymentModalProps) => {
  const [copied, setCopied] = useState(false);

  const copyPayload = () => {
    navigator.clipboard.writeText(pixPayload);
    setCopied(true);
    toast.success('Payload copiado!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-6 border-b">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <CreditCard className="w-8 h-8" />
            Pagamento PIX - R$ {appointmentData.total.toFixed(2)}
          </DialogTitle>
          <DialogDescription>{appointmentData.services.join(', ')} - {appointmentData.date} {appointmentData.time}</DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* QR Code */}
          <Card>
            <CardContent className="p-6 text-center pt-6">
              <div className="mx-auto w-64 h-64 mb-4 p-4 bg-background rounded-xl shadow-lg border-2 border-dashed border-muted">
                <QRCodeSVG value={pixPayload} size={256} level="H" className="w-full h-full" />
              </div>
              <Badge variant="secondary" className="mb-2">Escaneie com app bancário</Badge>
              <p className="text-sm text-muted-foreground mb-4">Pix imediato • Expira em 5min</p>
            </CardContent>
          </Card>

          {/* Payload */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Label>Payload PIX (cole no app bancário)</Label>
                <Button variant="ghost" size="sm" onClick={copyPayload}>
                  <Copy className={`w-4 h-4 ${copied ? 'text-green-500' : ''}`} />
                </Button>
              </div>
              <Input value={pixPayload} readOnly className="font-mono text-xs min-h-[80px] resize-none" />
            </CardContent>
          </Card>

          {/* Card Payment Section */}
          <Card className="bg-accent/30">
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">💳 Ou pague com cartão</h3>
              {/* Card form aqui, integrate MP Brick */}
              <p className="text-sm text-muted-foreground">Em desenvolvimento - PIX pronto primeiro</p>
            </CardContent>
          </Card>

          {/* Link QR external */}
          {pixUrl && (
            <a href={pixUrl} target="_blank" rel="noopener" className="block text-center underline text-blue-600 hover:text-blue-800">
              Abrir QR em tela cheia →
            </a>
          )}
        </div>

        <DialogFooter className="p-6 border-t">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={onSuccess}>Eu paguei! Verificar agora</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


export default PaymentModal;


