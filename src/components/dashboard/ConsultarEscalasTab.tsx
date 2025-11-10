import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { format, parseISO, isBefore, startOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Pencil, Trash2, Eye, Share2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Participante {
  pessoa_id: string;
  funcao_liturgica_id: string | null;
  pessoa?: { nome_completo: string; funcao: string };
  funcao_liturgica?: { nome: string } | null;
}

interface Escala {
  id: string;
  data: string;
  horario: string;
  observacoes: string | null;
  comunidade_id: string;
  updated_by: string | null;
  updated_at: string | null;
  comunidade?: { nome: string };
  participantes?: Participante[];
  updated_by_profile?: { nome_completo: string } | null;
}

interface ParticipanteComFuncao {
  pessoaId: string;
  funcaoLiturgicaId: string | null;
}

const ConsultarEscalasTab = () => {
  const [escalas, setEscalas] = useState<Escala[]>([]);
  const [comunidades, setComunidades] = useState<any[]>([]);
  const [pessoas, setPessoas] = useState<any[]>([]);
  const [funcoesLiturgicas, setFuncoesLiturgicas] = useState<any[]>([]);
  const [selectedComunidade, setSelectedComunidade] = useState<string>("todas");
  const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), "yyyy-MM"));
  const [editingEscala, setEditingEscala] = useState<Escala | null>(null);
  const [participantes, setParticipantes] = useState<ParticipanteComFuncao[]>([]);
  const [observacoes, setObservacoes] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const [showShareDialog, setShowShareDialog] = useState(false);

  useEffect(() => {
    fetchData();
  }, [selectedComunidade, selectedMonth]);

  const fetchData = async () => {
    const [comunidadesData, pessoasData, funcoesData] = await Promise.all([
      supabase.from("comunidades").select("*").order("nome"),
      supabase.from("pessoas").select("*").eq("ativo", true).order("nome_completo"),
      supabase.from("funcoes_liturgicas").select("*").order("nome")
    ]);

    setComunidades(comunidadesData.data || []);
    setPessoas(pessoasData.data || []);
    setFuncoesLiturgicas(funcoesData.data || []);

    let query = supabase
      .from("escalas")
      .select(`
        *,
        comunidade:comunidades(nome),
        participantes:escala_participantes(
          pessoa_id,
          funcao_liturgica_id,
          pessoa:pessoas(nome_completo, funcao),
          funcao_liturgica:funcoes_liturgicas(nome)
        )
      `)
      .gte("data", `${selectedMonth}-01`)
      .lt("data", format(new Date(selectedMonth + "-01").setMonth(new Date(selectedMonth + "-01").getMonth() + 1), "yyyy-MM-dd"))
      .order("data")
      .order("horario");

    if (selectedComunidade !== "todas") {
      query = query.eq("comunidade_id", selectedComunidade);
    }

    const { data, error } = await query;

    if (error) {
      toast.error("Erro ao carregar escalas");
      return;
    }

    const escalasComUsuarios = await Promise.all(
      (data || []).map(async (escala: any) => {
        if (escala.updated_by) {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("nome_completo")
            .eq("id", escala.updated_by)
            .single();
          
          return {
            ...escala,
            updated_by_profile: profileData,
          };
        }
        return escala;
      })
    );

    setEscalas(escalasComUsuarios);
  };

  const canEdit = (data: string) => {
    const escalaDate = parseISO(data);
    const currentMonth = startOfMonth(new Date());
    return !isBefore(escalaDate, currentMonth);
  };

  const handleEdit = (escala: Escala) => {
    if (!canEdit(escala.data)) {
      toast.error("Não é possível editar escalas de meses anteriores");
      return;
    }
    setEditingEscala(escala);
    setParticipantes(
      escala.participantes?.map(p => ({
        pessoaId: p.pessoa_id,
        funcaoLiturgicaId: p.funcao_liturgica_id
      })) || []
    );
    setObservacoes(escala.observacoes || "");
  };

  const handleSaveEdit = async () => {
    if (!editingEscala) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error: escalaError } = await supabase
        .from("escalas")
        .update({ 
          observacoes,
          updated_by: user?.id 
        })
        .eq("id", editingEscala.id);

      if (escalaError) throw escalaError;

      await supabase
        .from("escala_participantes")
        .delete()
        .eq("escala_id", editingEscala.id);

      const participantesData = participantes.map((p) => ({
        escala_id: editingEscala.id,
        pessoa_id: p.pessoaId,
        funcao_liturgica_id: p.funcaoLiturgicaId
      }));

      const { error: participantesError } = await supabase
        .from("escala_participantes")
        .insert(participantesData);

      if (participantesError) throw participantesError;

      toast.success("Escala atualizada com sucesso!");
      setEditingEscala(null);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar escala");
    }
  };

  const handleDelete = async (id: string, data: string) => {
    if (!canEdit(data)) {
      toast.error("Não é possível excluir escalas de meses anteriores");
      return;
    }

    if (!confirm("Tem certeza que deseja excluir esta escala?")) return;

    try {
      await supabase.from("escala_participantes").delete().eq("escala_id", id);
      const { error } = await supabase.from("escalas").delete().eq("id", id);

      if (error) throw error;

      toast.success("Escala excluída com sucesso!");
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Erro ao excluir escala");
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/escalas-publicas`;
    setShareUrl(url);
    setShowShareDialog(true);
    navigator.clipboard.writeText(url);
    toast.success("Link copiado para a área de transferência!");
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Consultar Escalas</span>
            <Button onClick={handleShare} variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Compartilhar Link Público
            </Button>
          </CardTitle>
          <CardDescription>Visualize e edite as escalas criadas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Comunidade</label>
              <Select value={selectedComunidade} onValueChange={setSelectedComunidade}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as Comunidades</SelectItem>
                  {comunidades.map((com) => (
                    <SelectItem key={com.id} value={com.id}>
                      {com.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Mês/Ano</label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-md"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {escalas.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Nenhuma escala encontrada para os filtros selecionados.
            </CardContent>
          </Card>
        ) : (
          escalas.map((escala) => (
            <Card key={escala.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span className="font-semibold">
                        {format(parseISO(escala.data), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </span>
                      <span className="text-muted-foreground">•</span>
                      <span className="font-medium">{escala.horario}</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Comunidade:</span>{" "}
                      <span className="text-muted-foreground">{escala.comunidade?.nome}</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Participantes:</span>{" "}
                      <div className="mt-1 flex flex-wrap gap-2">
                        {escala.participantes?.map((p, idx) => (
                          <div
                            key={idx}
                            className="inline-flex flex-col px-3 py-2 rounded-md bg-secondary text-secondary-foreground border border-secondary-foreground/20"
                          >
                            <span className="font-semibold text-sm">{p.pessoa?.nome_completo}</span>
                            <span className="text-xs text-muted-foreground">{p.pessoa?.funcao}</span>
                            {p.funcao_liturgica && (
                              <span className="text-xs font-medium text-primary mt-1">
                                {p.funcao_liturgica.nome}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    {escala.observacoes && (
                      <div className="text-sm">
                        <span className="font-medium">Observações:</span>{" "}
                        <span className="text-muted-foreground">{escala.observacoes}</span>
                      </div>
                    )}
                    {escala.updated_by_profile && (
                      <div className="text-xs text-muted-foreground mt-2 italic">
                        Última modificação por: {escala.updated_by_profile.nome_completo}
                        {escala.updated_at && ` em ${format(parseISO(escala.updated_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    {canEdit(escala.data) ? (
                      <>
                        <Button variant="outline" size="icon" onClick={() => handleEdit(escala)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDelete(escala.id, escala.data)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <Button variant="outline" size="icon" disabled>
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={!!editingEscala} onOpenChange={(open) => !open && setEditingEscala(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Escala</DialogTitle>
            <DialogDescription>
              {editingEscala && format(parseISO(editingEscala.data), "dd/MM/yyyy", { locale: ptBR })} -{" "}
              {editingEscala?.horario}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Participantes ({participantes.length})</label>
              <ScrollArea className="h-96 border rounded-md p-3">
                <div className="space-y-3">
                  {pessoas.map((pessoa) => {
                    const selecionada = isPessoaSelecionada(pessoa.id);
                    const funcaoAtual = getFuncaoLiturgica(pessoa.id);
                    
                    return (
                      <div key={pessoa.id} className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`edit-${pessoa.id}`}
                            checked={selecionada}
                            onCheckedChange={() => toggleParticipante(pessoa.id)}
                          />
                          <Label
                            htmlFor={`edit-${pessoa.id}`}
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
                              value={funcaoAtual || "none"}
                              onValueChange={(value) => updateFuncaoLiturgica(pessoa.id, value === "none" ? null : value)}
                            >
                              <SelectTrigger id={`funcao-${pessoa.id}`} className="h-8 text-sm">
                                <SelectValue placeholder="Selecione uma função" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">Nenhuma função específica</SelectItem>
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
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Observações</label>
              <textarea
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                className="w-full min-h-20 px-3 py-2 text-sm border rounded-md"
                placeholder="Ex: chegar 30 min antes"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setEditingEscala(null)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveEdit}>Salvar Alterações</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Link Público das Escalas</DialogTitle>
            <DialogDescription>
              Compartilhe este link para que todos possam visualizar as escalas
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="p-3 bg-muted rounded-md break-all text-sm">
              {shareUrl}
            </div>
            <Button onClick={() => {
              navigator.clipboard.writeText(shareUrl);
              toast.success("Link copiado!");
            }} className="w-full">
              Copiar Link
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ConsultarEscalasTab;
