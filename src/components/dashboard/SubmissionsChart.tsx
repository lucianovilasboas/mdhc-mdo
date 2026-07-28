"use client"

import { useState, useCallback, useMemo } from "react"
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
  availableCities?: string[]
}

function mergeWithFullRange(full: TimelinePoint[], filtered: TimelinePoint[]): TimelinePoint[] {
  const byDate: Record<string, TimelinePoint> = {}
  for (const f of filtered) byDate[f.date] = f
  return full.map((d) => {
    const f = byDate[d.date]
    return f ?? { date: d.date, parte1: 0, parte2: 0, total: 0 }
  })
}

export function SubmissionsChart({ data, availableCities = [] }: SubmissionsChartProps) {
  const [selectedCity, setSelectedCity] = useState("")
  const [filteredData, setFilteredData] = useState<TimelinePoint[] | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchTimeline = useCallback(async (city: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/odk/stats?view=timeline&cidade=${encodeURIComponent(city)}`)
      const json = await res.json()
      if (Array.isArray(json)) setFilteredData(json)
    } catch {
      /* ignore */
    } finally {
      setLoading(false)
    }
  }, [])

  const handleCityChange = (city: string) => {
    setSelectedCity(city)
    if (city) {
      fetchTimeline(city)
    } else {
      setFilteredData(null)
    }
  }

  const chartSource = useMemo(() => {
    if (!selectedCity || !filteredData) return data
    return mergeWithFullRange(data, filteredData)
  }, [data, selectedCity, filteredData])

  const chartData = chartSource.map((d) => {
    const dt = new Date(d.date + "T12:00:00")
    const label = dt.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
    return { ...d, label }
  })

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle className="text-lg">Evolução das Submissões</CardTitle>
        {availableCities.length > 0 && (
          <select
            value={selectedCity}
            onChange={(e) => handleCityChange(e.target.value)}
            className="h-8 rounded-md border border-input bg-background px-2 py-0 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring max-w-[180px]"
          >
            <option value="">Todas as Cidades</option>
            {availableCities.map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-[300px] text-sm text-muted-foreground">
            Carregando...
          </div>
        ) : (
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
        )}
      </CardContent>
    </Card>
  )
}
