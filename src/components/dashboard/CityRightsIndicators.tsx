"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ExpandableSection } from "@/components/ui/expandable-section"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import type { MultiSelectIndicator, CityMultiSelectEntry, CityRightsEntry } from "@/types"
import { RIGHTS_FIELDS } from "@/types"

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

interface MobileCardsProps {
  sorted: SortedRow[]
  data: CityRightsEntry[]
  totals: Record<string, { sim: number; total: number }>
  multiByCity: Record<string, Record<string, MultiSelectIndicator>> | null
  multiTotals: Record<string, { count: number; gateSim: number }> | null
  gateItemOrder: Record<string, { key: string; label: string }[]>
  gateHasData: Record<string, boolean>
}

/** Ordem canônica das violações — derivada da fonte única RIGHTS_FIELDS. */
const ROW_ORDER = RIGHTS_FIELDS.map(({ key, name }) => ({ key, name }))

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

function MobileCards({
  sorted, data, totals,
  multiByCity, multiTotals, gateItemOrder, gateHasData,
}: MobileCardsProps) {
  const rows = sorted.filter((row) => (totals[row.key]?.sim ?? 0) > 0)
  if (rows.length === 0) {
    return <p className="p-4 text-sm text-muted-foreground">Sem violações registradas.</p>
  }
  return (
    <div className="space-y-3 p-4">
      {rows.map((row) => {
        const rowTotal = totals[row.key]
        const totalSim = rowTotal?.sim ?? 0
        const totalPct = rowTotal && rowTotal.total > 0
          ? Math.round((rowTotal.sim / rowTotal.total) * 100)
          : 0
        const items = gateItemOrder[row.key] ?? []
        const hasItems = multiByCity != null && gateHasData[row.key]
        return (
          <div key={row.key} className="rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium">{row.name}</span>
              <span className="text-sm font-semibold tabular-nums">{totalSim} ({totalPct}%)</span>
            </div>
            <ul className="mt-2 space-y-1">
              {data.map((entry) => {
                const ind = entry.indicators.find((i) => i.key === row.key)
                const sim = ind?.sim ?? 0
                const pct = ind?.percentual ?? 0
                const label = entry.projectName ? `${entry.city} (${entry.projectName})` : entry.city
                return (
                  <li key={entry.city} className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
                    <span>{label}</span>
                    <span className="tabular-nums">{ind && ind.total > 0 ? `${sim} (${pct}%)` : "—"}</span>
                  </li>
                )
              })}
            </ul>
            {hasItems && (
              <div className="mt-3 border-t pt-2 text-xs text-muted-foreground">
                <p className="font-medium">Tipos:</p>
                <ul className="mt-1 space-y-0.5">
                  {items.map((item) => {
                    const mt = multiTotals?.[`${row.key}:${item.key}`]
                    return (
                      <li key={item.key} className="flex items-center justify-between gap-2">
                        <span>· {item.label}</span>
                        <span className="tabular-nums">
                          {mt && mt.gateSim > 0 ? `${mt.count} (${Math.round((mt.count / mt.gateSim) * 100)}%)` : "—"}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
          </div>
        )
      })}
    </div>
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
        <div className="md:hidden">
          <MobileCards
            sorted={sorted} data={data} totals={totals}
            multiByCity={multiByCity} multiTotals={multiTotals}
            gateItemOrder={gateItemOrder} gateHasData={gateHasData}
          />
        </div>
        <div className="hidden md:block overflow-x-auto">
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
