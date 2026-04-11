"use client"

import type { Step } from "@/types"

interface StepEditorProps {
  steps: Step[]
  onChange: (steps: Step[]) => void
}

export default function StepEditor({ steps, onChange }: StepEditorProps) {
  function updateInstruction(index: number, instruction: string) {
    const updated = steps.map((s, i) => (i === index ? { ...s, instruction } : s))
    onChange(updated)
  }

  function remove(index: number) {
    onChange(
      steps
        .filter((_, i) => i !== index)
        .map((s, i) => ({ ...s, order: i + 1 }))
    )
  }

  function move(index: number, direction: "up" | "down") {
    const swapIdx = direction === "up" ? index - 1 : index + 1
    if (swapIdx < 0 || swapIdx >= steps.length) return
    const updated = [...steps]
    ;[updated[index], updated[swapIdx]] = [updated[swapIdx], updated[index]]
    onChange(updated.map((s, i) => ({ ...s, order: i + 1 })))
  }

  function add() {
    onChange([...steps, { order: steps.length + 1, instruction: "" }])
  }

  return (
    <div className="space-y-2">
      {steps.map((step, i) => (
        <div key={i} className="flex gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200">
          <span className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm mt-1">
            {step.order}
          </span>
          <textarea
            value={step.instruction}
            onChange={(e) => updateInstruction(i, e.target.value)}
            placeholder={`Paso ${step.order}...`}
            rows={2}
            className="input flex-1 resize-none"
            required
            aria-label={`Instrucción del paso ${step.order}`}
          />
          <div className="flex flex-col gap-1 shrink-0">
            <button
              type="button"
              onClick={() => move(i, "up")}
              disabled={i === 0}
              className="btn-ghost p-2 min-h-0 disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label={`Mover paso ${step.order} arriba`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => move(i, "down")}
              disabled={i === steps.length - 1}
              className="btn-ghost p-2 min-h-0 disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label={`Mover paso ${step.order} abajo`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => remove(i)}
              className="btn-ghost text-red-400 p-2 min-h-0"
              aria-label={`Eliminar paso ${step.order}`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="btn-secondary w-full"
      >
        + Agregar paso
      </button>
    </div>
  )
}
