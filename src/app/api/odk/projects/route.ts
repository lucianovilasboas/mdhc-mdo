import { NextResponse } from "next/server"
import { fetchActiveProjects } from "@/lib/odk"

export async function GET() {
  try {
    const projects = await fetchActiveProjects()
    return NextResponse.json(projects)
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro desconhecido"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
