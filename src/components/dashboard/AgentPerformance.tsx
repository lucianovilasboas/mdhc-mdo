"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ExpandableSection } from "@/components/ui/expandable-section"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LabelList,
} from "recharts"

interface AgentStat {
  name: string
  projectName: string
  city: string
  submissions: number
  parte1: number
  parte2: number
}

interface AgentPerformanceProps {
  data: AgentStat[]
}

export function AgentPerformance({ data }: AgentPerformanceProps) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)")
    setIsMobile(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

  const top15 = data.slice(0, 15)
  const labelProps = isMobile
    ? {}
    : { fontSize: 11, fill: "#fff", fontWeight: 600 as const }

  function BarChartContent({ agents }: { agents: AgentStat[] }) {
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
          <Bar dataKey="parte1" stackId="a" fill="#2563eb" radius={[0, 0, 0, 0]}>
            {!isMobile && (
              <LabelList dataKey="parte1" position="inside" {...labelProps} />
            )}
          </Bar>
          <Bar dataKey="parte2" stackId="a" fill="#16a34a" radius={[0, 4, 4, 0]}>
            {!isMobile && (
              <LabelList dataKey="parte2" position="inside" {...labelProps} />
            )}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle className="text-lg">Desempenho dos Agentes (Top 15)</CardTitle>
        <ExpandableSection title="Desempenho de Todos os Agentes">
          <BarChartContent agents={data} />
        </ExpandableSection>
      </CardHeader>
      <CardContent>
        <BarChartContent agents={top15} />
      </CardContent>
    </Card>
  )
}
