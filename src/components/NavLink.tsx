"use client"

import { usePathname } from "next/navigation"
import RippleLink from "./RippleLink"

interface NavLinkProps {
  href: string
  transitionType?: "reveal" | "slide"
  children: React.ReactNode
}

export default function NavLink({ href, transitionType, children }: NavLinkProps) {
  const pathname = usePathname()
  // Exact match for "/" ; prefix match for other routes
  const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href)

  return (
    <RippleLink
      href={href}
      rippleColor="bg-amber-400"
      pageTransition
      transitionType={transitionType}
      className={`flex-1 flex flex-col items-center justify-center py-3 gap-0.5 min-h-[56px] transition-colors ${
        isActive ? "text-amber-600" : "text-stone-400"
      }`}
    >
      {children}
    </RippleLink>
  )
}
