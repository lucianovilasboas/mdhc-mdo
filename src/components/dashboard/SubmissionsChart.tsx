"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts"

interface TimelinePoint {
  date: string
  parte1: number
  parte2: number
  total: number
}

interface SubmissionsChartProps {
  data: TimelinePoint[]
}

export function SubmissionsChart({ data }: SubmissionsChartProps) {
  const chartData = data.map((d) => {
    const dt = new Date(d.date + "T12:00:00")
    const label = dt.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
    return { ...d, label }
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Evolução das Submissões</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="label" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              labelFormatter={(label: string) => {
                const [day, month] = label.split("/")
                return `${day}/${month}`
              }}
            />
            <Legend />
            <Line type="monotone" dataKey="parte1" name="Parte 1 (Cadastro)" stroke="#2563eb" strokeWidth={2} />
            <Line type="monotone" dataKey="parte2" name="Parte 2 (Direitos)" stroke="#16a34a" strokeWidth={2} />
            <Line type="monotone" dataKey="total" name="Total" stroke="#dc2626" strokeWidth={2} strokeDasharray="4 2" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
