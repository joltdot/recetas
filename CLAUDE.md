# Prompt: Web App de Recetas con Grabación de Audio e IA

## Contexto del Proyecto

Crea una web app moderna y sencilla para guardar recetas de cocina en español. La app permite crear, editar, eliminar y organizar recetas por categorías. La función estrella es la **grabación de audio**: el usuario puede hablar y un LLM transcribe y estructura automáticamente la receta.

---

## Stack Técnico (Vercel)

| Capa | Herramienta | Justificación |
|---|---|---|
| Framework | Next.js 14 (App Router) | Deploy nativo en Vercel, API routes integradas |
| Base de datos | Vercel Postgres (Neon) | Serverless, sin servidor propio |
| ORM | Drizzle ORM | Ligero, type-safe, sin boilerplate |
| Auth | NextAuth.js | Simple, compatible con Vercel |
| LLM (transcripción + estructura) | Claude API (`claude-haiku-3`) | Rápido y económico para estructurar texto |
| Audio a texto | Web Speech API (browser nativo) | Sin costo, sin servidor extra |
| Estilos | Tailwind CSS | Productividad y consistencia visual |
| Estado del cliente | Zustand | Mínimo, sin Redux overhead |

> **Nota sobre tokens**: Se usa `claude-haiku-3` para mantener costos bajos. El prompt al LLM incluye solo el texto transcrito (no el audio), lo que minimiza el uso de tokens. Se evita enviar contexto innecesario.

---

## Estructura de la Base de Datos

```sql
-- Tabla de categorías
categories (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
)

-- Tabla de recetas
recipes (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  ingredients JSONB NOT NULL,   -- [{ amount, unit, name }]
  steps JSONB NOT NULL,          -- [{ order, instruction }]
  category_id UUID REFERENCES categories(id),
  prep_time INT,                 -- minutos
  servings INT,
  source TEXT,                   -- "manual" | "audio"
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)
```

---

## Páginas y Rutas

```
/                        → Lista de recetas (con filtro por categoría)
/receta/nueva            → Formulario: crear receta (manual o audio)
/receta/[id]             → Vista detalle de receta
/receta/[id]/editar      → Editar receta existente
/api/recetas             → CRUD de recetas
/api/categorias          → CRUD de categorías
/api/estructurar-receta  → Recibe texto transcrito → devuelve JSON estructurado
```

---

## Flujo de Grabación de Audio

```
1. Usuario presiona "Grabar" en la UI
2. Browser Web Speech API transcribe voz → texto en tiempo real
3. Usuario termina de hablar y presiona "Procesar"
4. Se envía SOLO el texto a /api/estructurar-receta (no audio)
5. API llama a Claude Haiku con prompt compacto
6. Claude devuelve JSON { title, description, ingredients, steps, category, prep_time, servings }
7. UI pre-rellena el formulario con los datos estructurados
8. Usuario revisa, ajusta si es necesario, y guarda
```

---

## Prompt para la API de Estructuración (`/api/estructurar-receta`)

```
system: "Eres un asistente de cocina. Dado un texto en español (transcripción de voz), extrae y devuelve SOLO un JSON válido con esta estructura exacta, sin texto adicional:
{
  \"title\": string,
  \"description\": string (1 oración),
  \"ingredients\": [{ \"amount\": string, \"unit\": string, \"name\": string }],
  \"steps\": [{ \"order\": number, \"instruction\": string }],
  \"category\": string (ej: postres, carnes, pastas, sopas, ensaladas, bebidas, otros),
  \"prep_time\": number (minutos, estimado),
  \"servings\": number
}
Si no puedes inferir un campo, usa null."

user: "[TEXTO TRANSCRITO AQUÍ]"
```

> **Optimización de tokens**: El system prompt es fijo y compacto. El user message es solo el texto crudo. Sin historial de conversación, sin contexto extra. Cada llamada es independiente.

---

## Categorización Inteligente

- Claude infiere la categoría directamente del texto de la receta.
- Las categorías predefinidas son: `postres`, `carnes`, `pastas`, `sopas`, `ensaladas`, `bebidas`, `otros`.
- El usuario puede sobreescribir la categoría sugerida antes de guardar.
- No se necesita un modelo separado para clasificar — se hace en la misma llamada.

---

## Componentes UI Principales

```
<RecipeList />          → Grid de tarjetas con filtro por categoría
<RecipeCard />          → Tarjeta: título, categoría, tiempo, porciones
<RecipeForm />          → Formulario unificado (manual + resultado de audio)
<AudioRecorder />       → Botón grabar/detener + transcript en tiempo real
<IngredientEditor />    → Lista editable de ingredientes (add/remove/edit)
<StepEditor />          → Lista editable de pasos (drag-to-reorder)
<CategoryFilter />      → Pills para filtrar por categoría
```

---

## Consideraciones de Implementación

- **Sin autenticación compleja**: Puede arrancar con un solo usuario o auth básica con Google via NextAuth. Agregar multi-usuario es una extensión futura.
- **Web Speech API**: Solo funciona en Chrome y Edge. Para Safari, mostrar fallback de "escribe la receta a mano".
- **Sin almacenamiento de audio**: El audio nunca se guarda — solo el texto transcrito. Esto simplifica privacidad y storage.
- **Vercel Blob** (opcional): Si en el futuro se quieren agregar fotos de las recetas.
- **Rate limiting**: En `/api/estructurar-receta`, agregar un límite simple (ej. 10 llamadas/minuto por IP) para controlar costos de API.

---

## Orden de Desarrollo Sugerido

1. Setup Next.js + Tailwind + Vercel Postgres + Drizzle
2. CRUD básico de recetas (solo manual, sin audio)
3. Filtro por categorías
4. Componente `<AudioRecorder />` con Web Speech API
5. Endpoint `/api/estructurar-receta` + integración con Claude Haiku
6. Conectar audio → formulario pre-rellenado
7. Polish de UI y manejo de errores
