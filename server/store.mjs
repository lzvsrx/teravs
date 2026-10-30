import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

export async function openStore({ databaseUrl = process.env.DATABASE_URL, filename = process.env.TERAVS_DB || 'data/teravs.sqlite' } = {}) {
  let query, close;
  if (databaseUrl) {
    const { Pool } = await import('pg');
    const pool = new Pool({ connectionString: databaseUrl, max: 5 });
    query = async (sql, params = []) => (await pool.query(sql, params)).rows;
    close = () => pool.end();
  } else {
    const { DatabaseSync } = await import('node:sqlite');
    if (filename !== ':memory:') mkdirSync(dirname(filename), { recursive: true });
    const db = new DatabaseSync(filename);
    db.exec('PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;');
    query = async (sql, params = []) => {
      const ordered = [];
      const statement = db.prepare(sql.replace(/\$(\d+)/g, (_, n) => { ordered.push(params[Number(n) - 1]); return '?'; }));
      return /^\s*(SELECT|WITH)/i.test(sql) ? statement.all(...ordered) : (statement.run(...ordered), []);
    };
    close = () => db.close();
  }
  await query(`CREATE TABLE IF NOT EXISTS memories (
    id TEXT PRIMARY KEY, owner TEXT NOT NULL, content TEXT NOT NULL, created_at TEXT NOT NULL
  )`);
  await query('CREATE INDEX IF NOT EXISTS memories_owner ON memories(owner)');
  return {
    kind: databaseUrl ? 'postgres' : 'sqlite',
    list: owner => query('SELECT id, content, created_at FROM memories WHERE owner=$1 ORDER BY created_at DESC LIMIT 100', [owner]),
    async add(owner, content) {
      // Only explicitly saved statements become long-term memory.
      const id = crypto.randomUUID();
      await query('INSERT INTO memories(id,owner,content,created_at) VALUES($1,$2,$3,$4)', [id, owner, content, new Date().toISOString()]);
      return id;
    },
    remove: (owner, id) => query('DELETE FROM memories WHERE owner=$1 AND id=$2', [owner, id]),
    clear: owner => query('DELETE FROM memories WHERE owner=$1', [owner]),
    close
  };
}
