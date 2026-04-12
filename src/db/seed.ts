import { createPool } from "@vercel/postgres"
import { drizzle } from "drizzle-orm/vercel-postgres"
import { sql } from "drizzle-orm"
import * as schema from "./schema"

const CATEGORIES = [
  { name: "Postres",   slug: "postres",   color: "pink"   },
  { name: "Carnes",    slug: "carnes",    color: "red"    },
  { name: "Pastas",    slug: "pastas",    color: "yellow" },
  { name: "Sopas",     slug: "sopas",     color: "orange" },
  { name: "Ensaladas", slug: "ensaladas", color: "green"  },
  { name: "Bebidas",   slug: "bebidas",   color: "blue"   },
  { name: "Otros",     slug: "otros",     color: "stone"  },
]

async function main() {
  const pool = createPool({ connectionString: process.env.POSTGRES_URL })
  const db = drizzle(pool, { schema })

  console.log("Seeding categories...")
  for (const cat of CATEGORIES) {
    await db
      .insert(schema.categories)
      .values(cat)
      .onConflictDoUpdate({ target: schema.categories.slug, set: { color: sql`excluded.color` } })
  }
  console.log("Done! Inserted", CATEGORIES.length, "categories.")
  await pool.end()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
