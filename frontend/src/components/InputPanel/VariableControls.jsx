import useStore from "../../store/useStore"
import { useCompute } from "../../hooks/useCompute"

export default function VariableControls() {
  const { response, variables, variableMeta, computeMode, setVariableValue } =
    useStore()
  const { debouncedCompute } = useCompute()

  const detected = response.variables_detected ?? []
  if (detected.length === 0) return null

  const handleChange = (name, rawValue) => {
    const value = Number(rawValue)
    setVariableValue(name, value)
    // Only auto-recompute in evaluate mode.
    // debouncedCompute reads state via getState() so it always
    // sees the updated value set by setVariableValue above.
    if (computeMode === "evaluate") {
      debouncedCompute()
    }
  }

  return (
    <div className="bg-[#1a1d27] rounded-lg p-4 space-y-4">
      {detected.map((name) => {
        const meta = variableMeta[name] ?? {
          min: -10,
          max: 10,
          step: 0.1,
          approximate: true,
        }
        const current = variables[name] ?? 0
        // valid is a frontend computation from the detected domain range.
        const valid = current >= meta.min && current <= meta.max

        return (
          <div key={name} className="space-y-1">
            <div className="flex items-center justify-between">
              <label
                htmlFor={`var-${name}`}
                className="text-sm font-mono text-[#f8fafc]"
              >
                {name} ={" "}
                <span className="text-[#6366f1]">{current}</span>
              </label>
              {meta.approximate && (
                <span className="text-xs text-[#94a3b8]">
                  approximate range
                </span>
              )}
            </div>
            <input
              id={`var-${name}`}
              type="range"
              min={meta.min}
              max={meta.max}
              step={meta.step}
              value={current}
              onChange={(e) => handleChange(name, e.target.value)}
              className="w-full accent-[#6366f1]"
            />
            <div className="flex justify-between text-xs text-[#94a3b8]">
              <span>{meta.min}</span>
              <span>{meta.max}</span>
            </div>
            {!valid && (
              <p role="alert" className="text-xs text-[#ef4444]">
                Value outside valid domain
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}
