import { NextRequest, NextResponse } from "next/server"
import Groq from "groq-sdk"

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

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

  // Groq SDK expects a File object with a name so it can infer the MIME type
  const file = new File([audio], "audio.webm", { type: audio.type || "audio/webm" })

  try {
    const transcription = await groq.audio.transcriptions.create({
      file,
      model: "whisper-large-v3-turbo",
      language: "es",
      response_format: "json",
    })

    return NextResponse.json({ text: transcription.text })
  } catch (e) {
    console.error("Groq Whisper error:", e)
    return NextResponse.json(
      { error: "No se pudo transcribir el audio. Intenta de nuevo." },
      { status: 500 }
    )
  }
}
