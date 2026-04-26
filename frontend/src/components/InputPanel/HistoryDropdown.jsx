import { useState, useEffect, useRef } from "react"
import { getHistory } from "../../utils/history"

export default function HistoryDropdown({ onSelect, onClose }) {
  // Read history once when dropdown mounts. Since this component
  // conditionally mounts, the initializer runs fresh on each open.
  const [history] = useState(() => getHistory())
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        onClose()
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [onClose])

  if (history.length === 0) {
    return (
      <div
        ref={ref}
        className="absolute top-full mt-1 left-0 right-12 z-20
                   bg-[#1a1d27] border border-[#252836] rounded-lg
                   px-4 py-3 text-xs text-[#94a3b8]"
      >
        No history yet.
      </div>
    )
  }

  return (
    <ul
      ref={ref}
      role="listbox"
      aria-label="Expression history"
      className="absolute top-full mt-1 left-0 right-12 z-20
                 bg-[#1a1d27] border border-[#252836] rounded-lg
                 overflow-hidden shadow-xl max-h-64 overflow-y-auto"
    >
      {history.map((item) => (
        <li key={item.timestamp}>
          <button
            role="option"
            aria-selected={false}
            onClick={() => onSelect(item.expression)}
            className="w-full text-left px-4 py-2.5 text-sm font-mono
                       text-[#f8fafc] hover:bg-[#252836] transition-colors
                       focus:outline-none focus:bg-[#252836]"
          >
            {item.expression}
          </button>
        </li>
      ))}
    </ul>
  )
}
