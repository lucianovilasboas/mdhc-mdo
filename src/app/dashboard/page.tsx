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
import { fetchActiveProjects } from "@/lib/odk"
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

  const kpis = await getKPIs(selectedProjectId).catch(() => null)

  const [timeline, cityStats, agentRanking, demographics, rightsIndicators, rightsByCity] =
    await Promise.all([
      getSubmissionsTimeline(selectedProjectId).catch(() => []),
      getCityStats(selectedProjectId).catch(() => []),
      getAgentRanking(selectedProjectId).catch(() => []),
      getDemographics(selectedProjectId).catch(() => null),
      getRightsIndicators(selectedProjectId).catch(() => []),
      kpis?.totalParte2
        ? getRightsIndicatorsByCity(selectedProjectId).catch(() => [])
        : [],
    ])

  const projects = await fetchActiveProjects()
  const allProjects = selectedProjectId
    ? projects.filter((p) => p.id === selectedProjectId)
    : projects

  const cityByProject: Record<number, { cities: string; ufs: string }> = {}
  for (const cs of cityStats) {
    if (!cityByProject[cs.projectId]) cityByProject[cs.projectId] = { cities: "", ufs: "" }
  }
  for (const cs of cityStats) {
    const entry = cityByProject[cs.projectId]
    if (entry) {
      if (!entry.cities.includes(cs.city)) entry.cities += (entry.cities ? ", " : "") + cs.city
      if (!entry.ufs.includes(cs.uf)) entry.ufs += (entry.ufs ? "/" : "") + cs.uf
    }
  }

  const projectRows = allProjects.map((p) => {
    const info = cityByProject[p.id]
    return {
      id: p.id,
      name: p.name,
      cities: info?.cities || "",
      uf: info?.ufs || p.uf,
      status: (p.id === 5 || p.id === 6 ? "ativo" : "implantacao") as "ativo" | "implantacao",
      parte1: kpis?.perProject?.[p.id]?.parte1 ?? 0,
      parte2: kpis?.perProject?.[p.id]?.parte2 ?? 0,
      agents: kpis?.perProject?.[p.id]?.agents ?? 0,
      idosos: kpis?.perProject?.[p.id]?.idosos ?? 0,
    }
  })
  projectRows.sort((a, b) => (b.parte1 + b.parte2) - (a.parte1 + a.parte2))

  const ufsCount = new Set(cityStats.map((cs) => cs.uf).filter(Boolean)).size

  const selectedProject = selectedProjectId
    ? projects.find((p) => p.id === selectedProjectId)
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
            totalForms={kpis.totalSubmissions}
            lastSubmission={kpis.lastSubmissionDate}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {timeline.length > 0 && (
            <SubmissionsChart
              data={timeline}
              availableCities={[...new Set(cityStats.map((cs) => cs.city))].sort()}
            />
          )}
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
