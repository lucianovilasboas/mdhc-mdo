"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LabelList,
} from "recharts"
import { CORES_DONUT } from "@/types"
import type { DemographicProfile } from "@/types"

interface ElderlyProfileSectionProps {
  data: DemographicProfile
}

function labelFaixa({ faixa, count }: { faixa: string; count: number }): string {
  return `${faixa}: ${count}`
}

function labelGenero({ label, percent }: { label: string; percent: number }): string {
  return `${label} (${(percent * 100).toFixed(0)}%)`
}

export function ElderlyProfileSection({ data }: ElderlyProfileSectionProps) {
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
                  label={labelFaixa}
                >
                  {data.idade.map((entry, i) => (
                    <Cell key={entry.faixa} fill={CORES_DONUT[i % CORES_DONUT.length]} />
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
                  label={labelGenero}
                >
                  {data.genero.map((entry, i) => (
                    <Cell key={entry.label} fill={CORES_DONUT[i % CORES_DONUT.length]} />
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
                  {data.cor_etnia.map((entry, i) => (
                    <Cell key={entry.label} fill={CORES_DONUT[i % CORES_DONUT.length]} />
                  ))}
                  <LabelList dataKey="count" position="top" fontSize={11} className="fill-muted-foreground" />
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
                  {data.escolaridade.map((entry, i) => (
                    <Cell key={entry.label} fill={CORES_DONUT[i % CORES_DONUT.length]} />
                  ))}
                  <LabelList dataKey="count" position="top" fontSize={11} className="fill-muted-foreground" />
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
                  {data.renda.map((entry, i) => (
                    <Cell key={entry.label} fill={CORES_DONUT[i % CORES_DONUT.length]} />
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
                  {data.avaliacao_saude.map((entry, i) => (
                    <Cell key={entry.label} fill={CORES_DONUT[i % CORES_DONUT.length]} />
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