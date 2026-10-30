import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

test('migração PostgreSQL aplica isolamento, consentimento, exclusão e limite de memórias', async () => {
  const db = new PGlite();
  try {
    await db.exec(`
      create role anon;
      create role authenticated;
      create schema auth;
      create table auth.users(id uuid primary key);
      create function auth.uid() returns uuid language sql stable as
        'select nullif(current_setting(''request.jwt.claim.sub'',true),'''')::uuid';
      grant usage on schema auth to authenticated;
      grant execute on function auth.uid() to authenticated;
      insert into auth.users values ('11111111-1111-4111-8111-111111111111'),('22222222-2222-4222-8222-222222222222');
    `);
    await db.exec(await readFile(new URL('../supabase/migrations/202610300001_teravs_memories.sql', import.meta.url), 'utf8'));
    await db.exec(`set role authenticated; set request.jwt.claim.sub='11111111-1111-4111-8111-111111111111'`);
    await db.query('insert into public.teravs_memories(user_id,content,consent) values($1,$2,true)', ['11111111-1111-4111-8111-111111111111', 'Prefiro respostas curtas']);
    await assert.rejects(db.query('insert into public.teravs_memories(user_id,content,consent) values($1,$2,true)', ['22222222-2222-4222-8222-222222222222', 'Tentativa inválida']));
    await assert.rejects(db.query('insert into public.teravs_memories(user_id,content,consent) values($1,$2,false)', ['11111111-1111-4111-8111-111111111111', 'Sem consentimento']));
    await db.exec(`set request.jwt.claim.sub='22222222-2222-4222-8222-222222222222'`);
    assert.equal((await db.query('select count(*)::integer as n from public.teravs_memories')).rows[0].n, 0);
    await db.exec('delete from public.teravs_memories');
    await db.exec(`set request.jwt.claim.sub='11111111-1111-4111-8111-111111111111'`);
    assert.equal((await db.query('select count(*)::integer as n from public.teravs_memories')).rows[0].n, 1);
    await db.exec(`insert into public.teravs_memories(user_id,content,consent) select '11111111-1111-4111-8111-111111111111','Memória de teste '||n,true from generate_series(1,99) n`);
    await assert.rejects(db.exec(`insert into public.teravs_memories(user_id,content,consent) values('11111111-1111-4111-8111-111111111111','Excedente',true)`));
    await db.exec('delete from public.teravs_memories');
    assert.equal((await db.query('select count(*)::integer as n from public.teravs_memories')).rows[0].n, 0);
    await db.exec('reset role; set role anon');
    await assert.rejects(db.exec('select * from public.teravs_memories'));
  } finally { await db.close(); }
});
