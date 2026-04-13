import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db, schema } from "@/db"
import { eq, and } from "drizzle-orm"

async function getOwned(id: string, email: string) {
  const rows = await db
    .select({ id: schema.recipes.id, userId: schema.recipes.userId })
    .from(schema.recipes)
    .where(eq(schema.recipes.id, id))
    .limit(1)
  if (!rows.length) return null
  if (rows[0].userId !== email) return "forbidden"
  return rows[0]
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    const email = session?.user?.email
    if (!email) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

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
        audioUrl: schema.recipes.audioUrl,
        userId: schema.recipes.userId,
        createdAt: schema.recipes.createdAt,
        updatedAt: schema.recipes.updatedAt,
        category: {
          id: schema.categories.id,
          name: schema.categories.name,
          slug: schema.categories.slug,
          color: schema.categories.color,
          createdAt: schema.categories.createdAt,
        },
      })
      .from(schema.recipes)
      .leftJoin(schema.categories, eq(schema.recipes.categoryId, schema.categories.id))
      .where(and(eq(schema.recipes.id, params.id), eq(schema.recipes.userId, email)))
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
    const session = await getServerSession(authOptions)
    const email = session?.user?.email
    if (!email) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

    const owned = await getOwned(params.id, email)
    if (!owned) return NextResponse.json({ error: "Receta no encontrada" }, { status: 404 })
    if (owned === "forbidden") return NextResponse.json({ error: "No autorizado" }, { status: 403 })

    const body = await req.json()
    const { title, description, ingredients, steps, categoryId, prepTime, servings, source, audioUrl, transcript, images } = body

    if (!title || !ingredients || !steps) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 })
    }

    const [updated] = await db
      .update(schema.recipes)
      .set({ title, description, ingredients, steps, categoryId, prepTime, servings, source, audioUrl: audioUrl ?? null, transcript: transcript ?? null, images: images ?? [], updatedAt: new Date() })
      .where(and(eq(schema.recipes.id, params.id), eq(schema.recipes.userId, email)))
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
    const session = await getServerSession(authOptions)
    const email = session?.user?.email
    if (!email) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

    const owned = await getOwned(params.id, email)
    if (!owned) return NextResponse.json({ error: "Receta no encontrada" }, { status: 404 })
    if (owned === "forbidden") return NextResponse.json({ error: "No autorizado" }, { status: 403 })

    const [deleted] = await db
      .delete(schema.recipes)
      .where(and(eq(schema.recipes.id, params.id), eq(schema.recipes.userId, email)))
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
