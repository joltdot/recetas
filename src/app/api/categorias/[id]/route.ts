import { NextRequest, NextResponse } from "next/server"
import { db, schema } from "@/db"
import { eq } from "drizzle-orm"

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { color } = await req.json()

    const [updated] = await db
      .update(schema.categories)
      .set({ color: color ?? null })
      .where(eq(schema.categories.id, params.id))
      .returning()

    if (!updated) {
      return NextResponse.json({ error: "Categoría no encontrada" }, { status: 404 })
    }

    return NextResponse.json(updated)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
