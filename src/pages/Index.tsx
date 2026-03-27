import { useState, useMemo, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, CheckCircle, Mail, MessageCircle, Phone, User, Scissors, CreditCard, MapPin, Github, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { AppointmentData, initiateOnlinePayment, confirmPresencial, sendWhatsApp, getPixData } from "@/lib/payment";
import PaymentModal from "@/components/PaymentModal";
import { useToast } from "@/components/ui/use-toast"; // shadcn toast
import { usePayment } from "@/hooks/usePayment";
import logo from "@/assets/logo.jpeg";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { UserCog } from "lucide-react";

const SERVICES = [
  { id: "corte", name: "Corte de Cabelo", price: 35, durationMinutes: 30 },
  { id: "barba", name: "Barba", price: 25, durationMinutes: 15 },
  { id: "sobrancelha", name: "Sobrancelha", price: 15, durationMinutes: 10 },
  { id: "pigmentacao", name: "Pigmentação", price: 50, durationMinutes: 60 },
  { id: "relaxamento", name: "Relaxamento", price: 45, durationMinutes: 45 },
  { id: "hidratacao", name: "Hidratação Capilar", price: 40, durationMinutes: 40 },
  { id: "platinado", name: "Platinado", price: 80, durationMinutes: 90 },
  { id: "nevou", name: "Nevou", price: 60, durationMinutes: 60 },
];

const HOURS = Array.from({ length: 13 }, (_, i) => {
  const h = i + 8;
  return `${String(h).padStart(2, "0")}:00`;
});

const PAYMENT_OPTIONS = [
  { value: "online", label: "Pagar Online (PIX ou CARTÃO)", icon: CreditCard },
  { value: "presencial", label: "Pagar Presencial", icon: MapPin },
];

const Index = () => {
  const [name, setName] = useState("");

  const [phone, setPhone] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState("");
  const [paymentType, setPaymentType] = useState<"online" | "presencial">("online");
  const [isLoading, setIsLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pixData, setPixData] = useState({ pixPayload: '', qrUrl: '' });

  const total = useMemo(
    () =>
      SERVICES.filter((s) => selectedServices.includes(s.id)).reduce(
        (sum, s) => sum + s.price,
        0
      ),
    [selectedServices]
  );

  const totalDuration = useMemo(
    () =>
      SERVICES.filter((s) => selectedServices.includes(s.id)).reduce(
        (sum, s) => sum + s.durationMinutes,
        0
      ),
    [selectedServices]
  );

  const appData: AppointmentData = {
    name,
    phone,
    services: SERVICES.filter((s) => selectedServices.includes(s.id)).map((s) => s.name),
    total,
    date: date ? format(date, "dd/MM/yyyy", { locale: ptBR }) : '',
    time,
    paymentType,
    totalDuration
  };

  const { toast } = useToast();
  const payment = usePayment(appData, total > 0);
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const toggleService = (id: string) => {
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const isFormValid = name && phone && selectedServices.length > 0 && date && time && paymentType;

  const handleConfirm = async () => {
    if (!isFormValid) return;
    setIsLoading(true);

    if (paymentType === 'presencial') {
      const success = await confirmPresencial(appData);
      if (success) {
        toast.success('✅ Agendamento presencial confirmado! Pague PIX no local.');
      }
      setIsLoading(false);
      return;
    }

    // Online payment
    const data = getPixData(total, appData);
    setPixData(data);
    payment.createPix(total);
    setShowPaymentModal(true);
    setIsLoading(false);
  };

  const handlePaymentSuccess = async () => {
    payment.setIsPolling(true);
    // Trigger poll
    try {
      await payment.confirmPayment();
      await notifyBarber(appData);
      toast.success('🎉 Pagamento confirmado! Barbeiro notificado automaticamente.');
      setShowPaymentModal(false);
    } catch (error) {
      toast.error('Pagamento ainda não confirmado. Aguarde.');
    }
  };

  const handleBarberChat = () => {
    const message = `*Consulta Agendamento - Cliente*\n\nNome: ${name}\nTelefone: ${phone}\nServiços: ${SERVICES.filter(s => selectedServices.includes(s.id)).map(s => s.name).join(', ')}\nTotal: R$${total.toFixed(2)}\nTempo: ${totalDuration} min\nData: ${date ? format(date, "dd/MM", { locale: ptBR }) : ''} ${time}`;
    sendWhatsApp(message);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <header className="flex flex-col items-center justify-center py-12 px-4 border-b border-border">
        <img
          src={logo}
          alt="Logo Clebynho Cortes"
          className="w-36 h-36 rounded-full object-cover border-2 border-foreground mb-6"
        />
        <h1 className="text-4xl md:text-5xl font-bold tracking-wider text-foreground uppercase">
          Clebynho Cortes
        </h1>
        <p className="text-muted-foreground mt-2 text-lg tracking-widest uppercase">
          Desde 2018 • Agende seu horário
        </p>
      </header>

      {/* Formulário de Agendamento */}
      <main className="max-w-lg mx-auto px-4 py-10 space-y-8">
        {/* Dados do Cliente */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold uppercase tracking-wide flex items-center gap-2">
            <User className="w-5 h-5" /> Seus Dados
          </h2>
          <Input
            placeholder="Nome completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-card border-border text-foreground placeholder:text-muted-foreground"
          />
          <Input
            placeholder="Telefone/WhatsApp"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="bg-card border-border text-foreground placeholder:text-muted-foreground"
          />
        </section>

        {/* Serviços */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold uppercase tracking-wide flex items-center gap-2">
            <Scissors className="w-5 h-5" /> Serviços
          </h2>
          <div className="space-y-3">
            {SERVICES.map((service) => (
              <label
                key={service.id}
                className={cn(
                  "flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors",
                  selectedServices.includes(service.id)
                    ? "bg-accent border-foreground"
                    : "bg-card border-border hover:border-muted-foreground"
                )}
              >
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={selectedServices.includes(service.id)}
                    onCheckedChange={() => toggleService(service.id)}
                  />
                  <span className="font-medium">{service.name}</span>
                  <span className="text-sm text-muted-foreground">({service.durationMinutes}min)</span>
                </div>
                <span className="font-bold text-foreground">R$ {service.price},00</span>
              </label>
            ))}
          </div>
          {total > 0 && (
            <>
              <div className="flex justify-between items-center p-4 bg-secondary rounded-lg border border-border">
                <span className="text-lg font-bold uppercase">Total</span>
                <span className="text-2xl font-bold">R$ {total.toFixed(2)}</span>
              </div>
              <div className="p-4 bg-accent/50 rounded-lg border border-accent text-center font-medium">
                Tempo estimado: {totalDuration} min 
                ({Math.floor(totalDuration / 60)}h {totalDuration % 60}m)
              </div>
            </>
          )}
        </section>

        {/* Data e Horário */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold uppercase tracking-wide flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" /> Data e Horário
          </h2>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal bg-card border-border",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "dd 'de' MMMM, yyyy", { locale: ptBR }) : "Selecione a data"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-card border-border" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                locale={ptBR}
                className="p-3"
              />
            </PopoverContent>
          </Popover>
          <div className="grid grid-cols-4 gap-2">
            {HOURS.map((h) => (
              <Button
                key={h}
                variant={time === h ? "default" : "outline"}
                className={cn(
                  "text-sm p-2 h-auto",
                  time === h ? "bg-foreground text-background" : "bg-card border-border hover:bg-accent"
                )}
                onClick={() => setTime(h)}
              >
                {h}
              </Button>
            ))}
          </div>
        </section>

        {/* Opção de Pagamento */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold uppercase tracking-wide flex items-center gap-2">
            <Mail className="w-5 h-5" /> Como quer pagar?
          </h2>
          <RadioGroup 
            value={paymentType} 
            onValueChange={(value: string) => setPaymentType(value as "online" | "presencial")}
            className="space-y-2"
          >
            {PAYMENT_OPTIONS.map((option) => (
              <div key={option.value} className="flex items-center p-3 border rounded-lg cursor-pointer hover:border-foreground gap-3">
                <RadioGroupItem value={option.value} id={option.value} className="flex-shrink-0" />
                <div className="flex items-center gap-2">
                  <option.icon className="w-5 h-5 flex-shrink-0" />
                  <label htmlFor={option.value} className="font-medium cursor-pointer leading-tight">
                    {option.label}
                  </label>
                </div>
              </div>
            ))}
          </RadioGroup>
        </section>

        {/* Botão Confirmar */}
        <Button
          onClick={handleConfirm}
          disabled={!isFormValid || isLoading}
          className="w-full h-14 text-lg font-bold uppercase tracking-wide bg-foreground text-background hover:bg-foreground/90 disabled:opacity-40 shadow-lg"
          size="lg"
        >
          {isLoading ? (
            <>
              <CheckCircle className="mr-2 h-5 w-5 animate-spin" />
              Processando...
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 h-5 w-5" />
              {paymentType === 'online' ? 'Abrir QR CODE OU CADASTRO DE Cartão' : 'CONFIRMAR AGENDAMENTO'}
            </>
          )}
        </Button>

        {/* Botão opcional falar com barbeiro */}
        <Button
          variant="outline"
          onClick={handleBarberChat}
          className="w-full h-12 text-sm font-medium uppercase tracking-wide border-foreground hover:bg-accent"
          disabled={!name || selectedServices.length === 0}
        >
          <MessageCircle className="mr-2 h-4 w-4" />
          Falar com barbeiro por WhatsApp
        </Button>
        {user && isAdmin ? (
          <Button
            onClick={() => navigate("/admin")}
            className="w-full h-12 bg-primary text-primary-foreground font-bold uppercase tracking-wide shadow-md mt-3"
          >
            <UserCog className="mr-2 h-4 w-4" />
            Painel Admin - Gerenciar Agendamentos
          </Button>
        ) : (
          <Button
            variant="outline"
            onClick={() => navigate("/auth")}
            className="w-full h-12 text-sm font-medium uppercase tracking-wide border-2 border-foreground hover:bg-accent hover:text-foreground mt-3"
          >
            Entrar como Admin
          </Button>
        )}
      </main>

      {/* Payment Modal */}
      <PaymentModal
        open={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={handlePaymentSuccess}
        appointmentData={appData}
        pixPayload={pixData.pixPayload}
        pixUrl={pixData.qrUrl}
      />

      {/* Rodapé */}
      <footer className="border-t border-border py-8 px-4 text-center text-muted-foreground">
        <p className="text-sm mb-6">© Clebynho Cortes — Desde 2018</p>
        <p className="mb-4 flex items-center justify-center gap-1 text-sm">
          <Phone className="w-4 h-4" /> (82) 98724-3277
        </p>
        
        {/* Seção GitHub */}
        <div className="max-w-md mx-auto bg-card border border-border rounded-xl p-6 space-y-4">
          <h3 className="text-lg font-bold uppercase tracking-wide flex items-center justify-center gap-2 text-foreground">
            <Github className="w-6 h-6" /> Veja no GitHub
          </h3>
          <p className="text-sm text-muted-foreground text-center">
            Este site foi desenvolvido com código aberto! Acesse o repositório para ver o código fonte e contribuir.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a 
              href="https://github.com/clebynhocortes/clebynhocortes-contact-main" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-muted text-muted-foreground hover:bg-accent hover:text-foreground border rounded-lg font-medium transition-all text-sm"
            >
              <Github className="w-4 h-4" />
              Ver Repositório
            </a>
            <a 
              href="https://github.com/clebynhocortes/clebynhocortes-contact-main/stargazers" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 border rounded-lg font-medium transition-all text-sm hover:bg-accent"
            >
              <Star className="w-4 h-4" />
              Dar Star
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;

