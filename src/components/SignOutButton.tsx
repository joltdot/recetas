"use client"

import { useRef, useState } from "react"
import { signOut } from "next-auth/react"
import Image from "next/image"
import AllowedEmailsModal from "./AllowedEmailsModal"

interface SignOutButtonProps {
  name?: string
  image?: string
  compact?: boolean
  isAdmin?: boolean
}

export default function SignOutButton({ name, image, compact = false, isAdmin = false }: SignOutButtonProps) {
  const [open, setOpen] = useState(false)
  const [closing, setClosing] = useState(false)
  const [showEmails, setShowEmails] = useState(false)
  const clickPos = useRef({ x: 0, y: 0 })

  function close() {
    setClosing(true)
  }

  function openEmails() {
    close()
    // Wait for dropdown close animation before opening modal
    setTimeout(() => setShowEmails(true), 160)
  }

  return (
    <>
      <div className="relative">
        <button
          onClick={(e) => {
            if (open) { close(); return }
            clickPos.current = { x: e.clientX, y: e.clientY }
            setOpen(true)
          }}
          className="flex items-center gap-2 rounded-full active:opacity-70 transition-opacity min-h-[44px] min-w-[44px] justify-center"
          aria-label="Menú de usuario"
        >
          {image ? (
            <Image
              src={image}
              alt={name ?? "Usuario"}
              width={32}
              height={32}
              className="rounded-full border-2 border-stone-200"
            />
          ) : (
            <span className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-sm font-bold border-2 border-amber-200">
              {name?.[0]?.toUpperCase() ?? "U"}
            </span>
          )}
          {!compact && name && (
            <span className="text-sm text-stone-600 hidden md:block max-w-[120px] truncate">{name}</span>
          )}
        </button>

        {open && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-40" onClick={close} />
            {/* Dropdown */}
            <div
              ref={(el) => {
                if (!el) return
                const rect = el.getBoundingClientRect()
                el.style.transformOrigin = `${clickPos.current.x - rect.left}px ${clickPos.current.y - rect.top}px`
              }}
              onAnimationEnd={() => { if (closing) { setOpen(false); setClosing(false) } }}
              className={`${closing ? "animate-dropdown-close" : "animate-dropdown"} absolute right-0 top-12 z-50 bg-white rounded-2xl shadow-xl border border-stone-200 py-1 min-w-[180px]`}
            >
              {name && (
                <div className="px-4 py-2 border-b border-stone-100">
                  <p className="text-xs text-stone-400">Conectado como</p>
                  <p className="text-sm font-medium text-stone-700 truncate">{name}</p>
                </div>
              )}

              {isAdmin && (
                <button
                  onClick={openEmails}
                  className="w-full text-left px-4 py-3 text-sm text-stone-700 hover:bg-stone-50 active:bg-stone-50 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4 text-stone-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                  </svg>
                  Acceso permitido
                </button>
              )}

              <button
                onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 active:bg-red-50 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                </svg>
                Cerrar sesión
              </button>
            </div>
          </>
        )}
      </div>

      {showEmails && <AllowedEmailsModal onClose={() => setShowEmails(false)} />}
    </>
  )
}
