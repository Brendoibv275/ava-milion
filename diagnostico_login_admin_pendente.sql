-- Diagnostico e correção para usuários que falham no login admin.
-- Uso:
-- 1) Substitua <EMAIL_DO_USUARIO> pelo email real.
-- 2) Execute os blocos na ordem.

-- 1) Estado no Auth (confirmacao e metadados)
select
  id,
  email,
  email_confirmed_at,
  created_at,
  raw_user_meta_data
from auth.users
where email = '<EMAIL_DO_USUARIO>';

-- 2) Estado no admin_users (vinculo e aprovacao)
select
  id,
  email,
  nome,
  is_approved,
  created_at
from public.admin_users
where email = '<EMAIL_DO_USUARIO>';

-- 3) Usuarios do Auth sem vinculo em admin_users
select
  u.id,
  u.email,
  u.created_at
from auth.users u
left join public.admin_users a on a.id = u.id
where a.id is null
order by u.created_at desc;

-- 4) Correção opcional: criar vinculo pendente quando faltar admin_users
insert into public.admin_users (id, email, nome, is_approved)
select
  u.id,
  u.email,
  coalesce(u.raw_user_meta_data->>'nome', split_part(u.email, '@', 1)),
  false
from auth.users u
left join public.admin_users a on a.id = u.id
where u.email = '<EMAIL_DO_USUARIO>'
  and a.id is null;

-- 5) Opcional: listar usuarios sem confirmacao de email
select
  id,
  email,
  email_confirmed_at,
  created_at
from auth.users
where email_confirmed_at is null
order by created_at desc;
