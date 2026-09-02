"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import type { ActiveProject } from "@/lib/odk"

interface ProjectFilterProps {
  allowedProjectId?: string | null
  dark?: boolean
}

export function ProjectFilter({ allowedProjectId, dark = false }: ProjectFilterProps) {
  const searchParams = useSearchParams()
  const current = searchParams.get("projeto") || ""
  const [projects, setProjects] = useState<ActiveProject[]>([])

  useEffect(() => {
    fetch("/api/odk/projects")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setProjects(data)
      })
      .catch(() => {})
  }, [])

  if (allowedProjectId) {
    const project = projects.find((p) => String(p.id) === allowedProjectId)
    return (
      <span className={`text-sm font-medium ${dark ? "text-white/90" : "text-muted-foreground"}`}>
        {project?.name ?? `Projeto ${allowedProjectId}`}
      </span>
    )
  }

  return (
    <select
      value={current}
      onChange={(e) => {
        const v = e.target.value
        const params = new URLSearchParams(searchParams.toString())
        if (v) params.set("projeto", v)
        else params.delete("projeto")
        const qs = params.toString()
        window.location.href = qs ? `/dashboard?${qs}` : "/dashboard"
      }}
      className={
        dark
          ? "h-9 w-full md:w-auto rounded-md border border-white/25 bg-white/10 px-3 py-1 text-sm text-white shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 [&>option]:text-foreground"
          : "h-9 w-full md:w-auto rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      }
    >
      <option value="">Todos os Projetos</option>
      {projects.map((p) => (
        <option key={p.id} value={p.id}>{p.name}</option>
      ))}
    </select>
  )
}
