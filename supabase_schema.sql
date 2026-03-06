-- Script para rodar no Supabase SQL Editor (Painel > SQL Editor > New query)

-- 1. Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabela de Atendentes
CREATE TABLE public.atendentes (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    nome text NOT NULL,
    email text,
    ativo boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabela de Categorias do Atendente (Many-to-Many)
CREATE TABLE public.atendente_categorias (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    "atendenteId" uuid NOT NULL REFERENCES public.atendentes(id) ON DELETE CASCADE,
    suporte text NOT NULL CHECK (suporte IN ('SISTEMA', 'MENTORIA', 'AULA')),
    UNIQUE ("atendenteId", suporte)
);

-- 4. Tabela de Avaliações
CREATE TABLE public.avaliacoes_atendimento (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    tipo text NOT NULL CHECK (tipo IN ('SISTEMA', 'MENTORIA', 'AULA')),
    "nomeCliente" text NOT NULL,
    "emailCliente" text NOT NULL,
    "motivoContato" text NOT NULL,
    "motivoOutros" text,
    "problemaResolvido" text NOT NULL CHECK ("problemaResolvido" IN ('SIM', 'NAO', 'PARCIALMENTE')),
    "atendenteId" uuid NOT NULL REFERENCES public.atendentes(id) ON DELETE RESTRICT,
    nota integer NOT NULL CHECK (nota >= 0 AND nota <= 10),
    "opiniaoPessoal" text,
    sugestoes jsonb,
    "sugestoesOutros" text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Índices para performance
CREATE INDEX idx_avaliacoes_tipo ON public.avaliacoes_atendimento(tipo);
CREATE INDEX idx_avaliacoes_atendente ON public.avaliacoes_atendimento("atendenteId");
CREATE INDEX idx_avaliacoes_data ON public.avaliacoes_atendimento(created_at);

-- 6. Configuração de Roles e RLS (Row Level Security)
-- Permitir anon (usuários deslogados) INSERIR avaliações e LER atendentes ativos (para preencher o formulário)
ALTER TABLE public.atendentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.atendente_categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avaliacoes_atendimento ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Atendentes visíveis publicamente" ON public.atendentes FOR SELECT USING (ativo = true);
CREATE POLICY "Atendentes admin gerencia tudo" ON public.atendentes USING (auth.role() = 'authenticated');

CREATE POLICY "Categorias visíveis publicamente" ON public.atendente_categorias FOR SELECT USING (true);
CREATE POLICY "Categorias admin gerencia tudo" ON public.atendente_categorias USING (auth.role() = 'authenticated');

CREATE POLICY "Anon pode inserir avaliação" ON public.avaliacoes_atendimento FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admin pode ler/gerenciar avaliações" ON public.avaliacoes_atendimento USING (auth.role() = 'authenticated');

-- Trigger para updated_at automático
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_atendentes_modtime
    BEFORE UPDATE ON public.atendentes
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
