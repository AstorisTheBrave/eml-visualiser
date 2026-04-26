import { useEffect, useRef } from "react"
import { hierarchy, tree } from "d3-hierarchy"
import { zoom as d3zoom } from "d3-zoom"
import { select } from "d3-selection"
import useStore from "../../store/useStore"
import { NODE_GEOMETRY } from "../../constants/nodeGeometry"
import { COLORS } from "../../constants/colors"
import NodeTooltip from "./NodeTooltip"

// Annotate every node with subtree stats in a single O(N) pass.
// Called once after layout — never inside the render loop.
function annotateSubtreeStats(node) {
  if (!node.children || node.children.length === 0) {
    node.subtreeStats = { nodes: 1, depth: 0, leaves: 1 }
    return
  }
  annotateSubtreeStats(node.children[0])
  annotateSubtreeStats(node.children[1])
  const l = node.children[0].subtreeStats
  const r = node.children[1].subtreeStats
  node.subtreeStats = {
    nodes:  1 + l.nodes  + r.nodes,
    depth:  1 + Math.max(l.depth, r.depth),
    leaves: l.leaves + r.leaves,
  }
}

// Stable key from root-path — avoids React index key issues on tree change.
function buildKey(node) {
  const parts = []
  let cur = node
  while (cur.parent) {
    parts.unshift(cur.parent.children[0] === cur ? "L" : "R")
    cur = cur.parent
  }
  return parts.join("") || "root"
}

function computeArcPath(r) {
  const arcR     = r * NODE_GEOMETRY.arcRadiusFactor
  const startRad = (NODE_GEOMETRY.arcStartAngle * Math.PI) / 180
  const endRad   = (NODE_GEOMETRY.arcEndAngle   * Math.PI) / 180
  const x1 = arcR * Math.cos(startRad)
  const y1 = arcR * Math.sin(startRad)
  const x2 = arcR * Math.cos(endRad)
  const y2 = arcR * Math.sin(endRad)
  return {
    path:     `M ${x1} ${y1} A ${arcR} ${arcR} 0 0 1 ${x2} ${y2}`,
    tipX:     x2,
    tipY:     y2,
    tipAngle: endRad,
  }
}

function arrowPoints(tipX, tipY, angle) {
  const len  = NODE_GEOMETRY.arrowLength
  const wid  = NODE_GEOMETRY.arrowWidth / 2
  const b1x  = tipX - len * Math.cos(angle) + wid * Math.sin(angle)
  const b1y  = tipY - len * Math.sin(angle) - wid * Math.cos(angle)
  const b2x  = tipX - len * Math.cos(angle) - wid * Math.sin(angle)
  const b2y  = tipY - len * Math.sin(angle) + wid * Math.cos(angle)
  return `${tipX},${tipY} ${b1x},${b1y} ${b2x},${b2y}`
}

export default function TreeRenderer() {
  const { response, request, performanceLevel } = useStore()
  const svgRef    = useRef(null)
  const isLoading = request.status === "loading"
  const isIdle    = request.status === "idle"
  const geom      = NODE_GEOMETRY[performanceLevel]

  // d3-zoom for Full mode only
  useEffect(() => {
    if (performanceLevel !== "full" || !svgRef.current) return
    const svgEl        = select(svgRef.current)
    const zoomBehavior = d3zoom()
      .scaleExtent([0.2, 4])
      .on("zoom", (event) => {
        svgEl.select("g.zoom-root").attr("transform", event.transform.toString())
      })
    svgEl.call(zoomBehavior)
    return () => svgEl.on(".zoom", null)
  }, [performanceLevel])

  if (isIdle) {
    return (
      <div className="flex items-center justify-center bg-[#1a1d27] rounded-xl min-h-64 w-full">
        <p className="text-[#94a3b8] text-sm">Enter an expression to begin</p>
      </div>
    )
  }

  // Invariant: keep previous tree visible during loading — never blank.
  if (!response.tree) {
    return (
      <div className="flex items-center justify-center bg-[#1a1d27] rounded-xl min-h-64 w-full">
        <p className="text-[#94a3b8] text-sm">
          {isLoading ? "Computing\u2026" : "No tree to display"}
        </p>
      </div>
    )
  }

  const root = hierarchy(
    response.tree,
    (d) => d.type === "internal" ? [d.left, d.right] : null
  )
  const treeLayout = tree().nodeSize(NODE_GEOMETRY.nodeSize)
  treeLayout(root)
  annotateSubtreeStats(root)

  // Swap x/y for left-to-right orientation (paper style)
  const allNodes = root.descendants()
  allNodes.forEach((n) => {
    n.lx = n.y
    n.ly = n.x
  })

  const xs  = allNodes.map((n) => n.lx)
  const ys  = allNodes.map((n) => n.ly)
  const pad = geom.radius * 4
  const minX = Math.min(...xs) - pad
  const maxX = Math.max(...xs) + pad
  const minY = Math.min(...ys) - pad
  const maxY = Math.max(...ys) + pad

  return (
    <div
      className="bg-[#1a1d27] rounded-xl overflow-auto w-full relative"
      style={{
        maxHeight:  "600px",
        minHeight:  "200px",
        opacity:    isLoading ? 0.4 : 1,
        transition: "opacity 0.2s",
      }}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <p className="text-[#94a3b8] text-sm">Computing\u2026</p>
        </div>
      )}
      <svg
        ref={svgRef}
        viewBox={`${minX} ${minY} ${maxX - minX} ${maxY - minY}`}
        className="w-full"
        aria-label="EML expression tree"
      >
        <g className="zoom-root">
          {/* Branch lines — link.source/target have lx/ly set directly */}
          {root.links().map((link) => (
            <line
              key={`link-${buildKey(link.source)}-${buildKey(link.target)}`}
              x1={link.source.lx} y1={link.source.ly}
              x2={link.target.lx} y2={link.target.ly}
              stroke={COLORS.branchLines}
              strokeWidth={NODE_GEOMETRY.branchStrokeWidth}
            />
          ))}

          {/* Nodes — stable keys from root-path */}
          {allNodes.map((node) => (
            <EMLNode
              key={buildKey(node)}
              node={node}
              geom={geom}
              performanceLevel={performanceLevel}
            />
          ))}
        </g>
      </svg>
    </div>
  )
}

function EMLNode({ node, geom, performanceLevel }) {
  const nodeRef = useRef(null)
  const r       = geom.radius
  const isLeaf  = node.data.type === "leaf"
  const label   = node.data.label
  const { path, tipX, tipY, tipAngle } = computeArcPath(r)
  const dotX = r + NODE_GEOMETRY.outputDotRadius

  return (
    // role="group" for child nodes — not role="img" (would be invalid nested)
    <g
      ref={nodeRef}
      transform={`translate(${node.lx},${node.ly})`}
      role="group"
      aria-label={`${label} node, subtree depth ${node.subtreeStats?.depth ?? 0}`}
    >
      <circle
        r={r}
        fill="transparent"
        stroke={COLORS.nodeStroke}
        strokeWidth={NODE_GEOMETRY.strokeWidth}
      />

      {!isLeaf && (
        <>
          <path
            d={path}
            fill="none"
            stroke={COLORS.nodeStroke}
            strokeWidth={NODE_GEOMETRY.strokeWidth}
          />
          <polygon
            points={arrowPoints(tipX, tipY, tipAngle)}
            fill={COLORS.nodeStroke}
          />
          <circle
            cx={dotX} cy={0}
            r={NODE_GEOMETRY.outputDotRadius}
            fill={COLORS.nodeStroke}
          />
        </>
      )}

      <text
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={geom.fontSize}
        fill={COLORS.textPrimary}
        fontFamily="monospace"
        style={{ userSelect: "none" }}
      >
        {label}
      </text>

      {/* NodeTooltip uses createPortal internally —
          HTML output goes to document.body, never inside SVG */}
      {performanceLevel !== "lite" && (
        <NodeTooltip
          label={label}
          isInternal={!isLeaf}
          subtreeStats={node.subtreeStats}
          nodeRef={nodeRef}
        />
      )}
    </g>
  )
}
