"use client"

import { AgentPerformance } from "@/components/dashboard/AgentPerformance"
import { ProjectTable } from "@/components/dashboard/ProjectTable"
import { LoadingCard } from "@/components/dashboard/LoadingCard"
import { useOdkData, useAsync } from "@/components/dashboard/useOdkData"
import type { AgentStat, CityStat, KpiOverview } from "@/types"
import type { ActiveProject } from "@/lib/odk"

function AgentPerformanceWidget({ projectId }: { projectId?: number }) {
  const agents = useOdkData<AgentStat[]>("by-agent", projectId)

  if (agents.loading && !agents.data) return <LoadingCard label="Carregando desempenho dos agentes..." />
  const data = agents.data ?? []
  if (data.length === 0) return null
  return <AgentPerformance data={data} />
}

function ProjectTableWidget({ projectId }: { projectId?: number }) {
  const overview = useOdkData<KpiOverview>("overview", projectId)
  const byCity = useOdkData<CityStat[]>("by-city", projectId)
  const projects = useAsync<ActiveProject[]>("/api/odk/projects")

  if (overview.loading && !overview.data) return <LoadingCard label="Carregando projetos..." />

  const all = projects.data ?? []
  const allProjects = projectId ? all.filter((p) => p.id === projectId) : all
  if (allProjects.length === 0) return null

  const cityByProject: Record<number, { cities: string; ufs: string }> = {}
  for (const cs of byCity.data ?? []) {
    const entry = cityByProject[cs.projectId] || (cityByProject[cs.projectId] = { cities: "", ufs: "" })
    if (!entry.cities.includes(cs.city)) entry.cities += (entry.cities ? ", " : "") + cs.city
    if (!entry.ufs.includes(cs.uf)) entry.ufs += (entry.ufs ? "/" : "") + cs.uf
  }

  const rows = allProjects.map((p) => {
    const info = cityByProject[p.id]
    const parte1 = overview.data?.perProject?.[p.id]?.parte1 ?? 0
    const parte2 = overview.data?.perProject?.[p.id]?.parte2 ?? 0
    return {
      id: p.id,
      name: p.name,
      cities: info?.cities || "",
      uf: info?.ufs || p.uf,
      status: (parte1 + parte2 > 0 ? "ativo" : "implantacao") as "ativo" | "implantacao",
      parte1,
      parte2,
      agents: overview.data?.perProject?.[p.id]?.agents ?? 0,
      idosos: overview.data?.perProject?.[p.id]?.idosos ?? 0,
    }
  })
  rows.sort((a, b) => (b.parte1 + b.parte2) - (a.parte1 + a.parte2))

  return <ProjectTable data={rows} selectedProjectId={projectId} />
}

export function AgentsProjectsTab({ projectId }: { projectId?: number }) {
  return (
    <div className="space-y-6">
      <AgentPerformanceWidget projectId={projectId} />
      <ProjectTableWidget projectId={projectId} />
    </div>
  )
}
