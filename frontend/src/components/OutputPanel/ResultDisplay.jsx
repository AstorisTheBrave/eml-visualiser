import useStore from "../../store/useStore"
import { formatResult } from "../../utils/formatResult"

export default function ResultDisplay({ showResult, hasVariables }) {
  const { response } = useStore()

  return (
    <div>
      <h3 className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-2">
        Result
      </h3>
      {showResult ? (
        <p className="font-mono text-lg text-[#f8fafc]">
          {formatResult(response.result) ?? "undefined"}
        </p>
      ) : (
        <p className="text-xs text-[#94a3b8]">
          {hasVariables
            ? "Set variable values and switch to Evaluate mode"
            : "No result"}
        </p>
      )}
    </div>
  )
}
