-- Migração: unifica a nota de AULA para escala 0..10
-- Rodar no Supabase SQL Editor

-- Remove constraints conhecidas da coluna nota por tipo.
ALTER TABLE public.avaliacoes_atendimento
DROP CONSTRAINT IF EXISTS avaliacoes_atendimento_nota_por_tipo_check;

ALTER TABLE public.avaliacoes_atendimento
DROP CONSTRAINT IF EXISTS avaliacoes_atendimento_nota_check;

-- Reescala histórico de AULA (1..5 -> 0..10).
-- Mapeamento solicitado: 1->2, 2->4, 3->6, 4->8, 5->10.
UPDATE public.avaliacoes_atendimento
SET nota = CASE
    WHEN nota = 1 THEN 2
    WHEN nota = 2 THEN 4
    WHEN nota = 3 THEN 6
    WHEN nota = 4 THEN 8
    WHEN nota = 5 THEN 10
    ELSE LEAST(10, GREATEST(0, nota))
END
WHERE tipo = 'AULA';

-- Mantém SISTEMA/MENTORIA no intervalo esperado.
UPDATE public.avaliacoes_atendimento
SET nota = LEAST(10, GREATEST(0, nota))
WHERE tipo IN ('SISTEMA', 'MENTORIA');

ALTER TABLE public.avaliacoes_atendimento
ADD CONSTRAINT avaliacoes_atendimento_nota_por_tipo_check
CHECK (
    (tipo = 'AULA' AND nota >= 0 AND nota <= 10)
    OR
    (tipo IN ('SISTEMA', 'MENTORIA') AND nota >= 0 AND nota <= 10)
);
