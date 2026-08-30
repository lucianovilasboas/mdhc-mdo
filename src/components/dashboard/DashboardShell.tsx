"use client"

import { useSearchParams } from "next/navigation"
import { Tabs } from "@/components/dashboard/Tabs"
import { OverviewTab } from "@/components/dashboard/OverviewTab"
import { AgentsProjectsTab } from "@/components/dashboard/AgentsProjectsTab"
import { ProfileTab } from "@/components/dashboard/ProfileTab"
import { RightsTab } from "@/components/dashboard/RightsTab"
import { useAsync } from "@/components/dashboard/useOdkData"
import type { ActiveProject } from "@/lib/odk"

const TABS = [
  { id: "overview", label: "Visão Geral" },
  { id: "agentes", label: "Agentes & Projetos" },
  { id: "perfil", label: "Formulário 1 — Perfil" },
  { id: "direitos", label: "Formulário 2 — Direitos" },
]

export function DashboardShell({ selectedProjectId }: { selectedProjectId?: number }) {
  const searchParams = useSearchParams()
  const rawTab = searchParams.get("tab") || "overview"
  const tab = TABS.some((t) => t.id === rawTab) ? rawTab : "overview"

  const { data: projects } = useAsync<ActiveProject[]>("/api/odk/projects")
  const selectedProjectName = selectedProjectId
    ? projects?.find((p) => p.id === selectedProjectId)?.name
    : undefined

  const hrefFor = (id: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (id === "overview") params.delete("tab")
    else params.set("tab", id)
    const qs = params.toString()
    return qs ? `/dashboard?${qs}` : "/dashboard"
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {selectedProjectName && (
        <p className="text-sm text-muted-foreground">
          Exibindo dados de <strong>{selectedProjectName}</strong>
        </p>
      )}

      <Tabs items={TABS.map((t) => ({ ...t, href: hrefFor(t.id) }))} active={tab} />

      {tab === "overview" && <OverviewTab projectId={selectedProjectId} />}
      {tab === "agentes" && <AgentsProjectsTab projectId={selectedProjectId} />}
      {tab === "perfil" && <ProfileTab projectId={selectedProjectId} />}
      {tab === "direitos" && <RightsTab projectId={selectedProjectId} />}
    </main>
  )
}
