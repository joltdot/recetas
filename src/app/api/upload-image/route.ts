import { NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"

export async function POST(req: NextRequest) {
  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 })
  }

  const image = formData.get("image")
  if (!image || !(image instanceof Blob)) {
    return NextResponse.json({ error: "No se recibió imagen" }, { status: 400 })
  }

  const ext = image.type.includes("png") ? "png" : image.type.includes("webp") ? "webp" : "jpg"
  const filename = `recetas/img-${Date.now()}.${ext}`

  try {
    const blob = await put(filename, image, {
      access: "public",
      contentType: image.type || "image/jpeg",
    })

    return NextResponse.json({ url: blob.url })
  } catch (e) {
    console.error("Vercel Blob image upload error:", e)
    return NextResponse.json({ error: "No se pudo subir la imagen" }, { status: 500 })
  }
}
