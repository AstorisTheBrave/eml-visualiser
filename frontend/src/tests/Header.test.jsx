import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import Header from "../components/Header"

describe("Header", () => {
  it("renders the app title", () => {
    render(<Header />)
    expect(screen.getByText("EML Visualiser")).toBeTruthy()
  })

  it("renders the About link pointing to #about", () => {
    render(<Header />)
    const link = screen.getByRole("link", { name: /about/i })
    expect(link.getAttribute("href")).toBe("#about")
  })

  it("renders the subtitle", () => {
    render(<Header />)
    expect(screen.getByText(/elementary functions/i)).toBeTruthy()
  })
})
