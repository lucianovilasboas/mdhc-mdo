import { NextRequest, NextResponse } from "next/server"
import {
  getKPIs, getSubmissionsTimeline, getCityStats,
  getAgentRanking, getDemographics, getRightsIndicators,
  getMultiSelectIndicators, getRightsIndicatorsByCity,
  getMultiSelectIndicatorsByCity,
} from "@/lib/stats"

export async function GET(req: NextRequest) {
  const view = req.nextUrl.searchParams.get("view") || "overview"
  const projeto = req.nextUrl.searchParams.get("projeto")
  const projectId = projeto ? Number(projeto) : undefined

  try {
    switch (view) {
      case "overview": {
        const kpis = await getKPIs(projectId)
        return NextResponse.json(kpis)
      }
      case "timeline": {
        const cidade = req.nextUrl.searchParams.get("cidade") || undefined
        const data = await getSubmissionsTimeline(projectId, cidade)
        return NextResponse.json(data)
      }
      case "by-city": {
        const data = await getCityStats(projectId)
        return NextResponse.json(data)
      }
      case "by-agent": {
        const data = await getAgentRanking(projectId)
        return NextResponse.json(data)
      }
      case "demographics": {
        const data = await getDemographics(projectId)
        return NextResponse.json(data)
      }
      case "rights": {
        const data = await getRightsIndicators(projectId)
        return NextResponse.json(data)
      }
      case "rights-by-city": {
        const data = await getRightsIndicatorsByCity(projectId)
        return NextResponse.json(data)
      }
      case "multi-select": {
        const data = await getMultiSelectIndicators(projectId)
        return NextResponse.json(data)
      }
      case "multi-select-by-city": {
        const data = await getMultiSelectIndicatorsByCity(projectId)
        return NextResponse.json(data)
      }
      default:
        return NextResponse.json({ error: "view inválida" }, { status: 400 })
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro desconhecido"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
