import { describe, it, expect } from "vitest"
import { formatResult } from "../utils/formatResult"

describe("formatResult", () => {
  it("returns null for null", () => {
    expect(formatResult(null)).toBeNull()
  })

  it("formats zero", () => {
    expect(formatResult(0)).toBe("0")
  })

  it("formats negative zero as zero", () => {
    expect(formatResult(-0)).toBe("0")
  })

  it("formats a simple number", () => {
    expect(formatResult(2.0)).toBe("2")
  })

  it("formats pi approximately", () => {
    expect(formatResult(Math.PI)).toMatch(/3\.14/)
  })

  it("uses exponential for large numbers", () => {
    expect(formatResult(1e20)).toMatch(/e\+/)
  })

  it("uses exponential for small numbers", () => {
    expect(formatResult(1e-10)).toMatch(/e-/)
  })

  it("formats complex result with positive imaginary part", () => {
    const result = formatResult({ real: 0, imag: 1 })
    expect(result).toContain("i")
    expect(result).toContain("+")
  })

  it("formats complex result with negative imaginary part", () => {
    const result = formatResult({ real: 1, imag: -1 })
    expect(result).toContain("\u2212")
  })

  it("returns undefined string for Infinity", () => {
    expect(formatResult(Infinity)).toBe("undefined")
  })

  it("returns undefined string for NaN", () => {
    expect(formatResult(NaN)).toBe("undefined")
  })
})
