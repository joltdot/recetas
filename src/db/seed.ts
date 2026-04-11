import { createPool } from "@vercel/postgres"
import { drizzle } from "drizzle-orm/vercel-postgres"
import * as schema from "./schema"

const CATEGORIES = [
  { name: "Postres", slug: "postres" },
  { name: "Carnes", slug: "carnes" },
  { name: "Pastas", slug: "pastas" },
  { name: "Sopas", slug: "sopas" },
  { name: "Ensaladas", slug: "ensaladas" },
  { name: "Bebidas", slug: "bebidas" },
  { name: "Otros", slug: "otros" },
]

async function main() {
  const pool = createPool({ connectionString: process.env.POSTGRES_URL })
  const db = drizzle(pool, { schema })

  console.log("Seeding categories...")
  for (const cat of CATEGORIES) {
    await db
      .insert(schema.categories)
      .values(cat)
      .onConflictDoNothing()
  }
  console.log("Done! Inserted", CATEGORIES.length, "categories.")
  await pool.end()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
