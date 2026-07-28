import { Card, CardContent } from "@/components/ui/card"
import { ElderlyWomanIcon } from "@/components/dashboard/ElderlyWomanIcon"
import type { ReactNode } from "react"

interface KpiCardsProps {
  totalIdosos: number
  totalAgents: number
  totalProjects: number
  totalCities: number
  totalUfs: number
  totalForms: number
  lastSubmission: string | null
}

function formatDate(iso: string | null): string {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  })
}

export function KpiCards(props: KpiCardsProps) {
  const items: { label: string; value: string | number; icon: ReactNode }[] = [
    { label: "Pessoas Idosas Entrevistadas", value: props.totalIdosos, icon: <ElderlyWomanIcon className="w-7 h-7" /> },
    { label: "Agentes de Campo", value: props.totalAgents, icon: "👤" },
    { label: "Projetos", value: props.totalProjects, icon: "📋" },
    { label: "Municípios", value: props.totalCities, icon: "🏙️" },
    { label: "Estados/DF", value: props.totalUfs, icon: "📍" },
    { label: "Submissões", value: props.totalForms, icon: "📝" },
    { label: "Última Submissão", value: formatDate(props.lastSubmission), icon: "🕐" },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
      {items.map((item) => (
        <Card key={item.label}>
          <CardContent className="p-4 flex flex-col items-center text-center gap-1">
            <span className="text-2xl">{item.icon}</span>
            <span className={`font-bold ${typeof item.value === "number" ? "text-2xl" : "text-sm"}`}>
              {typeof item.value === "number" ? item.value.toLocaleString("pt-BR") : item.value}
            </span>
            <span className="text-xs text-muted-foreground">{item.label}</span>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
