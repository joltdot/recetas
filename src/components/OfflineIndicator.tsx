"use client"

import { useState, useEffect } from "react"

export default function OfflineIndicator() {
  const [online, setOnline] = useState(true)

  useEffect(() => {
    // Set initial state from browser
    setOnline(navigator.onLine)

    function goOnline() { setOnline(true) }
    function goOffline() { setOnline(false) }

    window.addEventListener("online", goOnline)
    window.addEventListener("offline", goOffline)
    return () => {
      window.removeEventListener("online", goOnline)
      window.removeEventListener("offline", goOffline)
    }
  }, [])

  if (online) return null

  return (
    <div
      className="fixed top-0 inset-x-0 z-40 bg-stone-800 text-white text-center text-xs font-medium py-1.5"
      style={{ paddingTop: "max(env(safe-area-inset-top, 0px), 6px)" }}
      role="status"
      aria-live="polite"
    >
      Sin conexión &mdash; algunos contenidos podrían no estar disponibles
    </div>
  )
}
