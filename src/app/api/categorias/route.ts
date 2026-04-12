import { NextRequest, NextResponse } from "next/server"
import { db, schema } from "@/db"
import { asc } from "drizzle-orm"

export async function GET() {
  try {
    const cats = await db
      .select()
      .from(schema.categories)
      .orderBy(asc(schema.categories.name))

    return NextResponse.json(cats)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, slug, color } = await req.json()
    if (!name || !slug) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 })
    }

    const [category] = await db
      .insert(schema.categories)
      .values({ name, slug, color: color ?? null })
      .returning()

    return NextResponse.json(category, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
