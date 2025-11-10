-- Adicionar colunas para rastrear última alteração nas escalas
ALTER TABLE public.escalas 
ADD COLUMN updated_by uuid REFERENCES auth.users(id),
ADD COLUMN updated_at timestamp with time zone DEFAULT now();

-- Criar trigger para atualizar automaticamente o campo updated_at
CREATE OR REPLACE FUNCTION public.update_escalas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_escalas_updated_at
BEFORE UPDATE ON public.escalas
FOR EACH ROW
EXECUTE FUNCTION public.update_escalas_updated_at();

-- Inicializar os campos para registros existentes
UPDATE public.escalas 
SET updated_by = created_by, 
    updated_at = created_at 
WHERE updated_by IS NULL;