import type { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { db, schema } from "@/db"
import { eq } from "drizzle-orm"

const allowedEmailsList = (process.env.ALLOWED_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean)

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/auth/signin", error: "/auth/signin" },
  callbacks: {
    async signIn({ user }) {
      const email = user.email?.toLowerCase() ?? ""
      if (!email) return false

      // Admin is always allowed
      if (process.env.ADMIN_EMAIL && email === process.env.ADMIN_EMAIL.toLowerCase()) return true

      // Env var fallback (ALLOWED_EMAILS)
      if (allowedEmailsList.includes(email)) return true

      // DB-managed list
      try {
        const rows = await db
          .select()
          .from(schema.allowedEmails)
          .where(eq(schema.allowedEmails.email, email))
          .limit(1)
        return rows.length > 0
      } catch {
        return false
      }
    },
  },
}
