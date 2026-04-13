import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db, schema } from "@/db"
import { desc } from "drizzle-orm"

function isAdmin(email?: string | null) {
  return !!email && !!process.env.ADMIN_EMAIL && email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase()
}

export async function POST() {
  const session = await getServerSession(authOptions)
  const email = session?.user?.email
  if (!email) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  await db
    .insert(schema.userPresence)
    .values({
      email: email.toLowerCase(),
      name: session.user?.name ?? null,
      image: session.user?.image ?? null,
      lastSeenAt: new Date(),
    })
    .onConflictDoUpdate({
      target: schema.userPresence.email,
      set: {
        name: session.user?.name ?? null,
        image: session.user?.image ?? null,
        lastSeenAt: new Date(),
      },
    })

  return NextResponse.json({ ok: true })
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }

  const rows = await db
    .select()
    .from(schema.userPresence)
    .orderBy(desc(schema.userPresence.lastSeenAt))

  return NextResponse.json(rows)
}
