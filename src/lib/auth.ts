import type { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"

const allowedEmails = (process.env.ALLOWED_EMAILS ?? "")
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
      if (!allowedEmails.length) return false
      return allowedEmails.includes(user.email?.toLowerCase() ?? "")
    },
  },
}
