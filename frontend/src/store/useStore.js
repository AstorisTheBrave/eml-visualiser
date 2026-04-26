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

  updateVariablesForNewExpression: (detected) =>
    set((state) => {
      const next = {}
      for (const v of detected) {
        next[v] = v in state.variables ? state.variables[v] : 0
      }
      return { variables: next }
    }),
}))

export default useStore
