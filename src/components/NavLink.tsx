"use client"

import RippleLink from "./RippleLink"

interface NavLinkProps {
  href: string
  children: React.ReactNode
}

export default function NavLink({ href, children }: NavLinkProps) {
  return (
    <RippleLink
      href={href}
      rippleColor="bg-amber-400"
      className="flex-1 flex flex-col items-center justify-center py-3 gap-0.5 text-stone-500 min-h-[56px]"
    >
      {children}
    </RippleLink>
  )
}
