import { describe, it, expect, beforeEach } from "vitest"
import { getHistory, addToHistory } from "../utils/history"

beforeEach(() => {
  localStorage.clear()
})

describe("history", () => {
  it("returns empty array when no history", () => {
    expect(getHistory()).toEqual([])
  })

  it("adds an entry", () => {
    addToHistory("sin(x)")
    const h = getHistory()
    expect(h).toHaveLength(1)
    expect(h[0].expression).toBe("sin(x)")
  })

  it("deduplicates and moves to top", () => {
    addToHistory("sin(x)")
    addToHistory("cos(x)")
    addToHistory("sin(x)")
    const h = getHistory()
    expect(h[0].expression).toBe("sin(x)")
    expect(h).toHaveLength(2)
  })

  it("caps at 10 entries", () => {
    for (let i = 0; i < 15; i++) {
      addToHistory(`expr${i}`)
    }
    expect(getHistory()).toHaveLength(10)
  })

  it("ignores blank expressions", () => {
    addToHistory("   ")
    expect(getHistory()).toHaveLength(0)
  })

  it("stores timestamp", () => {
    addToHistory("exp(x)")
    const h = getHistory()
    expect(h[0].timestamp).toBeTypeOf("number")
  })
})
