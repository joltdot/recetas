import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db, schema } from "@/db"
import { eq } from "drizzle-orm"

function isAdmin(email?: string | null) {
  return !!email && !!process.env.ADMIN_EMAIL && email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase()
}

export async function DELETE(_req: NextRequest, { params }: { params: { email: string } }) {
  const session = await getServerSession(authOptions)
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }

  const email = decodeURIComponent(params.email).toLowerCase()

  const [deleted] = await db
    .delete(schema.allowedEmails)
    .where(eq(schema.allowedEmails.email, email))
    .returning()

  if (!deleted) {
    return NextResponse.json({ error: "Email no encontrado" }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}
