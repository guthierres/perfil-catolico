-- Criar tabela para funções litúrgicas
CREATE TABLE public.funcoes_liturgicas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.funcoes_liturgicas ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Qualquer um pode ver funções litúrgicas"
ON public.funcoes_liturgicas
FOR SELECT
USING (true);

CREATE POLICY "Apenas admins podem gerenciar funções litúrgicas"
ON public.funcoes_liturgicas
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- Adicionar coluna funcao_liturgica_id na tabela escala_participantes
ALTER TABLE public.escala_participantes
ADD COLUMN funcao_liturgica_id UUID REFERENCES public.funcoes_liturgicas(id);

-- Inserir funções litúrgicas padrão
INSERT INTO public.funcoes_liturgicas (nome) VALUES
  ('Cruz processional'),
  ('Ceroferários'),
  ('Turíferario'),
  ('Naveteiro'),
  ('Missal (Librifero)'),
  ('Lavabo'),
  ('Sino'),
  ('Galhetas'),
  ('Cálice'),
  ('Microfone'),
  ('Acólito Mor');