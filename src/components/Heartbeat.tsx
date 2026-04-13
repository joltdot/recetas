"use client"

import { useEffect } from "react"

export default function Heartbeat() {
  useEffect(() => {
    const ping = () => fetch("/api/presence", { method: "POST" })
    ping()
    window.addEventListener("focus", ping)
    const id = setInterval(ping, 60_000)
    return () => {
      clearInterval(id)
      window.removeEventListener("focus", ping)
    }
  }, [])

  return null
}
