import useStore from "../../store/useStore"

export default function EMLString() {
  const { response } = useStore()
  if (!response.eml) return null

  return (
    <div>
      <h3 className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-2">
        EML Form
      </h3>
      <div className="bg-[#0f1117] rounded-lg px-3 py-2 overflow-x-auto">
        <pre className="font-mono text-xs text-[#f8fafc] whitespace-pre">
          {response.eml}
        </pre>
      </div>
    </div>
  )
}
