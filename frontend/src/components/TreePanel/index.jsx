import { useState } from "react"
import TreeErrorBoundary from "./TreeErrorBoundary"
import TreeRenderer from "./TreeRenderer"

export default function TreePanel() {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <div className="flex-1 min-w-0">
      {/* Collapse toggle — only visible on mobile */}
      <button
        className="lg:hidden w-full flex items-center justify-between
                   bg-[#1a1d27] rounded-xl px-4 py-3 mb-2 text-sm
                   font-medium text-[#f8fafc] focus:outline-none
                   focus:ring-2 focus:ring-[#6366f1]"
        onClick={() => setIsOpen((o) => !o)}
        aria-expanded={isOpen}
      >
        <span>Expression Tree</span>
        <span aria-hidden="true">{isOpen ? "▲" : "▼"}</span>
      </button>

      <div className={isOpen ? "block" : "hidden lg:block"}>
        <TreeErrorBoundary>
          <TreeRenderer />
        </TreeErrorBoundary>
      </div>
    </div>
  )
}
