import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { OPERATION_DESCRIPTIONS } from "../../constants/operationDescriptions"

export default function NodeTooltip({ label, isInternal, subtreeStats, nodeRef }) {
  const [visible, setVisible] = useState(false)
  const [pos, setPos] = useState({ x: 0, y: 0 })

  const description = OPERATION_DESCRIPTIONS[label] ?? label

  useEffect(() => {
    const el = nodeRef?.current
    if (!el) return

    const show = () => {
      // SVG elements support getBoundingClientRect.
      const rect   = el.getBoundingClientRect()
      const tipW   = 210
      const tipH   = 90

      let x = rect.right + 10
      let y = rect.top

      // Avoid viewport edges
      if (x + tipW > window.innerWidth - 8)  x = rect.left - tipW - 10
      if (y + tipH > window.innerHeight - 8) y = window.innerHeight - tipH - 8
      if (y < 8)                             y = 8

      setPos({ x, y })
      setVisible(true)
    }

    const hide = () => setVisible(false)

    el.addEventListener("mouseenter", show)
    el.addEventListener("mouseleave", hide)
    return () => {
      el.removeEventListener("mouseenter", show)
      el.removeEventListener("mouseleave", hide)
    }
  }, [nodeRef])

  if (!visible) return null

  // createPortal renders HTML into document.body, never inside SVG.
  // This is the only correct architecture for HTML tooltips on SVG nodes.
  return createPortal(
    <div
      style={{ left: pos.x, top: pos.y }}
      className="fixed z-50 pointer-events-none w-[210px]
                 bg-[#0f1117] border border-[#252836] rounded-lg
                 px-3 py-2 text-xs shadow-xl"
    >
      <p className="font-mono font-bold text-[#f8fafc]">{label}</p>
      <p className="text-[#94a3b8] mt-0.5">{description}</p>
      {isInternal && subtreeStats && (
        <p className="text-[#6366f1] mt-1">
          {subtreeStats.nodes} nodes &middot; depth {subtreeStats.depth} &middot;{" "}
          {subtreeStats.leaves} leaves
        </p>
      )}
    </div>,
    document.body
  )
}
