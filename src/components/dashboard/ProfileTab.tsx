"use client"

import { ElderlyProfileSection } from "@/components/dashboard/ElderlyProfileSection"
import { LoadingCard, ErrorCard } from "@/components/dashboard/LoadingCard"
import { useOdkData } from "@/components/dashboard/useOdkData"
import type { DemographicProfile } from "@/types"

export function ProfileTab({ projectId }: { projectId?: number }) {
  const demographics = useOdkData<DemographicProfile>("demographics", projectId)

  if (demographics.error && !demographics.data) {
    return (
      <ErrorCard
        message={demographics.error}
        onRetry={demographics.recarregar}
        label="Não foi possível carregar o perfil das pessoas idosas"
        height={420}
      />
    )
  }
  if (demographics.loading && !demographics.data) {
    return <LoadingCard label="Carregando perfil das pessoas idosas..." height={420} />
  }
  if (!demographics.data) return null

  return <ElderlyProfileSection data={demographics.data} />
}
