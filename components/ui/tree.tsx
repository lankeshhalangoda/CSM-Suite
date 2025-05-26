"use client"

// Add a new Tree component for displaying hierarchical data
import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronRight } from "lucide-react"

interface TreeProps {
  children: React.ReactNode
  className?: string
}

export function Tree({ children, className }: TreeProps) {
  return <div className={cn("space-y-1", className)}>{children}</div>
}

interface TreeItemProps {
  id: string
  label: string
  children: React.ReactNode
  defaultOpen?: boolean
  className?: string
}

export function TreeItem({ id, label, children, defaultOpen = false, className }: TreeItemProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen)

  return (
    <div className={cn("", className)}>
      <div
        className="flex items-center gap-2 py-1 cursor-pointer hover:bg-muted/50 rounded px-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <ChevronRight className={cn("h-4 w-4 transition-transform", isOpen && "transform rotate-90")} />
        <span className="text-sm">{label}</span>
      </div>
      {isOpen && <div className="pl-6 border-l border-muted ml-2 mt-1">{children}</div>}
    </div>
  )
}
