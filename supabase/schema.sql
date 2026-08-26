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

-- Segurança extra: habilita RLS e não cria nenhuma política.
-- Isso bloqueia qualquer acesso via chave pública (anon key); só a
-- service_role key (usada apenas no servidor, nunca no navegador)
-- consegue ler ou escrever nesta tabela.
alter table attendance_records enable row level security;
