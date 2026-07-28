"use client"

import { useState } from "react"
import { Maximize2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface ExpandableSectionProps {
  title: string
  children: React.ReactNode
}

export function ExpandableSection({ title, children }: ExpandableSectionProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
          {open ? <X className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] max-h-[95vh]">
        <div className="flex items-center justify-between">
          <DialogTitle className="text-xl">{title}</DialogTitle>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="overflow-auto flex-1" style={{ height: "calc(90vh - 80px)" }}>
          {children}
        </div>
      </DialogContent>
    </Dialog>
  )
}
