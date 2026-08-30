"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, LabelList,
} from "recharts"
import { PALETA_CORES } from "@/types"
import { useMediaQuery } from "@/components/dashboard/useMediaQuery"
import type { RightsIndicator } from "@/types"

interface RightsIndicatorsProps {
  data: RightsIndicator[]
}

export function RightsIndicators({ data }: RightsIndicatorsProps) {
  const isMobile = useMediaQuery("(max-width: 767px)")

  const sorted = [...data]
    .sort((a, b) => b.percentual - a.percentual)
    .map((item) => ({
      ...item,
      labelText: isMobile
        ? `${item.sim} (${item.percentual}%)`
        : `${item.sim}/${item.total} (${item.percentual}%)`,
    }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Violações de Direitos (Parte 2)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={sorted} layout="vertical" margin={{ left: 0, right: 120 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis type="number" unit="%" tick={{ fontSize: 12 }} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={160} />
            <Tooltip
              formatter={(value: number) => [`${value}%`, "Percentual"]}
            />
            <Bar dataKey="percentual" radius={[0, 4, 4, 0]}>
              {sorted.map((item) => (
                <Cell
                  key={item.key}
                  fill={
                    item.percentual > 20
                      ? PALETA_CORES.vermelho
                      : item.percentual > 10
                        ? PALETA_CORES.amarelo
                        : PALETA_CORES.verde
                  }
                />
              ))}
              <LabelList
                dataKey="labelText"
                position={isMobile ? "right" : "center"}
                fontSize={11}
                className={isMobile ? "fill-muted-foreground" : "fill-white"}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}