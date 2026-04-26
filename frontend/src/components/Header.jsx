export default function Header() {
  return (
    <header className="border-b border-[#252836] px-4 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#f8fafc] tracking-tight">
            EML Visualiser
          </h1>
          <p className="text-xs text-[#94a3b8] mt-0.5">
            Elementary functions from a single operator
          </p>
        </div>
        <a
          href="#about"
          className="text-sm text-[#6366f1] hover:underline focus:outline-none focus:underline"
        >
          About
        </a>
      </div>
    </header>
  )
}
