import Database from "better-sqlite3"
import path from "path"
import fs from "fs"

const dbDir = path.resolve(process.cwd(), "data")
if (!fs.existsSync(dbDir)) {
  console.error("Diretorio de data nao encontrado em", dbDir)
  process.exit(1)
}

const sqlite = new Database(path.join(dbDir, "dashboard.db"))

try {
  sqlite.exec(`ALTER TABLE users ADD COLUMN last_login TEXT`)
  console.log("Migracao concluida: coluna last_login adicionada.")
} catch (err: unknown) {
  const msg = err instanceof Error ? err.message : String(err)
  if (msg.includes("duplicate column") || msg.includes("already exists")) {
    console.log("Coluna last_login ja existe. Nada a fazer.")
  } else {
    console.error("Erro na migracao:", msg)
    process.exit(1)
  }
}

sqlite.close()
