import useStore from "../store/useStore"
import { useCompute } from "../hooks/useCompute"

const MODES = [
  { value: "symbolic", label: "Symbolic" },
  { value: "evaluate", label: "Evaluate" },
]

export default function EvaluateModeToggle() {
  const { computeMode, setComputeMode } = useStore()
  const { compute } = useCompute()

  const handleChange = (mode) => {
    setComputeMode(mode)
    // Recompute immediately when switching to evaluate mode.
    // compute() reads computeMode via getState() which is already
    // updated because Zustand set() is synchronous.
    if (mode === "evaluate") {
      const { expression, response } = useStore.getState()
      if (expression && response.eml) {
        compute()
      }
    }
  }

  return (
    <div
      role="group"
      aria-label="Computation mode"
      className="flex items-center gap-1 bg-[#1a1d27] rounded-lg p-1"
    >
      {MODES.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => handleChange(value)}
          className={`px-3 py-1.5 rounded-md text-xs font-medium
            transition-colors focus:outline-none focus:ring-2 focus:ring-[#6366f1]
            focus:ring-offset-1 focus:ring-offset-[#1a1d27]
            ${
              computeMode === value
                ? "bg-[#6366f1] text-white"
                : "text-[#94a3b8] hover:text-[#f8fafc]"
            }`}
          aria-pressed={computeMode === value}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
