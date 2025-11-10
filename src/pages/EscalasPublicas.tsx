import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Church, Home, Sparkles, FileImage, FileText, Maximize2 } from "lucide-react";
import logoParoquia from "@/assets/logo-paroquia.webp";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface EscalaPublica {
  id: string;
  data: string;
  horario: string;
  observacoes: string | null;
  comunidade_nome: string;
  participantes: Array<{ nome_completo: string; funcao: string; funcao_liturgica: string | null }>;
}

const EscalasPublicas = () => {
  const navigate = useNavigate();
  const [escalas, setEscalas] = useState<EscalaPublica[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), "yyyy-MM"));
  const [comunidades, setComunidades] = useState<string[]>([]);
  const [selectedComunidade, setSelectedComunidade] = useState<string>("todas");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [selectedEscala, setSelectedEscala] = useState<EscalaPublica | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const escalaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsAuthenticated(!!session);
  };

  useEffect(() => {
    fetchData();
  }, [selectedMonth]);

  const fetchData = async () => {
    const { data, error } = await supabase
      .from("escalas_publicas")
      .select("*")
      .gte("data", `${selectedMonth}-01`)
      .lt("data", format(new Date(selectedMonth + "-01").setMonth(new Date(selectedMonth + "-01").getMonth() + 1), "yyyy-MM-dd"));

    if (error) {
      console.error("Erro ao carregar escalas públicas:", error);
      return;
    }

    setEscalas((data || []) as EscalaPublica[]);
    
    const uniqueComunidades = [...new Set((data || []).map(e => e.comunidade_nome))];
    setComunidades(uniqueComunidades);
  };

  const filteredEscalas = selectedComunidade === "todas"
    ? escalas
    : escalas.filter(e => e.comunidade_nome === selectedComunidade);

  const handleDownloadPNG = async () => {
    if (!escalaRef.current) return;
    
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(escalaRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
        logging: false,
      });
      
      const link = document.createElement("a");
      link.download = `escala-${selectedEscala?.data}-${selectedEscala?.horario}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error("Erro ao gerar PNG:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!escalaRef.current) return;
    
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(escalaRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
        logging: false,
      });
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? "landscape" : "portrait",
        unit: "px",
        format: [canvas.width, canvas.height],
      });
      
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save(`escala-${selectedEscala?.data}-${selectedEscala?.horario}.pdf`);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-elegant">
      {/* Header */}
      <header className="border-b border-primary/10 bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm animate-fade-in-down">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <img 
                src={logoParoquia} 
                alt="Logo Paróquia" 
                className="h-10 sm:h-12 w-auto object-contain flex-shrink-0"
              />
              <div className="min-w-0">
                <h1 className="text-sm sm:text-base md:text-lg font-bold text-foreground truncate">Escalas Públicas</h1>
                <p className="text-xs md:text-sm text-muted-foreground truncate hidden sm:block">Paróquia Senhor Santo Cristo dos Milagres</p>
              </div>
            </div>
            <div className="flex gap-1 sm:gap-2 flex-shrink-0">
              <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="px-2 sm:px-3">
                <Home className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                <span className="hidden sm:inline text-xs sm:text-sm">Início</span>
              </Button>
              {isAuthenticated ? (
                <Button size="sm" variant="elegant" onClick={() => navigate("/dashboard")} className="text-xs sm:text-sm px-2 sm:px-4">
                  Dashboard
                </Button>
              ) : (
                <Button size="sm" variant="elegant" onClick={() => navigate("/auth")} className="px-2 sm:px-3">
                  <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                  <span className="hidden sm:inline text-xs sm:text-sm">Entrar</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 sm:py-8">
        {/* Título e Descrição */}
        <div className="text-center mb-6 sm:mb-8 animate-fade-in-up">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3 bg-gradient-primary bg-clip-text text-transparent px-4">
            Consulta de Escalas
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground px-4">
            Confira as escalas litúrgicas das comunidades
          </p>
        </div>

        {/* Filtros */}
        <Card className="mb-6 sm:mb-8 border-primary/10 shadow-red bg-white/90 backdrop-blur-sm animate-scale-in" style={{ animationDelay: "0.2s", animationFillMode: "both" }}>
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="flex items-center gap-2 text-primary text-base sm:text-lg">
              <Church className="h-4 w-4 sm:h-5 sm:w-5" />
              Filtros de Pesquisa
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">Selecione a comunidade e o período desejado</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
            <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-medium text-foreground">Comunidade</label>
                <Select value={selectedComunidade} onValueChange={setSelectedComunidade}>
                  <SelectTrigger className="border-primary/20 focus:border-primary text-xs sm:text-sm h-9 sm:h-10">
                    <SelectValue placeholder="Selecione uma comunidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas as Comunidades</SelectItem>
                    {comunidades.map((com) => (
                      <SelectItem key={com} value={com}>{com}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-medium text-foreground flex items-center gap-2">
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                  Mês e Ano
                </label>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full px-3 py-2 border border-primary/20 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-xs sm:text-sm h-9 sm:h-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Escalas */}
        {filteredEscalas.length === 0 ? (
          <Card className="border-primary/10 bg-white/90 backdrop-blur-sm animate-fade-in-up" style={{ animationDelay: "0.3s", animationFillMode: "both" }}>
            <CardContent className="pt-8 sm:pt-12 pb-8 sm:pb-12 text-center px-4">
              <Church className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground/40 mx-auto mb-3 sm:mb-4" />
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground">
                Nenhuma escala encontrada para o período selecionado.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredEscalas.map((escala, index) => (
              <Card 
                key={escala.id} 
                className="border-primary/10 hover:border-primary/30 transition-all duration-300 hover:shadow-red hover:-translate-y-1 bg-white/90 backdrop-blur-sm animate-fade-in-up cursor-pointer group"
                style={{ animationDelay: `${0.1 * (index % 6)}s`, animationFillMode: "both" }}
                onClick={() => setSelectedEscala(escala)}
              >
                <CardHeader className="bg-gradient-primary text-primary-foreground rounded-t-lg pb-3 sm:pb-4 p-4 sm:p-6 relative">
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Maximize2 className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-base sm:text-lg md:text-xl flex items-start sm:items-center gap-2 flex-wrap pr-8">
                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 mt-0.5 sm:mt-0" />
                    <span className="break-words leading-tight">
                      {format(parseISO(escala.data), "EEEE, dd 'de' MMMM", { locale: ptBR })}
                    </span>
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm text-primary-foreground/90 font-medium">
                    {escala.horario} • {escala.comunidade_nome}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6">
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <h4 className="text-xs sm:text-sm font-semibold text-primary mb-2 sm:mb-3 flex items-center gap-2">
                        <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
                        Participantes
                      </h4>
                      <div className="space-y-2">
                        {escala.participantes.map((p, idx) => (
                          <div
                            key={idx}
                            className="flex flex-col gap-2 p-3 rounded-lg bg-gradient-primary/10 border border-primary/20"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-base sm:text-xl text-foreground">{p.nome_completo}</span>
                              <span className="text-xs sm:text-sm px-3 py-1 rounded-full bg-primary/20 text-primary font-medium">
                                {p.funcao}
                              </span>
                            </div>
                            {p.funcao_liturgica && (
                              <div className="flex items-center gap-2">
                                <span className="text-xs sm:text-sm font-semibold text-primary">
                                  {p.funcao_liturgica}
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {escala.observacoes && (
                      <div className="pt-2 sm:pt-3 border-t border-primary/10">
                        <p className="text-xs sm:text-sm font-semibold text-primary mb-1">Observações:</p>
                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed break-words">{escala.observacoes}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Modal de Visualização e Download */}
      <Dialog open={!!selectedEscala} onOpenChange={(open) => !open && setSelectedEscala(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
          <div className="sticky top-0 z-10 bg-background border-b p-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Visualização da Escala</h3>
            <div className="flex gap-2">
              <Button
                onClick={handleDownloadPNG}
                disabled={isDownloading}
                variant="outline"
                size="sm"
              >
                <FileImage className="h-4 w-4 mr-2" />
                {isDownloading ? "Gerando..." : "PNG"}
              </Button>
              <Button
                onClick={handleDownloadPDF}
                disabled={isDownloading}
                variant="outline"
                size="sm"
              >
                <FileText className="h-4 w-4 mr-2" />
                {isDownloading ? "Gerando..." : "PDF"}
              </Button>
            </div>
          </div>
          
          {selectedEscala && (
            <div ref={escalaRef} className="p-8 bg-white">
              {/* Header do PDF/PNG */}
              <div className="text-center mb-8">
                <img 
                  src={logoParoquia} 
                  alt="Logo Paróquia" 
                  className="h-20 w-auto mx-auto mb-4"
                />
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  Paróquia Senhor Santo Cristo dos Milagres
                </h1>
                <p className="text-lg text-muted-foreground">Escala Litúrgica</p>
              </div>

              {/* Informações da Escala */}
              <div className="bg-gradient-primary text-primary-foreground rounded-lg p-6 mb-6">
                <div className="flex items-center justify-center gap-4 mb-3">
                  <Calendar className="h-6 w-6" />
                  <h2 className="text-2xl font-bold">
                    {format(parseISO(selectedEscala.data), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </h2>
                </div>
                <div className="text-center text-xl font-semibold">
                  {selectedEscala.horario} • {selectedEscala.comunidade_nome}
                </div>
              </div>

              {/* Participantes */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Participantes Escalados
                </h3>
                <div className="space-y-3">
                  {selectedEscala.participantes.map((p, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col gap-2 p-4 rounded-lg bg-gradient-primary/10 border-2 border-primary/20"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-2xl text-foreground">{p.nome_completo}</span>
                        <span className="text-base px-4 py-2 rounded-full bg-primary text-primary-foreground font-semibold">
                          {p.funcao}
                        </span>
                      </div>
                      {p.funcao_liturgica && (
                        <div className="border-t border-primary/20 pt-2">
                          <span className="text-lg font-bold text-primary">
                            {p.funcao_liturgica}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Observações */}
              {selectedEscala.observacoes && (
                <div className="border-t-2 border-primary/20 pt-4">
                  <h3 className="text-lg font-bold text-primary mb-2">Observações:</h3>
                  <p className="text-base text-muted-foreground leading-relaxed bg-muted/50 p-4 rounded-lg">
                    {selectedEscala.observacoes}
                  </p>
                </div>
              )}

              {/* Footer */}
              <div className="text-center mt-8 pt-6 border-t border-primary/10">
                <p className="text-sm text-muted-foreground">
                  Gerado em {format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="border-t border-primary/10 mt-12 sm:mt-16 py-6 sm:py-8 bg-white/60 backdrop-blur-sm">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-2 sm:mb-3">
            <img 
              src={logoParoquia} 
              alt="Logo Paróquia" 
              className="h-8 sm:h-10 w-auto object-contain opacity-80"
            />
          </div>
          <p className="text-xs sm:text-sm text-foreground font-semibold mb-1">Paróquia Senhor Santo Cristo dos Milagres</p>
          <p className="text-[10px] sm:text-xs text-muted-foreground">Sistema de Escalas Litúrgicas</p>
        </div>
      </footer>
    </div>
  );
};

export default EscalasPublicas;
