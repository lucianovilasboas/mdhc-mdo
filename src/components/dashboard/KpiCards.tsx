import { Card, CardContent } from "@/components/ui/card"
import { ElderlyWomanIcon } from "@/components/dashboard/ElderlyWomanIcon"

interface KpiCardsProps {
  totalIdosos: number
  totalAgents: number
  totalProjects: number
  totalCities: number
  totalUfs: number
}

export function KpiCards({ totalIdosos, totalAgents, totalProjects, totalCities, totalUfs }: KpiCardsProps) {
  const items = [
    { label: "Pessoas Idosas Cadastradas", value: totalIdosos, icon: <ElderlyWomanIcon className="w-7 h-7" /> },
    { label: "Agentes de Campo", value: totalAgents, icon: "👤" },
    { label: "Projetos", value: totalProjects, icon: "📋" },
    { label: "Municípios", value: totalCities, icon: "🏙️" },
    { label: "Estados/DF", value: totalUfs, icon: "📍" },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {items.map((item) => (
        <Card key={item.label}>
          <CardContent className="p-4 flex flex-col items-center text-center gap-1">
            <span className="text-2xl">{item.icon}</span>
            <span className="text-2xl font-bold">{item.value.toLocaleString("pt-BR")}</span>
            <span className="text-xs text-muted-foreground">{item.label}</span>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
