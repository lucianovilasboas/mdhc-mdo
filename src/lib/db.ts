import Database from "better-sqlite3"
import { drizzle } from "drizzle-orm/better-sqlite3"
import * as schema from "@/db/schema"
import path from "path"
import fs from "fs"

const dbDir = path.resolve(process.cwd(), "data")
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true })

const sqlite = new Database(path.join(dbDir, "dashboard.db"))
sqlite.pragma("journal_mode = WAL")
sqlite.pragma("foreign_keys = ON")

export const db = drizzle(sqlite, { schema })
