import { Component } from "react"

export default class TreeErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error("TreeRenderer crashed:", error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center bg-[#1a1d27] rounded-xl min-h-64 w-full">
          <p className="text-[#94a3b8] text-sm">
            Tree rendering failed. Try a different expression.
          </p>
        </div>
      )
    }
    return this.props.children
  }
}
