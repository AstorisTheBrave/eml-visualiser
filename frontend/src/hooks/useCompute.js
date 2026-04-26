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

      if (data.variable_meta) {
        setVariableMeta(data.variable_meta)
      }

      updateVariablesForNewExpression(data.variables_detected ?? [])

      setResponse({
        result:             data.result,
        eml:                data.eml,
        tree:               data.tree,
        complexity:         data.complexity,
        variables_detected: data.variables_detected,
      })

      addToHistory(expression)
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
