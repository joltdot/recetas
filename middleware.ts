export { default } from "next-auth/middleware"

export const config = {
  matcher: [
    // Protect everything except Next.js internals, static assets, and PWA files
    "/((?!_next/static|_next/image|favicon.ico|manifest\\.json|icon-.*\\.png|sw\\.js|workbox-.*|auth/).*)",
  ],
}
