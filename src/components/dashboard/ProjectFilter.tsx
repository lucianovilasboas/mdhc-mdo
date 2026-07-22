"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { ACTIVE_PROJECTS } from "@/lib/odk"

interface ProjectFilterProps {
  allowedProjectId?: string | null
}

export function ProjectFilter({ allowedProjectId }: ProjectFilterProps) {
  const searchParams = useSearchParams()
  const current = searchParams.get("projeto") || ""

  if (allowedProjectId) {
    const project = ACTIVE_PROJECTS.find((p) => String(p.id) === allowedProjectId)
    return (
      <span className="text-sm font-medium text-muted-foreground">
        {project?.name ?? `Projeto ${allowedProjectId}`}
      </span>
    )
  }

  return (
    <select
      value={current}
      onChange={(e) => {
        const v = e.target.value
        const url = v ? `/dashboard?projeto=${v}` : "/dashboard"
        window.location.href = url
      }}
      className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
    >
      <option value="">Todos os Projetos</option>
      {ACTIVE_PROJECTS.map((p) => (
        <option key={p.id} value={p.id}>{p.name}</option>
      ))}
    </select>
  )
}
