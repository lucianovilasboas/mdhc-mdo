import { NextResponse } from "next/server"
import { fetchActiveProjects } from "@/lib/odk"
import { getRequestScope } from "@/lib/scope"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const scope = await getRequestScope()
    if (!scope.userId) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }
    const projects = await fetchActiveProjects()
    const allowed = scope.restricted
      ? projects.filter((p) => p.id === scope.projectId)
      : projects
    return NextResponse.json(allowed)
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro desconhecido"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
