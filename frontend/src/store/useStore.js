import { create } from "zustand"

const useStore = create((set) => ({
  expression:       "",
  performanceLevel: "balanced",
  computeMode:      "symbolic",

  variables:    {},
  variableMeta: {},

  request: {
    status:      "idle",
    lastUpdated: null,
  },

  response: {
    result:             null,
    eml:                null,
    tree:               null,
    complexity:         null,
    variables_detected: [],
  },

  error: null,

  setExpression:       (expr)  => set({ expression: expr }),
  setPerformanceLevel: (level) => set({ performanceLevel: level }),
  setComputeMode:      (mode)  => set({ computeMode: mode }),

  setVariableValue: (name, value) =>
    set((state) => ({
      variables: { ...state.variables, [name]: value },
    })),

  setVariableMeta: (meta) => set({ variableMeta: meta }),

  setRequestStatus: (status) =>
    set((state) => ({
      request: { ...state.request, status, lastUpdated: Date.now() },
    })),

  setResponse: (data) =>
    set({
      response: data,
      error:    null,
      request:  { status: "ok", lastUpdated: Date.now() },
    }),

  setError: (error) =>
    set({
      error,
      request: { status: "error", lastUpdated: Date.now() },
    }),

  updateVariablesForNewExpression: (detected, meta = {}) =>
    set((state) => {
      const next = {}
      for (const v of detected) {
        let value = v in state.variables ? state.variables[v] : 0
        // Clamp carried-over (or default) values into the new
        // expression's domain so the slider value can't sit outside
        // its min/max after switching expressions.
        const domain = meta[v]
        if (domain) {
          value = Math.min(Math.max(value, domain.min), domain.max)
        }
        next[v] = value
      }
      return { variables: next }
    }),
}))

export default useStore
