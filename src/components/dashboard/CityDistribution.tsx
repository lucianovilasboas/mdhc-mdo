"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, LabelList,
} from "recharts"

interface CityStat {
  city: string
  uf: string
  submissions: number
  projectName: string
}

interface CityDistributionProps {
  data: CityStat[]
}

const COLORS = ["#2563eb", "#16a34a", "#dc2626", "#ca8a04", "#9333ea", "#0891b2", "#be185d", "#ea580c"]

export function CityDistribution({ data }: CityDistributionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Submissões por Município</CardTitle>
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
              formatter={(value: number) => [`${value} submissões`]}
              labelFormatter={(label: string) => `${label}`}
            />
            <Bar dataKey="submissions" radius={[0, 4, 4, 0]}>
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
              <LabelList dataKey="submissions" position="right" fontSize={12} fill="#374151" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
