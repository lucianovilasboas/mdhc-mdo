"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog, DialogContent, DialogTitle,
  DialogTrigger, DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Home, Maximize2, X } from "lucide-react"

interface CityMapStat {
  city: string
  uf: string
  submissions: number
  projectName: string
}

interface CityMapProps {
  data: CityMapStat[]
}

const CITY_COORDS: Record<string, [number, number]> = {
  "Corumbá": [-19.0077, -57.6514],
  "Bela Vista": [-22.1087, -56.5211],
  "Ivinhema": [-22.3043, -53.8189],
  "Fátima do Sul": [-22.3744, -54.5133],
  "Aquidauana": [-20.4711, -55.7872],
  "Coxim": [-18.5067, -54.76],
  "Naviraí": [-23.0619, -54.1994],
  "Ponta Porã": [-22.5361, -55.7256],
}

const DEFAULT_CENTER: [number, number] = [-20.5, -55.5]
const DEFAULT_ZOOM = 6

function MapRenderer({ data, mapKey, heightClass = "h-[400px]" }: { data: CityMapStat[]; mapKey?: number; heightClass?: string }) {
  const [MapComponents, setMapComponents] = useState<React.ReactNode | null>(null)

  useEffect(() => {
    async function loadMap() {
      const L = (await import("leaflet")).default
      await import("leaflet/dist/leaflet.css")

      const { MapContainer, TileLayer, Marker, Popup, useMap } = await import("react-leaflet")

      const icon = L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
      })

      const markers = data
        .filter((item) => CITY_COORDS[item.city])
        .map((item) => {
          const coords = CITY_COORDS[item.city]
          return (
            <Marker key={item.city} position={coords} icon={icon}>
              <Popup>
                <strong>{item.city}</strong><br />
                {item.projectName}<br />
                {item.submissions} submissões
              </Popup>
            </Marker>
          )
        })

      function MapResetter() {
        const map = useMap()
        return (
          <button
            onClick={() => map.setView(DEFAULT_CENTER, DEFAULT_ZOOM)}
            className="absolute top-24 right-2 z-[1000] bg-white rounded-md shadow-md border border-gray-200 p-1.5 hover:bg-gray-100 transition-colors"
            title="Redefinir visualização"
          >
            <Home className="h-4 w-4 text-gray-600" />
          </button>
        )
      }

      function MapInvalidator() {
        const map = useMap()
        useEffect(() => {
          const timer = setTimeout(() => map.invalidateSize(), 300)
          return () => clearTimeout(timer)
        }, [map])
        return null
      }

      setMapComponents(
        <div className={`relative ${heightClass}`}>
          <MapContainer center={DEFAULT_CENTER} zoom={DEFAULT_ZOOM} className="w-full h-full rounded-b-lg z-0">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {markers}
            <MapResetter />
            <MapInvalidator />
          </MapContainer>
        </div>
      )
    }
    loadMap()
  }, [data, mapKey, heightClass])

  return MapComponents || (
    <div className={`${heightClass} flex items-center justify-center text-muted-foreground`}>
      Carregando mapa...
    </div>
  )
}

export function CityMap({ data }: CityMapProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMapKey, setDialogMapKey] = useState(0)

  const handleOpenChange = useCallback((open: boolean) => {
    setDialogOpen(open)
    if (open) setDialogMapKey((k) => k + 1)
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Mapa dos Municípios</CardTitle>
      </CardHeader>
      <CardContent className="p-0 relative">
        <MapRenderer data={data} />
        <div className="absolute top-3 right-3 z-10">
          <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <Button variant="secondary" size="icon" className={`h-8 w-8 shadow-md ${dialogOpen ? "invisible" : ""}`}>
                <Maximize2 className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] max-h-[95vh]">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-xl">Mapa dos Municípios</DialogTitle>
                <DialogClose asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <X className="h-4 w-4" />
                  </Button>
                </DialogClose>
              </div>
              <div className="overflow-hidden flex-1" style={{ height: "calc(90vh - 80px)" }}>
                <MapRenderer key={dialogMapKey} data={data} heightClass="h-full" />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  )
}
