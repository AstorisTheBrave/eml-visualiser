import useStore from "../../store/useStore"

const STAT_TOOLTIPS = {
  nodes:  "Total EML operations in the expression tree",
  depth:  "Longest path from root to leaf",
  leaves: "Number of constants and variables",
}

export default function ComplexityStats() {
  const { response } = useStore()
  const c = response.complexity
  if (!c) return null

  return (
    <div>
      <h3 className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-2">
        Complexity
      </h3>
      <div className="grid grid-cols-3 gap-2">
        {[
          { key: "nodes",  value: c.nodes,  label: "Nodes"  },
          { key: "depth",  value: c.depth,  label: "Depth"  },
          { key: "leaves", value: c.leaves, label: "Leaves" },
        ].map(({ key, value, label }) => (
          <div key={key} className="relative group bg-[#0f1117] rounded-lg px-3 py-2 text-center">
            {/* Screen reader description */}
            <span className="sr-only">{STAT_TOOLTIPS[key]}</span>

            <p className="text-lg font-mono font-bold text-[#6366f1]">{value}</p>
            <p className="text-xs text-[#94a3b8]">{label}</p>

            {/* Visual hover tooltip — aria-hidden so screen readers use sr-only */}
            <div
              aria-hidden="true"
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-44
                         text-center bg-[#0f1117] border border-[#252836] rounded
                         px-2 py-1 text-xs text-[#94a3b8] opacity-0
                         group-hover:opacity-100 transition-opacity
                         pointer-events-none z-10 hidden sm:block"
            >
              {STAT_TOOLTIPS[key]}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
