import { withAuth } from "next-auth/middleware"

export default withAuth({
  pages: {
    signIn: "/auth/signin",
  },
})

export const config = {
  matcher: [
    // Protect everything except Next.js internals, static assets, PWA files, and the auth pages themselves
    "/((?!_next/static|_next/image|favicon.ico|manifest\\.json|icon-.*\\.png|sw\\.js|workbox-.*|auth/).*)",
  ],
}
