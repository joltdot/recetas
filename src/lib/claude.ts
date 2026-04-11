import Anthropic from "@anthropic-ai/sdk"
import type { StructuredRecipe } from "@/types"

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `Eres un asistente de cocina. Dado un texto en español (transcripción de voz), extrae y devuelve SOLO un JSON válido con esta estructura exacta, sin texto adicional:
{
  "title": string,
  "description": string (1 oración),
  "ingredients": [{ "amount": string, "unit": string, "name": string }],
  "steps": [{ "order": number, "instruction": string }],
  "category": string (ej: postres, carnes, pastas, sopas, ensaladas, bebidas, otros),
  "prep_time": number (minutos, estimado),
  "servings": number
}
Si no puedes inferir un campo, usa null.`

export async function structureRecipe(transcribedText: string): Promise<StructuredRecipe> {
  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: transcribedText }],
  })

  const text = message.content[0].type === "text" ? message.content[0].text : ""
  // Strip potential markdown fences defensively
  const jsonText = text.replace(/^```(?:json)?\n?/, "").replace(/```$/, "").trim()
  return JSON.parse(jsonText) as StructuredRecipe
}
