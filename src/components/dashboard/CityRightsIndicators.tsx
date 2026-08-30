"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ExpandableSection } from "@/components/ui/expandable-section"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import type { RightsIndicator, MultiSelectIndicator, CityMultiSelectEntry } from "@/types"

interface CityRightsEntry {
  city: string
  projectName: string
  projectId: number
  indicators: RightsIndicator[]
}

interface CityRightsIndicatorsProps {
  data: CityRightsEntry[]
  multiSelect?: CityMultiSelectEntry[]
}

interface SortedRow {
  key: string
  name: string
  rowTotal: number
}

interface RightsTableProps {
  sorted: SortedRow[]
  data: CityRightsEntry[]
  headers: { city: string; label: string }[]
  totals: Record<string, { sim: number; total: number }>
  multiByCity: Record<string, Record<string, MultiSelectIndicator>> | null
  multiTotals: Record<string, { count: number; gateSim: number }> | null
  gateItemOrder: Record<string, { key: string; label: string }[]>
  gateHasData: Record<string, boolean>
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

function buildMultiByCity(data: CityMultiSelectEntry[]) {
  const map: Record<string, Record<string, MultiSelectIndicator>> = {}
  for (const entry of data) {
    const byGate: Record<string, MultiSelectIndicator> = {}
    for (const ind of entry.indicators) byGate[ind.gateKey] = ind
    map[entry.city] = byGate
  }
  return map
}

function computeMultiTotals(data: CityMultiSelectEntry[]) {
  const totals: Record<string, { count: number; gateSim: number }> = {}
  for (const entry of data) {
    for (const ind of entry.indicators) {
      for (const item of ind.items) {
        const k = `${ind.gateKey}:${item.key}`
        if (!totals[k]) totals[k] = { count: 0, gateSim: 0 }
        totals[k].count += item.count
        totals[k].gateSim += ind.gateSim
      }
    }
  }
  return totals
}

function buildGateItemOrder(data: CityMultiSelectEntry[]) {
  const order: Record<string, { key: string; label: string }[]> = {}
  const hasData: Record<string, boolean> = {}
  for (const entry of data) {
    for (const ind of entry.indicators) {
      if (!order[ind.gateKey]) {
        order[ind.gateKey] = ind.items.map((i) => ({ key: i.key, label: i.label }))
      }
      if (ind.gateSim > 0) hasData[ind.gateKey] = true
    }
  }
  return { order, hasData }
}

function RightsTable({
  sorted, data, headers, totals,
  multiByCity, multiTotals, gateItemOrder, gateHasData,
}: RightsTableProps) {
  return (
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
                {totalSim} ({totalPct}%)
              </TableCell>
            </TableRow>
          )
        })}
        {multiByCity && sorted.map((row) => {
          const items = gateItemOrder[row.key] ?? []
          if (!gateHasData[row.key]) return null
          return items.map((item) => {
            const totalKey = `${row.key}:${item.key}`
            const mt = multiTotals?.[totalKey]
            return (
              <TableRow key={totalKey} className="bg-muted/40">
                <TableCell className="sticky left-0 bg-muted/40 pl-6 text-muted-foreground">
                  · {item.label}
                </TableCell>
                {data.map((entry) => {
                  const ind = multiByCity[entry.city]?.[row.key]
                  const it = ind?.items.find((i) => i.key === item.key)
                  return (
                    <TableCell key={entry.city} className="text-right tabular-nums text-muted-foreground">
                      {ind && ind.gateSim > 0 && it ? `${it.count} (${it.percentual}%)` : "—"}
                    </TableCell>
                  )
                })}
                <TableCell className="text-right tabular-nums text-muted-foreground">
                  {mt && mt.gateSim > 0 ? `${mt.count} (${Math.round((mt.count / mt.gateSim) * 100)}%)` : "—"}
                </TableCell>
              </TableRow>
            )
          })
        })}
      </TableBody>
    </Table>
  )
}

export function CityRightsIndicators({ data, multiSelect }: CityRightsIndicatorsProps) {
  if (data.length === 0) return null

  const totals = computeTotals(data)
  const sorted = [...ROW_ORDER]
    .map((r) => ({ ...r, rowTotal: totals[r.key]?.sim ?? 0 }))
    .sort((a, b) => b.rowTotal - a.rowTotal)

  const headers = data.map((e) => ({
    city: e.city,
    label: e.projectName ? `${e.city} (${e.projectName})` : e.city,
  }))

  const multiByCity = multiSelect ? buildMultiByCity(multiSelect) : null
  const multiTotals = multiSelect ? computeMultiTotals(multiSelect) : null
  const { order: gateItemOrder, hasData: gateHasData } = multiSelect
    ? buildGateItemOrder(multiSelect)
    : { order: {}, hasData: {} }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle className="text-lg">Violações de Direitos por Município (Parte 2)</CardTitle>
        <ExpandableSection title="Violações de Direitos por Município (Parte 2)">
          <div className="overflow-x-auto">
            <RightsTable
              sorted={sorted} data={data} headers={headers} totals={totals}
              multiByCity={multiByCity} multiTotals={multiTotals}
              gateItemOrder={gateItemOrder} gateHasData={gateHasData}
            />
          </div>
        </ExpandableSection>
      </CardHeader>
      <CardContent className="p-0 sm:p-6">
        <div className="overflow-x-auto">
          <RightsTable
            sorted={sorted} data={data} headers={headers} totals={totals}
            multiByCity={multiByCity} multiTotals={multiTotals}
            gateItemOrder={gateItemOrder} gateHasData={gateHasData}
          />
        </div>
      </CardContent>
    </Card>
  )
}
