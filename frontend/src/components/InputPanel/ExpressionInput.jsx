import { useState, useRef, useEffect } from "react"
import useStore from "../../store/useStore"
import { useCompute } from "../../hooks/useCompute"
import HistoryDropdown from "./HistoryDropdown"

// Symbols treated as mathematical constants, not variables.
const RESERVED = new Set(["e", "pi"])

export default function ExpressionInput() {
  const { expression, setExpression, error, request } = useStore()
  const { compute } = useCompute()
  const [historyOpen, setHistoryOpen] = useState(false)
  const [debouncedExpr, setDebouncedExpr] = useState(expression)
  const inputRef = useRef(null)

  // Debounce the expression for warning purposes only.
  // Prevents flicker when user is mid-typing a function name.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedExpr(expression), 500)
    return () => clearTimeout(timer)
  }, [expression])

  // Check for standalone reserved tokens in the debounced expression.
  const reservedWarning = (() => {
    const tokens = (debouncedExpr.match(/\b([a-zA-Z]+)\b(?![a-zA-Z(])/g) || [])
    return tokens.find((t) => RESERVED.has(t.toLowerCase()))
  })()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (expression.trim()) compute()
  }

  // History selection populates input only — never auto-computes.
  const handleHistorySelect = (expr) => {
    setExpression(expr)
    setHistoryOpen(false)
    inputRef.current?.focus()
  }

  const isLoading = request.status === "loading"

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <label htmlFor="expression" className="sr-only">
          Mathematical expression
        </label>
        <div className="relative flex-1">
          <input
            id="expression"
            ref={inputRef}
            type="text"
            value={expression}
            onChange={(e) => setExpression(e.target.value)}
            placeholder="e.g. sin(x) + sqrt(2)"
            className="w-full bg-[#252836] text-[#f8fafc] rounded-lg
                       px-4 py-3 pr-10 font-mono text-sm border border-transparent
                       focus:outline-none focus:border-[#6366f1]
                       placeholder:text-[#94a3b8]"
            autoComplete="off"
            spellCheck={false}
            aria-describedby={error ? "expr-error" : undefined}
          />
          <button
            type="button"
            onClick={() => setHistoryOpen((o) => !o)}
            aria-label="Show expression history"
            className="absolute right-3 top-1/2 -translate-y-1/2
                       text-[#94a3b8] hover:text-[#f8fafc]
                       focus:outline-none focus:text-[#6366f1] text-base"
          >
            &#9201;
          </button>
        </div>
        <button
          type="submit"
          disabled={isLoading || !expression.trim()}
          className="px-5 py-3 bg-[#6366f1] text-white rounded-lg text-sm
                     font-medium hover:bg-[#5153cc] disabled:opacity-50
                     disabled:cursor-not-allowed focus:outline-none
                     focus:ring-2 focus:ring-[#6366f1] focus:ring-offset-2
                     focus:ring-offset-[#0f1117] transition-colors"
        >
          {isLoading ? "…" : "Compute"}
        </button>
      </form>

      {reservedWarning && (
        <p className="mt-1 text-xs text-[#f59e0b]">
          Note:{" "}
          <code className="font-mono">{reservedWarning}</code> is treated as a
          mathematical constant, not a variable.
        </p>
      )}

      {error && (
        <p id="expr-error" role="alert" className="mt-1 text-xs text-[#ef4444]">
          {error.message}
        </p>
      )}

      {historyOpen && (
        <HistoryDropdown
          onSelect={handleHistorySelect}
          onClose={() => setHistoryOpen(false)}
        />
      )}
    </div>
  )
}
