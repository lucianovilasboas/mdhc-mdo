import { queryOData } from "@/lib/odk"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params
  const pid = parseInt(projectId)
  const form = req.nextUrl.searchParams.get("form") || "form_parte_1"
  const top = parseInt(req.nextUrl.searchParams.get("top") || "100")
  const skip = parseInt(req.nextUrl.searchParams.get("skip") || "0")
  const filter = req.nextUrl.searchParams.get("$filter") || undefined

  try {
    const data = await queryOData(pid, form, top, skip, filter)
    return NextResponse.json(data)
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro desconhecido"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
