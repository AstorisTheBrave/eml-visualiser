import { describe, it, expect, beforeEach } from "vitest"
import useStore from "../store/useStore"

describe("updateVariablesForNewExpression", () => {
  beforeEach(() => {
    useStore.setState({ variables: {} })
  })

  it("clamps a carried-over value down into the new domain", () => {
    useStore.setState({ variables: { x: 8 } })
    useStore.getState().updateVariablesForNewExpression(["x"], {
      x: { min: -1, max: 1, step: 0.01 },
    })
    expect(useStore.getState().variables.x).toBe(1)
  })

  it("leaves an in-domain value unchanged", () => {
    useStore.setState({ variables: { x: 0.5 } })
    useStore.getState().updateVariablesForNewExpression(["x"], {
      x: { min: -1, max: 1, step: 0.01 },
    })
    expect(useStore.getState().variables.x).toBe(0.5)
  })

  it("clamps the default 0 up to a domain minimum above zero", () => {
    useStore.getState().updateVariablesForNewExpression(["x"], {
      x: { min: 1, max: 10, step: 0.1 },
    })
    expect(useStore.getState().variables.x).toBe(1)
  })

  it("drops variables that are no longer present", () => {
    useStore.setState({ variables: { x: 0.5, y: 2 } })
    useStore.getState().updateVariablesForNewExpression(["x"], {})
    expect(useStore.getState().variables).toEqual({ x: 0.5 })
  })
})
