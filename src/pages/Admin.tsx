import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { LogOut, CalendarIcon, Scissors, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAppointments } from "@/hooks/useAppointments";


interface Appointment {
  id: string;
  client_name: string;
  client_phone: string;
  services: string[];
  total_price: number;
  appointment_date: string;
  appointment_time: string;
  created_at: string;
}

const Admin = () => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [adminDate, setAdminDate] = useState<Date>(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const { toast } = useToast();
  const { useBookedTimes } = useAppointments();
  const bookedTimesQuery = useBookedTimes(adminDate);


  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!loading && user && !isAdmin) {
      toast({ title: "Acesso negado", description: "Você não tem permissão de administrador.", variant: "destructive" });
      navigate("/");
    }
  }, [isAdmin, loading, user, navigate, toast]);

  useEffect(() => {
    if (isAdmin) {
      fetchAppointments();
    }
  }, [isAdmin, adminDate]);


  const fetchAppointments = async () => {
    setLoadingData(true);
    const { data, error } = await supabase
      .from("appointments")
      .select("*")
      .eq("appointment_date", format(adminDate, "yyyy-MM-dd"))
      .order("appointment_time", { ascending: true });

    if (!error && data) {
      setAppointments(data);
    }
    setLoadingData(false);
  };


  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("appointments").delete().eq("id", id);
    if (!error) {
      setAppointments((prev) => prev.filter((a) => a.id !== id));
      toast({ title: "Agendamento removido" });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (loading || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Scissors className="w-6 h-6" />
          <h1 className="text-xl font-bold uppercase tracking-wider">Painel Admin</h1>
        </div>
        <Button variant="ghost" onClick={handleSignOut} className="text-muted-foreground">
          <LogOut className="w-4 h-4 mr-2" /> Sair
        </Button>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-4 items-center mb-6">
          <h2 className="text-2xl font-bold uppercase tracking-wide flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" /> Agendamentos
          </h2>
          <div className="flex items-center gap-2">
            <Calendar
              mode="single"
              selected={adminDate}
              onSelect={(d) => {
                if (d) {
                  setAdminDate(d);
                  fetchAppointments();
                }
              }}
              locale={ptBR}
              className="rounded-md border"
            />
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                const today = new Date();
                today.setHours(0,0,0,0);
                setAdminDate(today);
                fetchAppointments();
              }}
            >
              Hoje
            </Button>
          </div>
        </div>
        {bookedTimesQuery.data && (
          <div className="mb-4 p-3 bg-secondary rounded-lg">
            <p className="text-sm text-muted-foreground">
              Horários ocupados hoje: {bookedTimesQuery.data.length} / 13 (8h-20h)
            </p>
          </div>
        )}


        {loadingData ? (
          <p className="text-muted-foreground">Carregando agendamentos...</p>
        ) : appointments.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg">Nenhum agendamento ainda.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((apt) => (
              <div
                key={apt.id}
                className="p-4 bg-card border border-border rounded-lg space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold text-lg">{apt.client_name}</p>
                    <p className="text-sm text-muted-foreground">{apt.client_phone}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">
                      {format(new Date(apt.appointment_date + "T00:00:00"), "dd/MM/yyyy", { locale: ptBR })}
                    </p>
                    <p className="text-sm text-muted-foreground">{apt.appointment_time.slice(0, 5)}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {apt.services.map((s) => (
                    <span key={s} className="text-xs bg-secondary px-2 py-1 rounded">
                      {s}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="font-bold">R${apt.total_price},00</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(apt.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Admin;
