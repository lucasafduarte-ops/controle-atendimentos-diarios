-- Execute este script no Supabase: Project > SQL Editor > New query > Run
--
-- Cria a tabela que guarda os lançamentos (substitui o localStorage como
-- fonte "oficial" dos dados, compartilhada entre computador e celular).

create table if not exists attendance_records (
  month_key text not null,
  day text not null,
  value text not null,
  updated_at timestamptz not null default now(),
  primary key (month_key, day)
);

-- Concede a permissão básica de acesso à tabela para a service_role
-- (usada só no servidor). Sem isso, a API responde 403 mesmo com uma
-- chave válida, porque a tabela não teve nenhuma permissão concedida
-- a nenhuma função (efeito de "Automatically expose new tables"
-- desmarcado na criação do projeto).
grant select, insert, update, delete on attendance_records to service_role;

-- Segurança extra: habilita RLS e cria uma política liberando acesso
-- total apenas para a service_role (usada só no servidor, nunca no
-- navegador). A chave pública (anon key) continua sem nenhum acesso,
-- já que não existe política para ela.
alter table attendance_records enable row level security;

create policy "service role tem acesso total"
on attendance_records
for all
to service_role
using (true)
with check (true);
