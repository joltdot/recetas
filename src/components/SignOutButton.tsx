"use client"

import { useState } from "react"
import { signOut } from "next-auth/react"
import Image from "next/image"

interface SignOutButtonProps {
  name?: string
  image?: string
  compact?: boolean
}

export default function SignOutButton({ name, image, compact = false }: SignOutButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
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
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          {/* Dropdown */}
          <div className="absolute right-0 top-12 z-50 bg-white rounded-2xl shadow-xl border border-stone-200 py-1 min-w-[160px]">
            {name && (
              <div className="px-4 py-2 border-b border-stone-100">
                <p className="text-xs text-stone-400">Conectado como</p>
                <p className="text-sm font-medium text-stone-700 truncate">{name}</p>
              </div>
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
  )
}
