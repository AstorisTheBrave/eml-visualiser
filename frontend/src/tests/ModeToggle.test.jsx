import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import ModeToggle from "../components/ModeToggle"

const mockSetPerformanceLevel = vi.fn()

vi.mock("../store/useStore", () => ({
  default: vi.fn(() => ({
    performanceLevel:    "balanced",
    setPerformanceLevel: mockSetPerformanceLevel,
  })),
}))

describe("ModeToggle", () => {
  it("renders all three mode buttons", () => {
    render(<ModeToggle />)
    expect(screen.getByText("lite")).toBeTruthy()
    expect(screen.getByText("balanced")).toBeTruthy()
    expect(screen.getByText("full")).toBeTruthy()
  })

  it("marks the active mode as pressed", () => {
    render(<ModeToggle />)
    const balancedBtn = screen.getByText("balanced")
    expect(balancedBtn.getAttribute("aria-pressed")).toBe("true")
  })

  it("calls setPerformanceLevel on click", () => {
    render(<ModeToggle />)
    fireEvent.click(screen.getByText("lite"))
    expect(mockSetPerformanceLevel).toHaveBeenCalledWith("lite")
  })
})
