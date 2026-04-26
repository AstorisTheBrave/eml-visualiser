import { useState } from "react"
import useStore from "../../store/useStore"
import ResultDisplay from "./ResultDisplay"
import EMLString from "./EMLString"
import ComplexityStats from "./ComplexityStats"

export default function OutputPanel() {
  const { response, request, computeMode } = useStore()
  const [isOpen, setIsOpen] = useState(true)

  // Show panel once we have received any response.
  // Invariant: never unmount during loading — fade instead.
  const hasContent   = response.eml !== null
  const isLoading    = request.status === "loading"
  const hasVariables = (response.variables_detected ?? []).length > 0
  const showResult   =
    computeMode === "evaluate" ||
    (!hasVariables && response.result !== null)

  if (!hasContent) return null

  return (
    <div className="w-full lg:w-80 flex-shrink-0">
      {/* Mobile collapse toggle */}
      <button
        className="lg:hidden w-full flex items-center justify-between
                   bg-[#1a1d27] rounded-xl px-4 py-3 mb-2 text-sm
                   font-medium text-[#f8fafc] focus:outline-none
                   focus:ring-2 focus:ring-[#6366f1]"
        onClick={() => setIsOpen((o) => !o)}
        aria-expanded={isOpen}
      >
        <span>Output</span>
        <span aria-hidden="true">{isOpen ? "▲" : "▼"}</span>
      </button>

      <div
        className={isOpen ? "block" : "hidden lg:block"}
        style={{
          opacity:    isLoading ? 0.4 : 1,
          transition: "opacity 0.2s",
        }}
      >
        <div className="bg-[#1a1d27] rounded-xl p-4 space-y-4">
          <ResultDisplay showResult={showResult} hasVariables={hasVariables} />
          <EMLString />
          <ComplexityStats />
        </div>
      </div>
    </div>
  )
}
