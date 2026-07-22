"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import type { RightsIndicator } from "@/types"

interface CityRightsEntry {
  city: string
  projectName: string
  projectId: number
  indicators: RightsIndicator[]
}

interface CityRightsIndicatorsProps {
  data: CityRightsEntry[]
}

const ROW_ORDER = [
  { key: "discriminacao", name: "Sofreu discriminação" },
  { key: "sofreu_violencia", name: "Sofreu violência" },
  { key: "impedido_opinar", name: "Impedido de opinar" },
  { key: "impedido_decidir", name: "Impedido de decidir" },
  { key: "dificuldade_saude", name: "Dificuldade acesso à saúde" },
  { key: "dificuldade_educacao", name: "Dificuldade acesso à educação" },
  { key: "dificuldade_beneficios", name: "Dificuldade acesso a benefícios" },
  { key: "moradia_inadequada", name: "Moradia inadequada" },
  { key: "falta_servicos_publicos", name: "Falta de serviços públicos" },
  { key: "dificuldade_acesso_justica", name: "Dificuldade acesso à justiça" },
  { key: "tratado_por_idade", name: "Tratado diferente por idade" },
  { key: "barreiras_acessibilidade", name: "Barreiras de acessibilidade" },
  { key: "risco_desastre_violencia", name: "Risco de desastre/violência" },
  { key: "injustica_legal", name: "Injustiça legal" },
  { key: "acamado_domiciliado", name: "Acamado/Domiciliado" },
  { key: "dificuldade_cuidados", name: "Dificuldade com cuidados" },
  { key: "dificuldade_votacao", name: "Dificuldade para votar" },
  { key: "impedido_participacao_atividades", name: "Impedido de participar de atividades" },
  { key: "impedido_reuniao_manifestacao", name: "Impedido de reunião/manifestação" },
  { key: "impedido_utilizar_bem", name: "Impedido de utilizar bem público" },
  { key: "invasao_privacidade", name: "Invasão de privacidade" },
  { key: "preso_ilegal", name: "Preso ilegalmente" },
  { key: "profissionais_nao_explicaram", name: "Profissionais não explicaram" },
  { key: "vida_ameacada", name: "Vida ameaçada" },
]

function computeTotals(data: CityRightsEntry[]) {
  const totals: Record<string, { sim: number; total: number }> = {}
  for (const entry of data) {
    for (const ind of entry.indicators) {
      if (!totals[ind.key]) totals[ind.key] = { sim: 0, total: 0 }
      totals[ind.key].sim += ind.sim
      totals[ind.key].total += ind.total
    }
  }
  return totals
}

export function CityRightsIndicators({ data }: CityRightsIndicatorsProps) {
  if (data.length === 0) return null

  const totals = computeTotals(data)
  const sorted = [...ROW_ORDER]
    .map((r) => ({ ...r, rowTotal: totals[r.key]?.sim ?? 0 }))
    .sort((a, b) => b.rowTotal - a.rowTotal)

  const headers = data.map((e) => ({
    city: e.city,
    label: e.projectName ? `${e.city} (${e.projectName})` : e.city,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Violações de Direitos por Município (Parte 2)</CardTitle>
      </CardHeader>
      <CardContent className="p-0 sm:p-6">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 bg-card min-w-[200px]">Violação</TableHead>
                {headers.map((h) => (
                  <TableHead key={h.city} className="text-right min-w-[100px]">{h.label}</TableHead>
                ))}
                <TableHead className="text-right min-w-[100px] font-bold">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((row) => {
                const rowTotal = totals[row.key]
                const totalSim = rowTotal?.sim ?? 0
                const totalPct = rowTotal && rowTotal.total > 0
                  ? Math.round((rowTotal.sim / rowTotal.total) * 100)
                  : 0
                return (
                  <TableRow key={row.key}>
                    <TableCell className="sticky left-0 bg-card font-medium">{row.name}</TableCell>
                    {data.map((entry) => {
                      const ind = entry.indicators.find((i) => i.key === row.key)
                      const sim = ind?.sim ?? 0
                      const pct = ind?.percentual ?? 0
                      return (
                        <TableCell key={entry.city} className="text-right tabular-nums">
                          {ind && ind.total > 0 ? `${sim} (${pct}%)` : "—"}
                        </TableCell>
                      )
                    })}
                    <TableCell className="text-right tabular-nums font-semibold">
                      {totalSim} ({(rowTotal && rowTotal.total > 0) ? Math.round((rowTotal.sim / rowTotal.total) * 100) : 0}%)
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
