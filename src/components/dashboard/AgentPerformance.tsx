"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ExpandableSection } from "@/components/ui/expandable-section"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LabelList,
} from "recharts"
import { PALETA_CORES } from "@/types"
import { useMediaQuery } from "@/components/dashboard/useMediaQuery"
import type { AgentStat } from "@/types"

interface AgentPerformanceProps {
  data: AgentStat[]
}

function AgentBarChart({ agents, isMobile }: { agents: AgentStat[]; isMobile: boolean }) {
  return (
    <ResponsiveContainer width="100%" height={Math.max(300, agents.length * 28)}>
      <BarChart data={agents} layout="vertical" margin={{ left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis type="number" tick={{ fontSize: 12 }} />
        <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={140} />
        <Tooltip
          formatter={(value: number, name: string) => [
            value,
            name === "parte1" ? "Parte 1 - Cadastro" : "Parte 2 - Direitos",
          ]}
        />
        <Bar dataKey="parte1" stackId="a" fill={PALETA_CORES.azul} radius={[0, 0, 0, 0]}>
          {!isMobile && (
            <LabelList dataKey="parte1" position="inside" fontSize={11} fill="#fff" fontWeight={600} />
          )}
        </Bar>
        <Bar dataKey="parte2" stackId="a" fill={PALETA_CORES.verde} radius={[0, 4, 4, 0]}>
          {!isMobile && (
            <LabelList dataKey="parte2" position="inside" fontSize={11} fill="#fff" fontWeight={600} />
          )}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export function AgentPerformance({ data }: AgentPerformanceProps) {
  const isMobile = useMediaQuery("(max-width: 767px)")
  const top15 = data.slice(0, 15)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle className="text-lg">Desempenho dos Agentes (Top 15)</CardTitle>
        <ExpandableSection title="Desempenho de Todos os Agentes">
          <AgentBarChart agents={data} isMobile={isMobile} />
        </ExpandableSection>
      </CardHeader>
      <CardContent>
        <AgentBarChart agents={top15} isMobile={isMobile} />
      </CardContent>
    </Card>
  )
}