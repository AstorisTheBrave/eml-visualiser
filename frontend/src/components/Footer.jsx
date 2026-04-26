export default function Footer() {
  return (
    <footer className="border-t border-[#252836] mt-16 px-4 py-6">
      <div className="max-w-7xl mx-auto text-center text-xs text-[#94a3b8] space-y-1">
        <p>
          Based on{" "}
          <a
            href="https://arxiv.org/abs/2603.21852"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#6366f1] hover:underline"
          >
            "All elementary functions from a single operator"
          </a>
        </p>
        <p>
          Andrzej Odrzywolek, Jagiellonian University (2026) &mdash; arXiv:2603.21852
        </p>
      </div>
    </footer>
  )
}
