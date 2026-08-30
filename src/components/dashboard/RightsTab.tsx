"use client"

import { RightsIndicators } from "@/components/dashboard/RightsIndicators"
import { MultiSelectIndicators } from "@/components/dashboard/MultiSelectIndicators"
import { CityRightsIndicators } from "@/components/dashboard/CityRightsIndicators"
import { LoadingCard, ErrorCard } from "@/components/dashboard/LoadingCard"
import { useOdkData } from "@/components/dashboard/useOdkData"
import type { RightsIndicator, MultiSelectIndicator, CityMultiSelectEntry, CityRightsEntry } from "@/types"

function RightsIndicatorsWidget({ projectId }: { projectId?: number }) {
  const rights = useOdkData<RightsIndicator[]>("rights", projectId)

  if (rights.error && !rights.data) {
    return <ErrorCard message={rights.error} onRetry={rights.recarregar} label="Não foi possível carregar as violações de direitos" />
  }
  if (rights.loading && !rights.data) return <LoadingCard label="Carregando violações de direitos..." />
  const data = rights.data ?? []
  if (data.length === 0) return null
  return <RightsIndicators data={data} />
}

function MultiSelectWidget({ projectId }: { projectId?: number }) {
  const multi = useOdkData<MultiSelectIndicator[]>("multi-select", projectId)

  if (multi.error && !multi.data) {
    return <ErrorCard message={multi.error} onRetry={multi.recarregar} label="Não foi possível carregar os tipos/desdobramentos" />
  }
  if (multi.loading && !multi.data) return <LoadingCard label="Carregando tipos/desdobramentos..." />
  const data = multi.data ?? []
  if (data.length === 0) return null
  return <MultiSelectIndicators data={data} />
}

function CityRightsWidget({ projectId }: { projectId?: number }) {
  const byCity = useOdkData<CityRightsEntry[]>("rights-by-city", projectId)
  const multiByCity = useOdkData<CityMultiSelectEntry[]>("multi-select-by-city", projectId)

  if (byCity.error && !byCity.data) {
    return <ErrorCard message={byCity.error} onRetry={byCity.recarregar} label="Não foi possível carregar as violações por município" height={400} />
  }
  if (byCity.loading && !byCity.data) return <LoadingCard label="Carregando violações por município..." height={400} />
  const data = byCity.data ?? []
  if (data.length === 0) return null
  return <CityRightsIndicators data={data} multiSelect={multiByCity.data ?? []} />
}

export function RightsTab({ projectId }: { projectId?: number }) {
  return (
    <div className="space-y-6">
      <RightsIndicatorsWidget projectId={projectId} />
      <MultiSelectWidget projectId={projectId} />
      <CityRightsWidget projectId={projectId} />
    </div>
  )
}
