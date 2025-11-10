import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

interface FuncaoLiturgica {
  id: string;
  nome: string;
  created_at: string;
}

export function FuncoesLiturgicasTab() {
  const [funcoes, setFuncoes] = useState<FuncaoLiturgica[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [novaFuncao, setNovaFuncao] = useState("");

  useEffect(() => {
    fetchFuncoes();
  }, []);

  const fetchFuncoes = async () => {
    try {
      const { data, error } = await supabase
        .from("funcoes_liturgicas")
        .select("*")
        .order("nome");

      if (error) throw error;
      setFuncoes(data || []);
    } catch (error) {
      console.error("Erro ao carregar funções:", error);
      toast.error("Erro ao carregar funções litúrgicas");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!novaFuncao.trim()) {
      toast.error("Digite o nome da função");
      return;
    }

    try {
      const { error } = await supabase
        .from("funcoes_liturgicas")
        .insert([{ nome: novaFuncao.trim() }]);

      if (error) throw error;

      toast.success("Função litúrgica adicionada");
      setNovaFuncao("");
      setOpen(false);
      fetchFuncoes();
    } catch (error: any) {
      console.error("Erro ao adicionar função:", error);
      if (error.code === "23505") {
        toast.error("Esta função já existe");
      } else {
        toast.error("Erro ao adicionar função litúrgica");
      }
    }
  };

  const handleDelete = async (id: string, nome: string) => {
    if (!confirm(`Deseja excluir a função "${nome}"?`)) return;

    try {
      const { error } = await supabase
        .from("funcoes_liturgicas")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Função litúrgica excluída");
      fetchFuncoes();
    } catch (error) {
      console.error("Erro ao excluir função:", error);
      toast.error("Erro ao excluir função litúrgica");
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Carregando...</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Funções Litúrgicas</CardTitle>
          <CardDescription>
            Gerencie as funções que podem ser atribuídas aos participantes das escalas
          </CardDescription>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nova Função
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Função Litúrgica</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome da Função</Label>
                <Input
                  id="nome"
                  value={novaFuncao}
                  onChange={(e) => setNovaFuncao(e.target.value)}
                  placeholder="Ex: Cruz processional"
                />
              </div>
              <Button onClick={handleAdd} className="w-full">
                Adicionar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {funcoes.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Nenhuma função cadastrada
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Função</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {funcoes.map((funcao) => (
                <TableRow key={funcao.id}>
                  <TableCell className="font-medium">{funcao.nome}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(funcao.id, funcao.nome)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
