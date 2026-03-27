import { useState, useMemo } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, CheckCircle, Phone, User, Scissors, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.jpeg";

const SERVICES = [
  { id: "corte", name: "Corte de Cabelo", price: 35 },
  { id: "barba", name: "Barba", price: 25 },
  { id: "sobrancelha", name: "Sobrancelha", price: 15 },
  { id: "pigmentacao", name: "Pigmentação", price: 50 },
  { id: "relaxamento", name: "Relaxamento", price: 45 },
  { id: "hidratacao", name: "Hidratação Capilar", price: 40 },
  { id: "platinado", name: "Platinado", price: 80 },
  { id: "nevou", name: "Nevou", price: 60 },
];

const HOURS = Array.from({ length: 13 }, (_, i) => {
  const h = i + 8;
  return `${String(h).padStart(2, "0")}:00`;
});

const WHATSAPP_NUMBER = "5582987243277";

const Index = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState("");

  const total = useMemo(
    () =>
      SERVICES.filter((s) => selectedServices.includes(s.id)).reduce(
        (sum, s) => sum + s.price,
        0
      ),
    [selectedServices]
  );

  const toggleService = (id: string) => {
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const isFormValid = name && phone && selectedServices.length > 0 && date && time;

  const handleWhatsApp = () => {
    if (!isFormValid) return;

    const serviceNames = SERVICES.filter((s) => selectedServices.includes(s.id)).map((s) => s.name).join(', ');
    const message = `*Novo Agendamento - Clebynho Cortes*\n\n👤 *Cliente:* ${name}\n📱 *Telefone:* ${phone}\n✂️ *Serviços:* ${serviceNames}\n💰 *Total:* R$ ${total.toFixed(2)}\n📅 *Data:* ${format(date!, "dd/MM/yyyy", { locale: ptBR })}\n🕐 *Horário:* ${time}`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="flex flex-col items-center justify-center py-12 px-4 border-b border-border">
        <img src={logo} alt="Logo Clebynho Cortes" className="w-36 h-36 rounded-full object-cover border-2 border-foreground mb-6" />
        <h1 className="text-4xl md:text-5xl font-bold tracking-wider text-foreground uppercase">
          Clebynho Cortes
        </h1>
        <p className="text-muted-foreground mt-2 text-lg tracking-widest uppercase">
          Desde 2018 • Agende seu horário
        </p>
      </header>

      <main className="max-w-lg mx-auto px-4 py-10 space-y-8">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold uppercase tracking-wide flex items-center gap-2">
            <User className="w-5 h-5" /> Seus Dados
          </h2>
          <Input placeholder="Nome completo" value={name} onChange={(e) => setName(e.target.value)} className="bg-card border-border text-foreground placeholder:text-muted-foreground" />
          <Input placeholder="Telefone/WhatsApp" value={phone} onChange={(e) => setPhone(e.target.value)} className="bg-card border-border text-foreground placeholder:text-muted-foreground" />
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold uppercase tracking-wide flex items-center gap-2">
            <Scissors className="w-5 h-5" /> Serviços
          </h2>
          <div className="space-y-3">
            {SERVICES.map((service) => (
              <label key={service.id} className={cn("flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors", selectedServices.includes(service.id) ? "bg-accent border-foreground" : "bg-card border-border hover:border-muted-foreground")}>
                <div className="flex items-center gap-3">
                  <Checkbox checked={selectedServices.includes(service.id)} onCheckedChange={() => toggleService(service.id)} />
                  <span className="font-medium">{service.name}</span>
                </div>
                <span className="font-bold text-foreground">R$ {service.price},00</span>
              </label>
            ))}
          </div>
          {total > 0 && (
            <div className="flex justify-between items-center p-4 bg-secondary rounded-lg border border-border">
              <span className="text-lg font-bold uppercase">Total</span>
              <span className="text-2xl font-bold">R$ {total.toFixed(2)}</span>
            </div>
          )}
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold uppercase tracking-wide flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" /> Data e Horário
          </h2>
          <div className="grid grid-cols-4 gap-2">
            {HOURS.map((h) => (
              <Button key={h} variant={time === h ? "default" : "outline"} className={cn("text-sm", time === h ? "bg-foreground text-background" : "bg-card border-border hover:bg-accent")} onClick={() => setTime(h)}>
                {h}
              </Button>
            ))}
          </div>
        </section>

        <Button onClick={handleWhatsApp} disabled={!isFormValid} className="w-full h-14 text-lg font-bold uppercase tracking-wide bg-green-600 hover:bg-green-700 disabled:opacity-40 shadow-lg">
          <CheckCircle className="mr-2 h-5 w-5" />
          Enviar Agendamento WhatsApp
        </Button>
      </main>

      <footer className="border-t border-border py-8 px-4 text-center text-muted-foreground text-sm">
        <p>© Clebynho Cortes — Desde 2018 | (82) 98724-3277</p>
      </footer>
    </div>
  );
};

export default Index;

