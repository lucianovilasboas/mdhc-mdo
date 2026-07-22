import Database from "better-sqlite3"
import { drizzle } from "drizzle-orm/better-sqlite3"
import { sql } from "drizzle-orm"
import { sqliteTable, text } from "drizzle-orm/sqlite-core"
import bcrypt from "bcryptjs"
import path from "path"
import fs from "fs"

const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").unique().notNull(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").default("viewer").notNull(),
  projectId: text("project_id"),
  createdAt: text("created_at").default("datetime('now')").notNull(),
})

const dbDir = path.resolve(process.cwd(), "data")
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true })

const sqlite = new Database(path.join(dbDir, "dashboard.db"))
sqlite.pragma("journal_mode = WAL")
sqlite.pragma("foreign_keys = ON")

const db = drizzle(sqlite)

async function seed() {
  db.run(sql`DROP TABLE IF EXISTS users`)
  db.run(sql`CREATE TABLE users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'viewer' NOT NULL,
    project_id TEXT,
    created_at TEXT DEFAULT (datetime('now')) NOT NULL
  )`)

  const hash = await bcrypt.hash("mdhcodk123", 10)

  // Remove old admin user before re-inserting
  db.delete(users).where(sql`id = '1'`).run()

  const usuarios = [
    { id: "1", name: "Luciano", email: "luciano.espiridiao@ifmg.edu.br", role: "admin", projectId: null },
    { id: "2", name: "Carlos Eduardo", email: "carlos.eduardo@mdh.gov.br", role: "admin", projectId: null },
    { id: "3", name: "Daniela Souza", email: "daniela.souza@mdh.gov.br", role: "admin", projectId: null },
    { id: "4", name: "Carolina Leite", email: "carolina.leite@mdh.gov.br", role: "admin", projectId: null },
    { id: "5", name: "Simony Nunes", email: "simony.nunes@mdh.gov.br", role: "admin", projectId: null },
    { id: "6", name: "Thays Pascoal", email: "thays.pascoal@mdh.gov.br", role: "admin", projectId: null },
    { id: "7", name: "Fábio Macedo", email: "fabio.macedo@ifrj.edu.br", role: "admin", projectId: null },
    { id: "8", name: "Suzi Miziara", email: "suzi.barbosa@ufms.br", role: "user", projectId: "6" },
  ]

  for (const u of usuarios) {
    const existing = db
      .select()
      .from(users)
      .where(sql`email = ${u.email}`)
      .all()

    if (existing.length === 0) {
      db.insert(users)
        .values({ id: u.id, name: u.name, email: u.email, passwordHash: hash, role: u.role, projectId: u.projectId })
        .run()
      console.log(`  + ${u.name} (${u.email}) — ${u.role}${u.projectId ? ` — projeto ${u.projectId}` : ""}`)
    } else {
      db.update(users)
        .set({ name: u.name, passwordHash: hash, role: u.role, projectId: u.projectId })
        .where(sql`email = ${u.email}`)
        .run()
      console.log(`  ~ ${u.name} (${u.email}) — atualizado`)
    }
  }

  console.log("\nSeed concluído. Senha inicial: mdhcodk123")
}

seed().catch(console.error)
