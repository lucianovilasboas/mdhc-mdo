"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, LabelList,
} from "recharts"
import { CORES_DONUT } from "@/types"
import type { CityStat } from "@/types"

interface CityDistributionProps {
  data: CityStat[]
}

export function CityDistribution({ data }: CityDistributionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Pessoas Idosas por Município</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} layout="vertical" margin={{ left: 0, right: 30 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis type="number" tick={{ fontSize: 12 }} />
            <YAxis
              type="category"
              dataKey="city"
              tick={{ fontSize: 12 }}
              width={120}
            />
            <Tooltip
              formatter={(value: number) => [`${value} pessoas idosas`]}
              labelFormatter={(label: string) => `${label}`}
            />
            <Bar dataKey="submissions" radius={[0, 4, 4, 0]}>
              {data.map((_, i) => (
                <Cell key={i} fill={CORES_DONUT[i % CORES_DONUT.length]} />
              ))}
              <LabelList dataKey="submissions" position="right" fontSize={12} className="fill-muted-foreground" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
