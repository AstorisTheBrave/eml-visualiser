import { useCallback, useMemo } from "react"
import useStore from "../store/useStore"
import { addToHistory } from "../utils/history"
import { debounce } from "../utils/debounce"

const API_URL = import.meta.env.VITE_API_URL
const FETCH_TIMEOUT_MS = 15000

export function useCompute() {
  const {
    setRequestStatus,
    setResponse,
    setError,
    setVariableMeta,
    updateVariablesForNewExpression,
  } = useStore()

  // Invariant: compute reads ALL state via getState() at call time.
  // This means the callback never needs to be recreated and has
  // zero dependencies. Stale closure bugs are structurally impossible.
  const compute = useCallback(async () => {
    const { expression, variables, computeMode } = useStore.getState()

    if (!expression.trim()) return

    setRequestStatus("loading")

    const controller = new AbortController()
    const timeoutId  = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

    try {
      const res = await fetch(`${API_URL}/compute`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ expression, variables, mode: computeMode }),
        signal:  controller.signal,
      })
      clearTimeout(timeoutId)

      const body = await res.json()

      if (body.status === "error") {
        setError(body.error)
        return
      }

      const data = body.data
      const detected = data.variables_detected ?? []
      const meta     = data.variable_meta ?? {}

      if (data.variable_meta) {
        setVariableMeta(meta)
      }

      // Clamp carried-over variable values into the new domain. Snapshot
      // before/after so we know whether an existing value had to move.
      const before = useStore.getState().variables
      updateVariablesForNewExpression(detected, meta)
      const after = useStore.getState().variables

      setResponse({
        result:             data.result,
        eml:                data.eml,
        tree:               data.tree,
        complexity:         data.complexity,
        variables_detected: data.variables_detected,
      })

      addToHistory(expression)

      // If switching expressions clamped an existing value, the result we
      // just rendered was computed with the old (out-of-domain) value.
      // Recompute once with the clamped value — only in evaluate mode, and
      // only for values that actually changed (so this can't loop).
      const clamped = detected.some((v) => v in before && before[v] !== after[v])
      if (clamped && useStore.getState().computeMode === "evaluate") {
        compute()
      }
    } catch (err) {
      clearTimeout(timeoutId)
      if (err.name === "AbortError") {
        setError({
          code:    "TIMEOUT",
          message: "Server is warming up. Please try again in a moment.",
        })
        return
      }
      setError({
        code:    "INTERNAL_ERROR",
        message: "Could not reach the server. Please try again.",
      })
    }
  }, []) // Zero deps — getState() always reads current values.

  // Stable debounced variant for slider use.
  const debouncedCompute = useMemo(() => debounce(compute, 350), [compute])

  return { compute, debouncedCompute }
}
