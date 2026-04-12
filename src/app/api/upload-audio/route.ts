import { NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"

export async function POST(req: NextRequest) {
  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 })
  }

  const audio = formData.get("audio")
  if (!audio || !(audio instanceof Blob)) {
    return NextResponse.json({ error: "No se recibió audio" }, { status: 400 })
  }

  const ext = audio.type.includes("mp4") ? "mp4" : "webm"
  const filename = `recetas/audio-${Date.now()}.${ext}`

  try {
    const blob = await put(filename, audio, {
      access: "public",
      contentType: audio.type || "audio/webm",
    })

    return NextResponse.json({ url: blob.url })
  } catch (e) {
    console.error("Vercel Blob upload error:", e)
    return NextResponse.json({ error: "No se pudo guardar el audio" }, { status: 500 })
  }
}
