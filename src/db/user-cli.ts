import crypto from "crypto"
import bcrypt from "bcryptjs"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { users } from "@/db/schema"

const [cmd, ...args] = process.argv.slice(2)

function help() {
  console.log(`
Uso: npx tsx src/db/user-cli.ts <comando> [opcoes]

Comandos:
  list                                     Lista todos usuarios
  add <email> --name <nome> --password <pwd> [--role admin|user] [--project-id <id>|null]
  update <email> [--name <nome>] [--role admin|user] [--project-id <id>|null]
  delete <email>                           Remove usuario (com confirmacao)
  reset-pwd <email> [--password <pwd>]     Gera nova senha se omitida

Exemplos:
  npx tsx src/db/user-cli.ts list
  npx tsx src/db/user-cli.ts add suzi@ufms.br --name "Suzi Miziara" --password Segur@123 --role user --project-id 6
  npx tsx src/db/user-cli.ts update suzi@ufms.br --role admin
  npx tsx src/db/user-cli.ts reset-pwd suzi@ufms.br
  npx tsx src/db/user-cli.ts delete suzi@ufms.br
`)
  process.exit(0)
}

function getArg(key: string): string | undefined {
  const i = args.indexOf(`--${key}`)
  if (i === -1 || i + 1 >= args.length) return undefined
  return args[i + 1]
}

function hasFlag(key: string): boolean {
  return args.includes(`--${key}`)
}

if (!cmd || cmd === "--help" || cmd === "-h") help()

async function main() {
  const hash = (pwd: string) => bcrypt.hash(pwd, 10)

  if (cmd === "list") {
    const rows = db.select().from(users).all()
    if (rows.length === 0) {
      console.log("Nenhum usuario cadastrado.")
      return
    }
    console.log("ID | Nome | Email | Funcao | Projeto")
    console.log("-".repeat(70))
    for (const u of rows) {
      console.log(`${u.id} | ${u.name} | ${u.email} | ${u.role} | ${u.projectId ?? "-"}`)
    }
    return
  }

  if (cmd === "add") {
    const email = args[0]
    if (!email) { console.error("Erro: informe o email."); process.exit(1) }
    const name = getArg("name")
    const password = getArg("password")
    if (!name) { console.error("Erro: --name obrigatorio."); process.exit(1) }
    if (!password) { console.error("Erro: --password obrigatorio."); process.exit(1) }
    const role = getArg("role") || "user"
    const projectRaw = getArg("project-id")
    const projectId = projectRaw === "null" ? null : projectRaw ?? null

    const existing = db.select().from(users).where(eq(users.email, email)).all()
    if (existing.length > 0) {
      console.error("Erro: email ja cadastrado."); process.exit(1)
    }

    const id = String(Date.now())
    const passwordHash = await hash(password)
    db.insert(users).values({ id, name, email, passwordHash, role, projectId }).run()
    console.log(`Usuario ${name} (${email}) criado — role: ${role}${projectId ? `, projeto: ${projectId}` : ""}`)
    return
  }

  if (cmd === "update") {
    const email = args[0]
    if (!email) { console.error("Erro: informe o email."); process.exit(1) }
    const existing = db.select().from(users).where(eq(users.email, email)).all()
    if (existing.length === 0) { console.error("Erro: usuario nao encontrado."); process.exit(1) }

    const fields: Record<string, string | null> = {}
    const name = getArg("name")
    const role = getArg("role")
    const password = getArg("password")
    const projectRaw = getArg("project-id")

    if (name) fields.name = name
    if (role) fields.role = role
    if (password) fields.passwordHash = await hash(password)
    if (hasFlag("project-id")) fields.projectId = projectRaw === "null" ? null : projectRaw ?? null

    if (Object.keys(fields).length === 0) {
      console.log("Nada para atualizar. Use --name, --role, --password ou --project-id.")
      return
    }

    db.update(users).set(fields).where(eq(users.email, email)).run()
    console.log(`Usuario ${email} atualizado.`)
    return
  }

  if (cmd === "reset-pwd") {
    const email = args[0]
    if (!email) { console.error("Erro: informe o email."); process.exit(1) }
    const existing = db.select().from(users).where(eq(users.email, email)).all()
    if (existing.length === 0) { console.error("Erro: usuario nao encontrado."); process.exit(1) }

    let password = getArg("password")
    if (!password) {
      password = crypto.randomBytes(12).toString("base64url").slice(0, 16)
    }
    const passwordHash = await hash(password)
    db.update(users).set({ passwordHash }).where(eq(users.email, email)).run()
    console.log(`Senha de ${email} alterada.`)
    console.log(`Nova senha: ${password}`)
    return
  }

  if (cmd === "delete") {
    const email = args[0]
    if (!email) { console.error("Erro: informe o email."); process.exit(1) }
    const existing = db.select().from(users).where(eq(users.email, email)).all()
    if (existing.length === 0) { console.error("Erro: usuario nao encontrado."); process.exit(1) }
    console.log(`Remover ${existing[0].name} (${email})? [s/N]`)
    const ok = await new Promise<string>((r) => {
      process.stdin.once("data", (d) => r(d.toString().trim().toLowerCase()))
    })
    if (ok !== "s") { console.log("Cancelado."); return }
    db.delete(users).where(eq(users.email, email)).run()
    console.log(`Usuario ${email} removido.`)
    return
  }

  console.error(`Comando desconhecido: ${cmd}`)
  help()
}

main().catch(console.error)
