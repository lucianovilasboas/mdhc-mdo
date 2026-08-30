"use client"

import { KpiCards } from "@/components/dashboard/KpiCards"
import { SubmissionsChart } from "@/components/dashboard/SubmissionsChart"
import { CityDistribution } from "@/components/dashboard/CityDistribution"
import { CityMap } from "@/components/dashboard/CityMap"
import { LoadingCard, KpiCardsSkeleton } from "@/components/dashboard/LoadingCard"
import { useOdkData } from "@/components/dashboard/useOdkData"
import type { CityStat, TimelinePoint, KpiOverview } from "@/types"

function KpiCardsWidget({ projectId }: { projectId?: number }) {
  const overview = useOdkData<KpiOverview>("overview", projectId)
  const byCity = useOdkData<CityStat[]>("by-city", projectId)

  if (overview.loading && !overview.data) return <KpiCardsSkeleton />
  if (!overview.data) return null

  const k = overview.data
  const ufsCount = new Set((byCity.data ?? []).map((c) => c.uf).filter(Boolean)).size

  return (
    <KpiCards
      totalIdosos={k.totalIdosos}
      totalAgents={k.totalAgents}
      totalProjects={k.totalProjects}
      totalCities={k.totalCities}
      totalUfs={ufsCount}
      totalForms={k.totalSubmissions}
      lastSubmission={k.lastSubmissionDate}
    />
  )
}

function SubmissionsWidget({ projectId }: { projectId?: number }) {
  const timeline = useOdkData<TimelinePoint[]>("timeline", projectId)
  const byCity = useOdkData<CityStat[]>("by-city", projectId)

  if (timeline.loading && !timeline.data) return <LoadingCard label="Carregando evolução das submissões..." />
  const data = timeline.data ?? []
  if (data.length === 0) return null

  const availableCities = [...new Set((byCity.data ?? []).map((c) => c.city))].sort()
  return <SubmissionsChart data={data} availableCities={availableCities} />
}

function CityDistributionWidget({ projectId }: { projectId?: number }) {
  const byCity = useOdkData<CityStat[]>("by-city", projectId)

  if (byCity.loading && !byCity.data) return <LoadingCard label="Carregando municípios..." />
  const data = byCity.data ?? []
  if (data.length === 0) return null
  return <CityDistribution data={data} />
}

function CityMapWidget({ projectId }: { projectId?: number }) {
  const byCity = useOdkData<CityStat[]>("by-city", projectId)

  if (byCity.loading && !byCity.data) return <LoadingCard label="Carregando mapa..." height={400} />
  const data = byCity.data ?? []
  if (data.length === 0) return null
  return <CityMap data={data} />
}

export function OverviewTab({ projectId }: { projectId?: number }) {
  return (
    <div className="space-y-6">
      <KpiCardsWidget projectId={projectId} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SubmissionsWidget projectId={projectId} />
        <CityDistributionWidget projectId={projectId} />
      </div>
      <CityMapWidget projectId={projectId} />
    </div>
  )
}
