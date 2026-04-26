import { useEffect, useRef, useState } from "react"
import { readExpressionFromURL, writeExpressionToURL } from "./utils/urlState"
import { getDefaultPerformanceLevel } from "./utils/deviceDetection"
import useStore from "./store/useStore"
import { useCompute } from "./hooks/useCompute"
import Header from "./components/Header"
import Footer from "./components/Footer"
import About from "./components/About"
import ModeToggle from "./components/ModeToggle"
import EvaluateModeToggle from "./components/EvaluateModeToggle"
import InputPanel from "./components/InputPanel/index"
import TreePanel from "./components/TreePanel/index"
import OutputPanel from "./components/OutputPanel/index"

export default function App() {
  const { expression, setExpression, setPerformanceLevel } = useStore()
  const { compute } = useCompute()

  // Prevents URL-based auto-compute from firing more than once.
  const hasAutoComputed = useRef(false)

  // pendingCompute drives auto-compute via useEffect rather than
  // setTimeout, avoiding stale closure issues entirely.
  const [pendingCompute, setPendingCompute] = useState(false)

  // On mount: restore performance level and read URL expression.
  useEffect(() => {
    const saved = localStorage.getItem("performanceLevel")
    setPerformanceLevel(saved || getDefaultPerformanceLevel())

    const urlExpr = readExpressionFromURL()
    if (urlExpr && !hasAutoComputed.current) {
      hasAutoComputed.current = true
      setExpression(urlExpr)
      setPendingCompute(true)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Fires after setExpression has propagated to store.
  // compute reads expression via getState() so no stale closure.
  useEffect(() => {
    if (pendingCompute && expression) {
      setPendingCompute(false)
      compute()
    }
  }, [pendingCompute, expression, compute])

  // Keep URL in sync with expression state.
  useEffect(() => {
    writeExpressionToURL(expression)
  }, [expression])

  return (
    <div className="min-h-screen bg-[#0f1117] text-[#f8fafc]">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-4">
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <ModeToggle />
          <EvaluateModeToggle />
        </div>
        <InputPanel />
        <div className="flex flex-col lg:flex-row gap-4">
          <TreePanel />
          <OutputPanel />
        </div>
        <About />
      </main>
      <Footer />
    </div>
  )
}
