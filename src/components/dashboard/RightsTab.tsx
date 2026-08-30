"use client"

import { RightsIndicators } from "@/components/dashboard/RightsIndicators"
import { MultiSelectIndicators } from "@/components/dashboard/MultiSelectIndicators"
import { CityRightsIndicators } from "@/components/dashboard/CityRightsIndicators"
import { LoadingCard } from "@/components/dashboard/LoadingCard"
import { useOdkData } from "@/components/dashboard/useOdkData"
import type { RightsIndicator, MultiSelectIndicator, CityMultiSelectEntry, CityRightsEntry } from "@/types"

function RightsIndicatorsWidget({ projectId }: { projectId?: number }) {
  const rights = useOdkData<RightsIndicator[]>("rights", projectId)

  if (rights.loading && !rights.data) return <LoadingCard label="Carregando violações de direitos..." />
  const data = rights.data ?? []
  if (data.length === 0) return null
  return <RightsIndicators data={data} />
}

function MultiSelectWidget({ projectId }: { projectId?: number }) {
  const multi = useOdkData<MultiSelectIndicator[]>("multi-select", projectId)

  if (multi.loading && !multi.data) return <LoadingCard label="Carregando tipos/desdobramentos..." />
  const data = multi.data ?? []
  if (data.length === 0) return null
  return <MultiSelectIndicators data={data} />
}

function CityRightsWidget({ projectId }: { projectId?: number }) {
  const byCity = useOdkData<CityRightsEntry[]>("rights-by-city", projectId)
  const multiByCity = useOdkData<CityMultiSelectEntry[]>("multi-select-by-city", projectId)

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
