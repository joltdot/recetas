import type { Metadata, Viewport } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import Link from "next/link"
import RippleLink from "@/components/RippleLink"
import { UtensilsCrossed } from "lucide-react"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import AuthProvider from "@/components/AuthProvider"
import InstallBanner from "@/components/InstallBanner"
import SignOutButton from "@/components/SignOutButton"
import NavLink from "@/components/NavLink"
import OfflineIndicator from "@/components/OfflineIndicator"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
})

export const metadata: Metadata = {
  title: "Recetas",
  description: "Guarda tus recetas de cocina con inteligencia artificial",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Recetas",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    apple: "/apple-touch-icon.png",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f59e0b" },
    { media: "(prefers-color-scheme: dark)", color: "#f59e0b" },
  ],
}

function isAdmin(email?: string | null) {
  return !!email && !!process.env.ADMIN_EMAIL && email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase()
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  const admin = isAdmin(session?.user?.email)

  return (
    <html lang="es" className={`${inter.variable} ${playfair.variable}`}>
      <body className="antialiased min-h-screen flex flex-col">
        <AuthProvider>
          <OfflineIndicator />
          {/* Desktop top nav */}
          <header className="hidden sm:flex sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-stone-200">
            <div className="max-w-3xl mx-auto w-full px-4 flex items-center justify-between h-14">
              <Link href="/" className="text-amber-600" aria-label="Recetas">
                <UtensilsCrossed size={28} strokeWidth={1.8} aria-hidden="true" />
              </Link>
              <div className="flex items-center gap-3">
                <RippleLink href="/receta/nueva" pageTransition transitionType="slide" rippleColor="bg-white/30" className="btn-primary text-sm px-4 py-2 min-h-0">
                  + Nueva Receta
                </RippleLink>
                {session?.user && (
                  <SignOutButton
                    name={session.user.name ?? undefined}
                    image={session.user.image ?? undefined}
                    isAdmin={admin}
                  />
                )}
              </div>
            </div>
          </header>

          {/* Main content */}
          <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6 mb-nav">
            {children}
          </main>

          <InstallBanner />

          {/* Mobile bottom tab bar */}
          <nav className="sm:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-stone-200 pb-safe">
            <div className="flex">
              <NavLink href="/">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                </svg>
                <span className="text-[10px] font-medium">Inicio</span>
              </NavLink>
              <NavLink href="/receta/nueva" transitionType="slide">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                <span className="text-[10px] font-medium">Nueva</span>
              </NavLink>
            </div>
          </nav>
        </AuthProvider>
      </body>
    </html>
  )
}
