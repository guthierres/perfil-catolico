-- Recriar a view escalas_publicas para incluir funções litúrgicas
DROP VIEW IF EXISTS public.escalas_publicas;

CREATE VIEW public.escalas_publicas AS
SELECT 
  e.id,
  e.data,
  e.horario,
  e.observacoes,
  c.nome AS comunidade_nome,
  COALESCE(
    json_agg(
      json_build_object(
        'nome_completo', p.nome_completo,
        'funcao', p.funcao,
        'funcao_liturgica', fl.nome
      ) ORDER BY p.nome_completo
    ) FILTER (WHERE p.id IS NOT NULL),
    '[]'::json
  ) AS participantes
FROM 
  public.escalas e
  LEFT JOIN public.comunidades c ON e.comunidade_id = c.id
  LEFT JOIN public.escala_participantes ep ON e.id = ep.escala_id
  LEFT JOIN public.pessoas p ON ep.pessoa_id = p.id
  LEFT JOIN public.funcoes_liturgicas fl ON ep.funcao_liturgica_id = fl.id
GROUP BY 
  e.id, e.data, e.horario, e.observacoes, c.nome;