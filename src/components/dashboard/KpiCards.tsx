import { Card, CardContent } from "@/components/ui/card"
import { ElderlyWomanIcon } from "@/components/dashboard/ElderlyWomanIcon"
import { Users, Building2, MapPin, Flag, FileText, Clock } from "lucide-react"
import { KPI_CORES } from "@/types"
import type { ComponentType } from "react"

interface KpiCardsProps {
  totalIdosos: number
  totalAgents: number
  totalProjects: number
  totalCities: number
  totalUfs: number
  totalForms: number
  lastSubmission: string | null
}

interface KpiItem {
  label: string
  value: string | number
  icon: ComponentType<{ className?: string }>
  color: string
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
  const items: KpiItem[] = [
    { label: "Pessoas Idosas Entrevistadas", value: props.totalIdosos, icon: ElderlyWomanIcon, color: KPI_CORES.idosos },
    { label: "Agentes de Campo", value: props.totalAgents, icon: Users, color: KPI_CORES.agentes },
    { label: "Projetos", value: props.totalProjects, icon: Building2, color: KPI_CORES.projetos },
    { label: "Municípios", value: props.totalCities, icon: MapPin, color: KPI_CORES.municipios },
    { label: "Estados/DF", value: props.totalUfs, icon: Flag, color: KPI_CORES.ufs },
    { label: "Submissões", value: props.totalForms, icon: FileText, color: KPI_CORES.submissoes },
    { label: "Última Submissão", value: formatDate(props.lastSubmission), icon: Clock, color: KPI_CORES.ultima },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
      {items.map((item) => {
        const Icon = item.icon
        return (
          <Card key={item.label} className="relative overflow-hidden">
            <span
              aria-hidden
              className="absolute inset-x-0 top-0 h-1"
              style={{ background: `linear-gradient(90deg, ${item.color}, ${item.color}00)` }}
            />
            <CardContent className="flex flex-col items-center gap-2 pt-5 text-center">
              <span
                className="flex h-12 w-12 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${item.color}1f`, color: item.color }}
              >
                <Icon className="h-6 w-6" />
              </span>
              <span className={`font-bold leading-none ${typeof item.value === "number" ? "text-2xl" : "text-sm"}`}>
                {typeof item.value === "number" ? item.value.toLocaleString("pt-BR") : item.value}
              </span>
              <span className="text-xs leading-tight text-muted-foreground">{item.label}</span>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
