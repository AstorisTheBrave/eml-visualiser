import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import EMLString from "../components/OutputPanel/EMLString"

vi.mock("../store/useStore", () => ({
  default: vi.fn(() => ({
    response: { eml: "EML[1,1]" },
  })),
}))

describe("EMLString", () => {
  it("renders the EML string", () => {
    render(<EMLString />)
    expect(screen.getByText("EML[1,1]")).toBeTruthy()
  })

  it("renders the section heading", () => {
    render(<EMLString />)
    expect(screen.getByText(/eml form/i)).toBeTruthy()
  })
})
