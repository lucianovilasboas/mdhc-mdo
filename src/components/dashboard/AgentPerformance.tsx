"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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

  const top10 = data.slice(0, 10)
  const labelProps = isMobile
    ? {}
    : { fontSize: 11, fill: "#fff", fontWeight: 600 as const }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Desempenho dos Agentes (Top 10)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={top10} layout="vertical" margin={{ left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis type="number" tick={{ fontSize: 12 }} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={140} />
            <Tooltip
              formatter={(value: number, name: string) => [
                value,
                name === "parte1" ? "Parte 1" : name === "parte2" ? "Parte 2" : "Total",
              ]}
            />
            <Bar dataKey="parte1" name="Parte 1" stackId="a" fill="#2563eb" radius={[0, 0, 0, 0]}>
              {!isMobile && (
                <LabelList dataKey="parte1" position="inside" {...labelProps} />
              )}
            </Bar>
            <Bar dataKey="parte2" name="Parte 2" stackId="a" fill="#16a34a" radius={[0, 4, 4, 0]}>
              {!isMobile && (
                <LabelList dataKey="parte2" position="inside" {...labelProps} />
              )}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
