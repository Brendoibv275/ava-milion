-- Script para rodar no Supabase SQL Editor (Painel > SQL Editor > New query)

-- 1. Cria a tabela admin_users ligada à auth.users
CREATE TABLE public.admin_users (
    id uuid references auth.users not null primary key,
    nome text,
    email text,
    is_approved boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Configura RLS para admin_users
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins podem ver e editar todos os admin_users"
  ON public.admin_users
  FOR ALL
  USING (auth.role() = 'authenticated'); -- Simplificação: quem tá autenticado no Supabase pode ler/editar. O middleware protegerá a rota.

-- 3. Função para inserir automaticamento o novo admin pendente
CREATE OR REPLACE FUNCTION public.handle_new_admin_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.admin_users (id, email, nome, is_approved)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'nome',
    false -- Começa como false (Pendente)
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Trigger que escuta o auth.users e aciona a função
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_admin_user();

-- IMPORTANTE: Para o primeiro admin já existente, você precisará aprovar manualmente ou rodar este comando:
-- UPDATE public.admin_users SET is_approved = true WHERE email = 'seu_email_admin@exemplo.com';
-- (Se você já criou os usuários ANTES de criar essa tabela, eles não estarão nela automaticamente. É preciso inseri-los).
