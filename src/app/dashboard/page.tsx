import { Separator } from "@/components/ui/separator"
import { KpiCards } from "@/components/dashboard/KpiCards"
import { SubmissionsChart } from "@/components/dashboard/SubmissionsChart"
import { CityDistribution } from "@/components/dashboard/CityDistribution"
import { CityMap } from "@/components/dashboard/CityMap"
import { ElderlyProfileSection } from "@/components/dashboard/ElderlyProfileSection"
import { RightsIndicators } from "@/components/dashboard/RightsIndicators"
import { CityRightsIndicators } from "@/components/dashboard/CityRightsIndicators"
import { AgentPerformance } from "@/components/dashboard/AgentPerformance"
import { ProjectTable } from "@/components/dashboard/ProjectTable"

import {
  getKPIs, getSubmissionsTimeline, getCityStats,
  getAgentRanking, getDemographics, getRightsIndicators,
  getRightsIndicatorsByCity,
} from "@/lib/stats"
import { PROJECT_CITIES, ACTIVE_PROJECTS } from "@/lib/odk"
import { auth } from "@/lib/auth"

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ projeto?: string }>
}) {
  const session = await auth()
  const { projeto } = await searchParams

  const restrictedProjectId = session?.user?.role !== "admin"
    ? Number(session?.user?.projectId)
    : undefined
  const selectedProjectId = restrictedProjectId || (projeto ? Number(projeto) : undefined)

  const [kpis, timeline, cityStats, agentRanking, demographics, rightsIndicators, rightsByCity] =
    await Promise.all([
      getKPIs(selectedProjectId).catch(() => null),
      getSubmissionsTimeline(selectedProjectId).catch(() => []),
      getCityStats(selectedProjectId).catch(() => []),
      getAgentRanking(selectedProjectId).catch(() => []),
      getDemographics(selectedProjectId).catch(() => null),
      getRightsIndicators(selectedProjectId).catch(() => []),
      getRightsIndicatorsByCity(selectedProjectId).catch(() => []),
    ])

  const projects = selectedProjectId
    ? ACTIVE_PROJECTS.filter((p) => p.id === selectedProjectId)
    : [...ACTIVE_PROJECTS]

  const projectRows = projects.map((p) => {
    const cities = PROJECT_CITIES[p.id]?.map((c) => c.city).join(", ") || ""
    const ufs = [...new Set(PROJECT_CITIES[p.id]?.map((c) => c.uf) || [])].join("/")
    return {
      id: p.id,
      name: p.name,
      cities,
      uf: ufs || p.uf,
      status: (p.id === 5 || p.id === 6 ? "ativo" : "implantacao") as "ativo" | "implantacao",
      submissions: kpis?.perProject?.[p.id]?.submissions ?? 0,
      agents: kpis?.perProject?.[p.id]?.agents ?? 0,
    }
  })

  const ufsCount = new Set(projects.flatMap((p) =>
    PROJECT_CITIES[p.id]?.map((c) => c.uf) || []
  )).size

  const selectedProject = selectedProjectId
    ? ACTIVE_PROJECTS.find((p) => p.id === selectedProjectId)
    : undefined

  return (
    <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {selectedProject && (
          <p className="text-sm text-muted-foreground">
            Exibindo dados de <strong>{selectedProject.name}</strong>
          </p>
        )}

        {kpis && (
          <KpiCards
            totalIdosos={kpis.totalIdosos}
            totalAgents={kpis.totalAgents}
            totalProjects={kpis.totalProjects}
            totalCities={kpis.totalCities}
            totalUfs={ufsCount}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {timeline.length > 0 && <SubmissionsChart data={timeline} />}
          {cityStats.length > 0 && <CityDistribution data={cityStats} />}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {cityStats.length > 0 && <CityMap data={cityStats} />}
          {agentRanking.length > 0 && <AgentPerformance data={agentRanking} />}
        </div>

        {demographics && <ElderlyProfileSection data={demographics} />}

        {rightsIndicators.length > 0 && <RightsIndicators data={rightsIndicators} />}

        {rightsByCity.length > 0 && <CityRightsIndicators data={rightsByCity} />}

        <Separator />

        <ProjectTable data={projectRows} selectedProjectId={selectedProjectId} />
      </main>
  )
}
