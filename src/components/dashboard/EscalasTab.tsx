import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Pessoa {
  id: string;
  nome_completo: string;
  funcao: string;
}

interface FuncaoLiturgica {
  id: string;
  nome: string;
}

interface ParticipanteComFuncao {
  pessoaId: string;
  funcaoLiturgicaId: string | null;
}

const EscalasTab = () => {
  const [comunidades, setComunidades] = useState<any[]>([]);
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [funcoesLiturgicas, setFuncoesLiturgicas] = useState<FuncaoLiturgica[]>([]);
  const [selectedComunidade, setSelectedComunidade] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedHorario, setSelectedHorario] = useState<string>("08:00");
  const [participantes, setParticipantes] = useState<ParticipanteComFuncao[]>([]);
  const [observacoes, setObservacoes] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [comunidadesData, pessoasData, funcoesData] = await Promise.all([
        supabase.from("comunidades").select("*").order("nome"),
        supabase.from("pessoas").select("*").eq("ativo", true).order("nome_completo"),
        supabase.from("funcoes_liturgicas").select("*").order("nome")
      ]);
      
      setComunidades(comunidadesData.data || []);
      setPessoas(pessoasData.data || []);
      setFuncoesLiturgicas(funcoesData.data || []);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar dados");
    }
  };

  const handleSaveEscala = async () => {
    if (!selectedComunidade || !selectedDate || participantes.length === 0) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data: escala, error: escalaError } = await supabase
        .from("escalas")
        .insert({
          data: format(selectedDate, "yyyy-MM-dd"),
          horario: selectedHorario,
          comunidade_id: selectedComunidade,
          observacoes: observacoes || null,
          created_by: user?.id,
          updated_by: user?.id,
        })
        .select()
        .single();

      if (escalaError) throw escalaError;

      const participantesData = participantes.map((p) => ({
        escala_id: escala.id,
        pessoa_id: p.pessoaId,
        funcao_liturgica_id: p.funcaoLiturgicaId
      }));

      const { error: participantesError } = await supabase
        .from("escala_participantes")
        .insert(participantesData);

      if (participantesError) throw participantesError;

      toast.success("Escala criada com sucesso!");
      setParticipantes([]);
      setObservacoes("");
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar escala");
    }
  };

  const toggleParticipante = (pessoaId: string) => {
    setParticipantes(prev => {
      const exists = prev.find(p => p.pessoaId === pessoaId);
      if (exists) {
        return prev.filter(p => p.pessoaId !== pessoaId);
      } else {
        return [...prev, { pessoaId, funcaoLiturgicaId: null }];
      }
    });
  };

  const updateFuncaoLiturgica = (pessoaId: string, funcaoId: string | null) => {
    setParticipantes(prev => 
      prev.map(p => p.pessoaId === pessoaId ? { ...p, funcaoLiturgicaId: funcaoId } : p)
    );
  };

  const isPessoaSelecionada = (pessoaId: string) => {
    return participantes.some(p => p.pessoaId === pessoaId);
  };

  const getFuncaoLiturgica = (pessoaId: string) => {
    return participantes.find(p => p.pessoaId === pessoaId)?.funcaoLiturgicaId || null;
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Nova Escala</CardTitle>
          <CardDescription>Crie uma nova escala de serviço</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Comunidade *</label>
            <Select value={selectedComunidade} onValueChange={setSelectedComunidade}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma comunidade" />
              </SelectTrigger>
              <SelectContent>
                {comunidades.map((com) => (
                  <SelectItem key={com.id} value={com.id}>
                    {com.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Data *</label>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              locale={ptBR}
              className="rounded-md border"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Horário *</label>
            <Select value={selectedHorario} onValueChange={setSelectedHorario}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="08:00">08:00</SelectItem>
                <SelectItem value="10:00">10:00</SelectItem>
                <SelectItem value="19:30">19:30</SelectItem>
                <SelectItem value="20:00">20:00</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pessoas Escaladas ({participantes.length})</CardTitle>
          <CardDescription>Selecione quem vai servir e atribua funções</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ScrollArea className="h-[450px] pr-4">
            <div className="space-y-3">
              {pessoas.map((pessoa) => {
                const selecionada = isPessoaSelecionada(pessoa.id);
                const funcaoAtual = getFuncaoLiturgica(pessoa.id);
                
                return (
                  <div key={pessoa.id} className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={pessoa.id}
                        checked={selecionada}
                        onCheckedChange={() => toggleParticipante(pessoa.id)}
                      />
                      <Label
                        htmlFor={pessoa.id}
                        className="text-sm font-medium leading-none cursor-pointer flex-1"
                      >
                        {pessoa.nome_completo} <span className="text-muted-foreground text-xs">({pessoa.funcao})</span>
                      </Label>
                    </div>
                    
                    {selecionada && (
                      <div className="ml-6 pl-4 border-l-2 border-primary/30 space-y-1">
                        <Label htmlFor={`funcao-${pessoa.id}`} className="text-xs text-muted-foreground">
                          Função Litúrgica
                        </Label>
                        <Select
                          value={funcaoAtual || ""}
                          onValueChange={(value) => updateFuncaoLiturgica(pessoa.id, value || null)}
                        >
                          <SelectTrigger id={`funcao-${pessoa.id}`} className="h-9 text-sm">
                            <SelectValue placeholder="Selecione uma função" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Nenhuma função específica</SelectItem>
                            {funcoesLiturgicas.map((funcao) => (
                              <SelectItem key={funcao.id} value={funcao.id}>
                                {funcao.nome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    
                    <Separator />
                  </div>
                );
              })}
            </div>
          </ScrollArea>

          <div className="space-y-2">
            <label className="text-sm font-medium">Observações</label>
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              className="w-full min-h-20 px-3 py-2 text-sm border rounded-md"
              placeholder="Ex: chegar 30 min antes"
            />
          </div>

          <Button onClick={handleSaveEscala} className="w-full">
            Salvar Escala
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default EscalasTab;
