"use client"

import { useState, Suspense } from "react"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { ProjectFilter } from "@/components/dashboard/ProjectFilter"
import { Menu, X } from "lucide-react"

interface DashboardHeaderProps {
  userName: string
  userRole: string
  userProjectId: string | null
}

export function DashboardHeader({ userName, userRole, userProjectId }: DashboardHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="min-w-0 flex-1 md:flex-initial">
            <h1 className="text-xl font-bold truncate">Envelhecer nos Territórios</h1>
            <p className="text-sm text-muted-foreground hidden sm:block">Dashboard de Acompanhamento — MDHC</p>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <ProjectFilter allowedProjectId={userRole === "admin" ? null : userProjectId} />
            <span className="text-sm text-muted-foreground whitespace-nowrap">{userName}</span>
            <Button variant="outline" size="sm" onClick={() => signOut({ redirect: false }).then(() => { window.location.href = "/login" })}>Sair</Button>
          </div>

          <button
            className="md:hidden p-2 -mr-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t bg-background px-4 py-3">
            <p className="text-sm text-muted-foreground mb-3">Dashboard de Acompanhamento — MDHC</p>
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm text-muted-foreground truncate">{userName}</span>
              <Button variant="outline" size="sm" onClick={() => signOut({ redirect: false }).then(() => { window.location.href = "/login" })}>Sair</Button>
            </div>
          </div>
        )}
      </header>

      <div className="md:hidden fixed top-16 left-0 right-0 z-40 bg-background border-b px-4 py-2">
        <Suspense fallback={<div className="h-9 w-full rounded-md border border-input bg-background" />}>
          <ProjectFilter allowedProjectId={userRole === "admin" ? null : userProjectId} />
        </Suspense>
      </div>
    </>
  )
}
