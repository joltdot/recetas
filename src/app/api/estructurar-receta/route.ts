import { NextRequest, NextResponse } from "next/server"
import { checkRateLimit } from "@/lib/rate-limit"
import { structureRecipe } from "@/lib/claude"

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"

  const { allowed, remaining } = checkRateLimit(ip)
  if (!allowed) {
    return NextResponse.json(
      { error: "Demasiadas solicitudes. Espera un minuto e intenta de nuevo." },
      { status: 429, headers: { "X-RateLimit-Remaining": "0" } }
    )
  }

  let text: string
  try {
    const body = await req.json()
    text = body.text
  } catch {
    return NextResponse.json({ error: "Cuerpo de solicitud inválido" }, { status: 400 })
  }

  if (!text || typeof text !== "string" || text.trim().length < 10) {
    return NextResponse.json(
      { error: "El texto es demasiado corto. Describe la receta con más detalle." },
      { status: 400 }
    )
  }

  try {
    const structured = await structureRecipe(text.trim())
    return NextResponse.json(structured, {
      headers: { "X-RateLimit-Remaining": String(remaining) },
    })
  } catch (e) {
    console.error("Claude error:", e)
    return NextResponse.json(
      { error: "No se pudo estructurar la receta. Intenta de nuevo." },
      { status: 500 }
    )
  }
}
