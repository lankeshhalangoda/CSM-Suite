"use client"

import { useTheme } from "next-themes"
import Image from "next/image"
import { useEffect, useState } from "react"

interface ThemeAwareLogoProps {
  width?: number
  height?: number
  className?: string
}

export function ThemeAwareLogo({ width = 150, height = 40, className = "h-10 w-auto" }: ThemeAwareLogoProps) {
  const { theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Return a placeholder or the default logo during SSR
    return (
      <Image
        src="/images/emojot-logo-black.png"
        alt="Emojot Logo"
        width={width}
        height={height}
        className={className}
      />
    )
  }

  const isDark = resolvedTheme === "dark"

  return (
    <Image
      src={isDark ? "/images/emojot-logo.png" : "/images/emojot-logo-black.png"}
      alt="Emojot Logo"
      width={width}
      height={height}
      className={className}
    />
  )
}
