import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Scissors, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const [email, setEmail] = useState(""); 
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signIn(email, password);
    if (error) {
      toast({ title: "Erro ao entrar", description: error.message, variant: "destructive" });
    } else {
      navigate("/admin");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <Scissors className="w-10 h-10 mx-auto text-foreground" />
          <h1 className="text-3xl font-bold uppercase tracking-wider">
            Área do Admin
          </h1>
          <p className="text-muted-foreground text-sm">Faça login para gerenciar agendamentos</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            placeholder="Email do admin"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-card border-border"
            required
          />
          <Input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-card border-border"
            minLength={6}
            required
          />
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-foreground text-background hover:bg-foreground/90 font-bold uppercase tracking-wide"
          >
            {loading ? "Aguarde..." : "Entrar como Admin"}
          </Button>
        </form>

        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="w-full text-muted-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar ao agendamento
        </Button>
      </div>
    </div>
  );
};

export default Auth;
