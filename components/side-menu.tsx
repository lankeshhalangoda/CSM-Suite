"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SideMenuProps {
  sections: { id: string; label: string }[]
  currentSection: string
  onSectionChange: (section: string) => void
}

const SideMenu: React.FC<SideMenuProps> = ({ sections, currentSection, onSectionChange }) => {
  return (
    <div className="space-y-1">
      <h3 className="font-semibold mb-4">Workflow Sections</h3>
      {sections.map((section) => (
        <Button
          key={section.id}
          variant="ghost"
          className={cn("w-full justify-start", currentSection === section.id && "bg-muted font-medium")}
          onClick={() => onSectionChange(section.id)}
        >
          {section.label}
        </Button>
      ))}
    </div>
  )
}

export default SideMenu
