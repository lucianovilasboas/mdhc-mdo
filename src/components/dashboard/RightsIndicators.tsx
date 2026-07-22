"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, LabelList,
} from "recharts"

interface RightsIndicator {
  name: string
  key: string
  total: number
  sim: number
  nao: number
  percentual: number
}

interface RightsIndicatorsProps {
  data: RightsIndicator[]
}

export function RightsIndicators({ data }: RightsIndicatorsProps) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

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
              {sorted.map((item, i) => (
                <Cell
                  key={item.key}
                  fill={item.percentual > 20 ? "#dc2626" : item.percentual > 10 ? "#ca8a04" : "#16a34a"}
                />
              ))}
              <LabelList
                dataKey="labelText"
                position={isMobile ? "right" : "center"}
                fontSize={11}
                fill={isMobile ? "#374151" : "#ffffff"}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
