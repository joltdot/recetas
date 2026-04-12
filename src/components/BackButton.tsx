"use client"

import { useRouter } from "next/navigation"

interface BackButtonProps {
  className?: string
  children: React.ReactNode
}

export default function BackButton({ className, children }: BackButtonProps) {
  const router = useRouter()

  function handleClick(e: React.MouseEvent) {
    if (!("startViewTransition" in document)) {
      router.push("/")
      return
    }

    document.documentElement.style.setProperty("--ripple-x", `${e.clientX}px`)
    document.documentElement.style.setProperty("--ripple-y", `${e.clientY}px`)

    document.documentElement.classList.add("vt-backward")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const transition = (document as any).startViewTransition(() => router.push("/"))
    transition.finished.finally(() => {
      document.documentElement.classList.remove("vt-backward")
      // Clear so the next forward transition always gets fresh coordinates from RippleLink
      document.documentElement.style.removeProperty("--ripple-x")
      document.documentElement.style.removeProperty("--ripple-y")
    })
  }

  return (
    <button type="button" onClick={handleClick} className={className}>
      {children}
    </button>
  )
}
