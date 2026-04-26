export function formatResult(result) {
  if (result === null || result === undefined) return null

  if (typeof result === "number") {
    if (!Number.isFinite(result)) return "undefined"
    if (result === 0 || Object.is(result, -0)) return "0"
    const abs = Math.abs(result)
    if (abs >= 1e-6 && abs < 1e15) {
      return parseFloat(result.toPrecision(8)).toString()
    }
    return result.toExponential(6)
  }

  if (typeof result === "object" && "real" in result) {
    const fmt = (n) => {
      if (n === 0) return "0"
      const abs = Math.abs(n)
      if (abs >= 1e-6 && abs < 1e15) {
        return parseFloat(n.toPrecision(6)).toString()
      }
      return n.toExponential(4)
    }
    const r    = fmt(result.real)
    const i    = fmt(Math.abs(result.imag))
    const sign = result.imag >= 0 ? "+" : "\u2212"
    return `${r} ${sign} ${i}i`
  }

  return "undefined"
}
