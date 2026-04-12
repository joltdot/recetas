import { NextRequest, NextResponse } from "next/server"
import { db, schema } from "@/db"
import { eq } from "drizzle-orm"

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const rows = await db
      .select({
        id: schema.recipes.id,
        title: schema.recipes.title,
        description: schema.recipes.description,
        ingredients: schema.recipes.ingredients,
        steps: schema.recipes.steps,
        categoryId: schema.recipes.categoryId,
        prepTime: schema.recipes.prepTime,
        servings: schema.recipes.servings,
        source: schema.recipes.source,
        createdAt: schema.recipes.createdAt,
        updatedAt: schema.recipes.updatedAt,
        category: {
          id: schema.categories.id,
          name: schema.categories.name,
          slug: schema.categories.slug,
          createdAt: schema.categories.createdAt,
        },
      })
      .from(schema.recipes)
      .leftJoin(schema.categories, eq(schema.recipes.categoryId, schema.categories.id))
      .where(eq(schema.recipes.id, params.id))
      .limit(1)

    if (!rows.length) {
      return NextResponse.json({ error: "Receta no encontrada" }, { status: 404 })
    }

    return NextResponse.json(rows[0])
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const { title, description, ingredients, steps, categoryId, prepTime, servings, source, audioUrl, images } = body

    if (!title || !ingredients || !steps) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 })
    }

    const [updated] = await db
      .update(schema.recipes)
      .set({ title, description, ingredients, steps, categoryId, prepTime, servings, source, audioUrl: audioUrl ?? null, images: images ?? [], updatedAt: new Date() })
      .where(eq(schema.recipes.id, params.id))
      .returning()

    if (!updated) {
      return NextResponse.json({ error: "Receta no encontrada" }, { status: 404 })
    }

    return NextResponse.json(updated)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const [deleted] = await db
      .delete(schema.recipes)
      .where(eq(schema.recipes.id, params.id))
      .returning()

    if (!deleted) {
      return NextResponse.json({ error: "Receta no encontrada" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
