DO $$
DECLARE
    nome_constraint text;
BEGIN
    SELECT c.conname
    INTO nome_constraint
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public'
      AND t.relname = 'avaliacoes_atendimento'
      AND c.contype = 'c'
      AND c.conname <> 'avaliacoes_atendimento_nota_por_tipo_check'
      AND pg_get_constraintdef(c.oid) ILIKE '%nota%';

    IF nome_constraint IS NOT NULL THEN
        EXECUTE format('ALTER TABLE public.avaliacoes_atendimento DROP CONSTRAINT %I', nome_constraint);
    END IF;
END $$;

-- Remove a nova constraint, caso já exista de tentativa anterior.
ALTER TABLE public.avaliacoes_atendimento
DROP CONSTRAINT IF EXISTS avaliacoes_atendimento_nota_por_tipo_check;

-- Normaliza dados antigos para não violar a nova regra.
-- AULA: converte escala legada 0..10 para 1..5.
UPDATE public.avaliacoes_atendimento
SET nota = CASE
    WHEN nota <= 1 THEN 1
    WHEN nota <= 3 THEN 2
    WHEN nota <= 6 THEN 3
    WHEN nota <= 8 THEN 4
    ELSE 5
END
WHERE tipo = 'AULA';

-- SISTEMA/MENTORIA: mantém intervalo esperado 0..10.
UPDATE public.avaliacoes_atendimento
SET nota = LEAST(10, GREATEST(0, nota))
WHERE tipo IN ('SISTEMA', 'MENTORIA');

ALTER TABLE public.avaliacoes_atendimento
ADD CONSTRAINT avaliacoes_atendimento_nota_por_tipo_check
CHECK (
    (tipo = 'AULA' AND nota >= 1 AND nota <= 5)
    OR
    (tipo IN ('SISTEMA', 'MENTORIA') AND nota >= 0 AND nota <= 10)
);