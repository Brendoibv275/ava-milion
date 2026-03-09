ALTER TABLE public.avaliacoes_atendimento
ADD COLUMN IF NOT EXISTS "circleNota" integer;

ALTER TABLE public.avaliacoes_atendimento
ADD COLUMN IF NOT EXISTS "circleSugestoes" text;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'avaliacoes_atendimento_circleNota_check'
    ) THEN
        ALTER TABLE public.avaliacoes_atendimento
        ADD CONSTRAINT avaliacoes_atendimento_circleNota_check
        CHECK ("circleNota" >= 0 AND "circleNota" <= 10);
    END IF;
END $$;
