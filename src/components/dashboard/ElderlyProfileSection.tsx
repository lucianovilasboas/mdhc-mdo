"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, LabelList,
} from "recharts"

interface DemographicProfile {
  idade: { faixa: string; count: number }[]
  genero: { label: string; count: number }[]
  cor_etnia: { label: string; count: number }[]
  escolaridade: { label: string; count: number }[]
  renda: { label: string; count: number }[]
  avaliacao_saude: { label: string; count: number }[]
}

interface ElderlyProfileSectionProps {
  data: DemographicProfile
}

const COLORS = ["#2563eb", "#16a34a", "#dc2626", "#ca8a04", "#9333ea", "#0891b2"]

export function ElderlyProfileSection({ data }: ElderlyProfileSectionProps) {
  const totalAge = data.idade.reduce((a, b) => a + b.count, 0)
  const totalGender = data.genero.reduce((a, b) => a + b.count, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Perfil das Pessoas Idosas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium mb-2">Faixa Etária</h4>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={data.idade}
                  dataKey="count"
                  nameKey="faixa"
                  cx="50%" cy="50%" outerRadius={75}
                  label={({ faixa, count }: any) => `${faixa}: ${count}`}
                >
                  {data.idade.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">Gênero</h4>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={data.genero}
                  dataKey="count"
                  nameKey="label"
                  cx="50%" cy="50%" outerRadius={75}
                  label={({ label, percent }: any) =>
                    `${label} (${(percent * 100).toFixed(0)}%)`
                  }
                >
                  {data.genero.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">Cor/Raça</h4>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.cor_etnia} margin={{ top: 20 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} angle={-20} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {data.cor_etnia.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                  <LabelList dataKey="count" position="top" fontSize={11} fill="#374151" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">Escolaridade</h4>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.escolaridade} margin={{ top: 20 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} angle={-30} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {data.escolaridade.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                  <LabelList dataKey="count" position="top" fontSize={11} fill="#374151" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">Renda Individual</h4>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.renda}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="label" tick={{ fontSize: 9 }} angle={-30} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {data.renda.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">Autoavaliação de Saúde</h4>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.avaliacao_saude}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} angle={-20} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {data.avaliacao_saude.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
