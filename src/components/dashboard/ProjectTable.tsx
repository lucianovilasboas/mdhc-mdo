"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface ProjectRow {
  id: number
  name: string
  cities: string
  uf: string
  status: "ativo" | "implantacao"
  submissions: number
  agents: number
}

export function ProjectTable({ data, selectedProjectId }: { data: ProjectRow[]; selectedProjectId?: number }) {
  const rows = selectedProjectId ? data.filter((r) => r.id === selectedProjectId) : data

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Projetos</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Instituição</TableHead>
              <TableHead>Municípios</TableHead>
              <TableHead>UF</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Submissões</TableHead>
              <TableHead className="text-right">Agentes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((p) => (
              <TableRow key={p.id} className={selectedProjectId ? "bg-muted/50" : ""}>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell>{p.cities}</TableCell>
                <TableCell>{p.uf}</TableCell>
                <TableCell>
                  <Badge
                    variant={p.status === "ativo" ? "default" : "secondary"}
                    className={p.status === "ativo" ? "bg-green-600 text-white hover:bg-green-600" : ""}
                  >
                    {p.status === "ativo" ? "Ativo" : "Implantação"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">{p.submissions}</TableCell>
                <TableCell className="text-right">{p.agents}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
