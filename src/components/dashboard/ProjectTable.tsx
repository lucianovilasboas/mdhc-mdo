"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChevronUp, ChevronDown } from "lucide-react"
import { PALETA_CORES } from "@/types"
import { cn } from "@/lib/utils"

interface ProjectRow {
  id: number
  name: string
  cities: string
  uf: string
  status: "ativo" | "implantacao"
  parte1: number
  parte2: number
  agents: number
  idosos: number
}

type SortKey = "name" | "cities" | "parte1" | "parte2" | "agents" | "idosos" | "total"
type SortDir = "asc" | "desc"

const SORTABLE_COLUMNS: { key: SortKey; label: string; align?: "right" }[] = [
  { key: "name", label: "Instituição" },
  { key: "cities", label: "Municípios" },
  { key: "parte1", label: "Form. 1", align: "right" },
  { key: "parte2", label: "Form. 2", align: "right" },
  { key: "agents", label: "Agentes", align: "right" },
  { key: "idosos", label: "Pessoas Idosas", align: "right" },
]

const MIDDLE_COLUMNS = ["UF", "Status"] as const

function sortValue(row: ProjectRow, key: SortKey): string | number {
  switch (key) {
    case "name": return row.name.toLowerCase()
    case "cities": return row.cities.toLowerCase()
    case "parte1": return row.parte1
    case "parte2": return row.parte2
    case "agents": return row.agents
    case "idosos": return row.idosos
    case "total": return row.parte1 + row.parte2
  }
}

export function ProjectTable({ data, selectedProjectId }: { data: ProjectRow[]; selectedProjectId?: number }) {
  const rows = selectedProjectId ? data.filter((r) => r.id === selectedProjectId) : data
  const [sortKey, setSortKey] = useState<SortKey>("total")
  const [sortDir, setSortDir] = useState<SortDir>("desc")

  const sorted = useMemo(() => {
    return [...rows].sort((a, b) => {
      const va = sortValue(a, sortKey)
      const vb = sortValue(b, sortKey)
      const cmp = typeof va === "string" && typeof vb === "string"
        ? va.localeCompare(vb, "pt-BR")
        : Number(va) - Number(vb)
      return sortDir === "asc" ? cmp : -cmp
    })
  }, [rows, sortKey, sortDir])

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortDir(key === "name" || key === "cities" ? "asc" : "desc")
    }
  }

  function SortHeader({ col }: { col: (typeof SORTABLE_COLUMNS)[number] }) {
    const active = col.key === sortKey
    return (
      <TableHead className={col.align === "right" ? "text-right" : undefined}>
        <button
          type="button"
          onClick={() => toggleSort(col.key)}
          className={cn(
            "inline-flex items-center gap-0.5 rounded transition-colors",
            col.align === "right" && "flex-row-reverse",
            active ? "font-semibold text-foreground" : "font-medium text-muted-foreground hover:text-foreground",
          )}
        >
          {col.label}
          {active && (sortDir === "asc" ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />)}
        </button>
      </TableHead>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Projetos</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              {SORTABLE_COLUMNS.slice(0, 2).map((col) => <SortHeader key={col.key} col={col} />)}
              {MIDDLE_COLUMNS.map((label) => (
                <TableHead key={label}>{label}</TableHead>
              ))}
              {SORTABLE_COLUMNS.slice(2).map((col) => <SortHeader key={col.key} col={col} />)}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((p) => (
              <TableRow key={p.id} className={selectedProjectId ? "bg-muted/50" : ""}>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell>{p.cities}</TableCell>
                <TableCell>{p.uf.toUpperCase()}</TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={p.status === "ativo" ? "border-transparent text-white" : ""}
                    style={p.status === "ativo" ? { backgroundColor: PALETA_CORES.verde } : undefined}
                  >
                    {p.status === "ativo" ? "Ativo" : "Implantação"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">{p.parte1}</TableCell>
                <TableCell className="text-right">{p.parte2}</TableCell>
                <TableCell className="text-right">{p.agents}</TableCell>
                <TableCell className="text-right">{p.idosos}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}