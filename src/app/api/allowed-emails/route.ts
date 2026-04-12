import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db, schema } from "@/db"
import { asc } from "drizzle-orm"

function isAdmin(email?: string | null) {
  return !!email && !!process.env.ADMIN_EMAIL && email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase()
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }

  const rows = await db
    .select({ id: schema.allowedEmails.id, email: schema.allowedEmails.email, createdAt: schema.allowedEmails.createdAt })
    .from(schema.allowedEmails)
    .orderBy(asc(schema.allowedEmails.createdAt))

  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }

  const { email } = await req.json()
  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email inválido" }, { status: 400 })
  }

  const normalized = email.trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    return NextResponse.json({ error: "Email inválido" }, { status: 400 })
  }

  try {
    const [row] = await db
      .insert(schema.allowedEmails)
      .values({ email: normalized })
      .returning()
    return NextResponse.json(row, { status: 201 })
  } catch {
    return NextResponse.json({ error: "El email ya existe" }, { status: 409 })
  }
}
