"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [showIOS, setShowIOS] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
    }
    window.addEventListener("beforeinstallprompt", onPrompt)

    const onInstalled = () => {
      setDeferred(null)
      setShowIOS(false)
    }
    window.addEventListener("appinstalled", onInstalled)

    let timer: ReturnType<typeof setTimeout> | undefined
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true
    if (isIOS && !isStandalone) {
      timer = setTimeout(() => setShowIOS(true), 0)
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt)
      window.removeEventListener("appinstalled", onInstalled)
      if (timer) clearTimeout(timer)
    }
  }, [])

  async function install() {
    if (!deferred) return
    await deferred.prompt()
    await deferred.userChoice
    setDeferred(null)
  }

  if (dismissed) return null
  if (!deferred && !showIOS) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 flex items-center justify-between gap-3 rounded-lg border bg-background p-3 shadow-lg sm:left-auto sm:max-w-sm">
      <div className="min-w-0 text-sm">
        {deferred ? (
          <span>Instale o app para acesso rápido.</span>
        ) : (
          <span>
            No iPhone/iPad: toque em <strong>Compartilhar</strong> e em{" "}
            <strong>Adicionar à Tela de Início</strong>.
          </span>
        )}
      </div>
      {deferred && (
        <Button size="sm" onClick={install}>Instalar</Button>
      )}
      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => setDismissed(true)}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}
