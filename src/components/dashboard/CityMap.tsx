"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog, DialogContent, DialogTitle,
  DialogTrigger, DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Home, Maximize2, X } from "lucide-react"
import { PALETA_CORES } from "@/types"
import type { MapPoint } from "@/types"
import "leaflet/dist/leaflet.css"
import "leaflet.markercluster/dist/MarkerCluster.css"
import "leaflet.markercluster/dist/MarkerCluster.Default.css"

type LeafletModule = typeof import("leaflet")
type UseMapHook = () => L.Map

const DEFAULT_CENTER: [number, number] = [-14.5, -52]
const DEFAULT_ZOOM = 4

interface CityMapProps {
  points: MapPoint[]
}

/* Agrupa os pontos em clusters e monta os markers (sem PII no popup). */
function ClusterLayer({ L, useMap, points }: { L: LeafletModule; useMap: UseMapHook; points: MapPoint[] }) {
  const map = useMap()

  useEffect(() => {
    const cluster = L.markerClusterGroup({
      maxClusterRadius: 45,
      showCoverageOnHover: false,
    })
    const markers = points.map((pt) => {
      const color = pt.form === "parte1" ? PALETA_CORES.azul : PALETA_CORES.verde
      const marker = L.circleMarker([pt.lat, pt.lon], {
        radius: 6,
        color: "#fff",
        weight: 1.5,
        fillColor: color,
        fillOpacity: 0.9,
      })
      const formLabel = pt.form === "parte1" ? "Cadastro (Parte 1)" : "Direitos (Parte 2)"
      const date = pt.data ? new Date(pt.data + "T12:00:00").toLocaleDateString("pt-BR") : ""
      const accuracy = pt.accuracy > 0 ? ` · precisão ~${pt.accuracy}m` : ""
      marker.bindPopup(
        `<strong>${pt.cidade || "Município não informado"}</strong>${pt.uf ? ` — ${pt.uf}` : ""}` +
        `${pt.bairro ? `<br/>${pt.bairro}` : ""}` +
        `<br/>${pt.projectName}<br/>${formLabel}${date ? ` · ${date}` : ""}${accuracy}`
      )
      return marker
    })
    cluster.addLayers(markers)
    map.addLayer(cluster)
    return () => {
      map.removeLayer(cluster)
    }
  }, [L, useMap, map, points])

  return null
}

function MapResetter({ useMap, center, zoom }: { useMap: UseMapHook; center: [number, number]; zoom: number }) {
  const map = useMap()
  return (
    <button
      onClick={() => map.setView(center, zoom)}
      className="absolute top-24 right-2 z-[1000] bg-background rounded-md shadow-md border border-border p-1.5 hover:bg-muted transition-colors"
      title="Redefinir visualização"
    >
      <Home className="h-4 w-4" />
    </button>
  )
}

function MapInvalidator({ useMap }: { useMap: UseMapHook }) {
  const map = useMap()
  useEffect(() => {
    const timer = setTimeout(() => map.invalidateSize(), 300)
    return () => clearTimeout(timer)
  }, [map])
  return null
}

function MapRenderer({ points, mapKey, heightClass = "h-[400px]" }: { points: MapPoint[]; mapKey?: number; heightClass?: string }) {
  const [MapComponents, setMapComponents] = useState<React.ReactNode | null>(null)

  useEffect(() => {
    let cancelled = false
    async function loadMap() {
      const L = (await import("leaflet")).default
      const { MapContainer, TileLayer, useMap } = await import("react-leaflet")
      await import("leaflet.markercluster")

      const elements = (
        <div className={`relative ${heightClass}`}>
          <MapContainer center={DEFAULT_CENTER} zoom={DEFAULT_ZOOM} className="w-full h-full rounded-b-lg z-0">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <ClusterLayer L={L} useMap={useMap} points={points} />
            <MapResetter useMap={useMap} center={DEFAULT_CENTER} zoom={DEFAULT_ZOOM} />
            <MapInvalidator useMap={useMap} />
          </MapContainer>
        </div>
      )
      if (!cancelled) setMapComponents(elements)
    }
    loadMap()
    return () => {
      cancelled = true
    }
  }, [points, mapKey, heightClass])

  return MapComponents || (
    <div className={`${heightClass} flex items-center justify-center text-muted-foreground`}>
      Carregando mapa...
    </div>
  )
}

export function CityMap({ points }: CityMapProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMapKey, setDialogMapKey] = useState(0)

  const handleOpenChange = useCallback((open: boolean) => {
    setDialogOpen(open)
    if (open) setDialogMapKey((k) => k + 1)
  }, [])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle className="text-lg">Mapa das Pessoas Idosas</CardTitle>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: PALETA_CORES.azul }} />
            Cadastro
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: PALETA_CORES.verde }} />
            Direitos
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-0 relative">
        <MapRenderer points={points} />
        <div className="absolute top-3 right-3 z-10">
          <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <Button variant="secondary" size="icon" className={`h-8 w-8 shadow-md ${dialogOpen ? "invisible" : ""}`}>
                <Maximize2 className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] max-h-[95vh]">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-xl">Mapa das Pessoas Idosas</DialogTitle>
                <DialogClose asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <X className="h-4 w-4" />
                  </Button>
                </DialogClose>
              </div>
              <div className="overflow-hidden flex-1" style={{ height: "calc(90vh - 80px)" }}>
                <MapRenderer key={dialogMapKey} points={points} heightClass="h-full" />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  )
}