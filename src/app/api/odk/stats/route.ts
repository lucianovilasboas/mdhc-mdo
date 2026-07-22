import { NextRequest, NextResponse } from "next/server"
import {
  getKPIs, getSubmissionsTimeline, getCityStats,
  getAgentRanking, getDemographics, getRightsIndicators,
} from "@/lib/stats"

export async function GET(req: NextRequest) {
  const view = req.nextUrl.searchParams.get("view") || "overview"

  try {
    switch (view) {
      case "overview": {
        const kpis = await getKPIs()
        return NextResponse.json(kpis)
      }
      case "timeline": {
        const data = await getSubmissionsTimeline()
        return NextResponse.json(data)
      }
      case "by-city": {
        const data = await getCityStats()
        return NextResponse.json(data)
      }
      case "by-agent": {
        const data = await getAgentRanking()
        return NextResponse.json(data)
      }
      case "demographics": {
        const data = await getDemographics()
        return NextResponse.json(data)
      }
      case "rights": {
        const data = await getRightsIndicators()
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
