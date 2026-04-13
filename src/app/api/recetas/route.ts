import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db, schema } from "@/db"
import { eq, desc } from "drizzle-orm"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const email = session?.user?.email
    if (!email) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const categoria = searchParams.get("categoria")

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
      .where(eq(schema.recipes.userId, email))
      .orderBy(desc(schema.recipes.createdAt))

    const filtered = categoria
      ? rows.filter((r) => r.category?.slug === categoria)
      : rows

    return NextResponse.json(filtered)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const email = session?.user?.email
    if (!email) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

    const body = await req.json()
    const { title, description, ingredients, steps, categoryId, prepTime, servings, source, audioUrl, transcript, images } = body

    if (!title || !ingredients || !steps) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 })
    }

    const [recipe] = await db
      .insert(schema.recipes)
      .values({
        title,
        description,
        ingredients,
        steps,
        categoryId,
        prepTime,
        servings,
        source: source ?? "manual",
        audioUrl: audioUrl ?? null,
        transcript: transcript ?? null,
        images: images ?? [],
        userId: email,
      })
      .returning()

    return NextResponse.json(recipe, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
