const DEBUG = process.env.DEBUG === "true"

export function log(tag: string, msg: string, data?: unknown) {
  if (!DEBUG && tag !== "auth") return
  const ts = new Date().toISOString().slice(11, 19)
  const extra = data ? ` ${JSON.stringify(data)}` : ""
  console.log(`[${ts}][${tag}] ${msg}${extra}`)
}
