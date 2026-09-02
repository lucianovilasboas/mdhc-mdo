"use client"

import { useState, Suspense } from "react"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { ProjectFilter } from "@/components/dashboard/ProjectFilter"
import { ElderlyWomanIcon } from "@/components/dashboard/ElderlyWomanIcon"
import { Menu, X, LogOut } from "lucide-react"

interface DashboardHeaderProps {
  userName: string
  userRole: string
  userProjectId: string | null
}

export function DashboardHeader({ userName, userRole, userProjectId }: DashboardHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  const sair = () =>
    signOut({ redirect: false }).then(() => {
      window.location.href = "/login"
    })

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 bg-gradient-to-r from-[#2a1407] via-[#3E1F0A] to-[#7a4a1f] shadow-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 sm:h-16">
          {/* Logo + título */}
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 sm:h-11 sm:w-11">
              <ElderlyWomanIcon className="h-7 w-7 sm:h-8 sm:w-8" />
            </span>
            <div className="min-w-0">
              <h1 className="truncate text-sm font-bold leading-tight text-white sm:text-lg">
                Envelhecer nos Territórios
              </h1>
              <p className="hidden text-xs text-white/80 sm:block">
                Dashboard de Acompanhamento — MDHC
              </p>
            </div>
          </div>

          {/* Lado direito (desktop) */}
          <div className="ml-auto hidden items-center gap-3 md:flex">
            <ProjectFilter allowedProjectId={userRole === "admin" ? null : userProjectId} dark />
            <span className="whitespace-nowrap text-sm text-white/80">{userName}</span>
            <Button
              variant="outline"
              size="sm"
              className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
              onClick={sair}
            >
              <LogOut className="mr-1.5 h-3.5 w-3.5" aria-hidden />
              Sair
            </Button>
          </div>

          {/* Botão menu mobile */}
          <button
            className="ml-auto p-2 text-white md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-white/10 px-4 py-3 md:hidden">
            <p className="mb-3 text-sm text-white/80">Dashboard de Acompanhamento — MDHC</p>
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-sm text-white/80">{userName}</span>
              <Button
                variant="outline"
                size="sm"
                className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                onClick={sair}
              >
                <LogOut className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                Sair
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Filtro de projeto no mobile (abaixo do header) */}
      <div className="fixed left-0 right-0 top-14 z-40 border-b border-white/10 bg-[#2a1407]/95 px-4 py-2 backdrop-blur sm:top-16 md:hidden">
        <Suspense fallback={<div className="h-9 w-full rounded-md border border-white/20 bg-white/10" />}>
          <ProjectFilter allowedProjectId={userRole === "admin" ? null : userProjectId} dark />
        </Suspense>
      </div>
    </>
  )
}
