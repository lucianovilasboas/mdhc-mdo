"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, LabelList,
} from "recharts"
import type { MultiSelectIndicator } from "@/types"
import { CORES_DONUT } from "@/types"

interface MultiSelectIndicatorsProps {
  data: MultiSelectIndicator[]
}

export function MultiSelectIndicators({ data }: MultiSelectIndicatorsProps) {
  const groups = data.filter((g) => g.gateSim > 0)
  if (groups.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Tipos / Desdobramentos por Resposta (Parte 2)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {groups.map((group) => {
          const chartData = [...group.items]
            .sort((a, b) => b.count - a.count)
            .map((item) => ({
              ...item,
              labelText: `${item.count} (${item.percentual}%)`,
            }))

          return (
            <div key={group.key}>
              <p className="mb-1 text-sm font-medium text-foreground">{group.name}</p>
              <p className="mb-3 text-xs text-muted-foreground">
                {group.gateName} — {group.gateSim} resposta{group.gateSim === 1 ? "" : "s"} “Sim”
                (percentuais sobre esse total)
              </p>
              <ResponsiveContainer width="100%" height={Math.max(180, chartData.length * 42)}>
                <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 100 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis type="category" dataKey="label" tick={{ fontSize: 11 }} width={190} />
                  <Tooltip
                    formatter={(value: number) => [`${value}`, "Respostas"]}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {chartData.map((item, i) => (
                      <Cell key={item.key} fill={CORES_DONUT[i % CORES_DONUT.length]} />
                    ))}
                    <LabelList
                      dataKey="labelText"
                      position="right"
                      fontSize={11}
                      className="fill-muted-foreground"
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
