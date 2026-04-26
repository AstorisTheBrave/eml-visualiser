export default function About() {
  return (
    <section
      id="about"
      className="max-w-2xl mx-auto px-4 py-12 text-[#94a3b8] text-sm space-y-4"
    >
      <h2 className="text-lg font-semibold text-[#f8fafc]">
        About EML Visualiser
      </h2>
      <p>
        This tool visualises how any standard mathematical function can be
        expressed using a single binary operator:
      </p>
      <pre className="bg-[#1a1d27] rounded-lg px-4 py-3 text-[#f8fafc] font-mono text-sm overflow-x-auto">
        eml(x, y) = exp(x) &minus; ln(y)
      </pre>
      <p>
        Together with the constant 1, this operator reconstructs every function
        on a scientific calculator &mdash; from sine and cosine to square roots
        and logarithms. This is the continuous analogue of the NAND gate in
        digital logic.
      </p>
      <p>
        Enter any expression and the visualiser compiles it to pure EML form,
        then renders the resulting binary tree. Every internal node is an
        identical EML operation.
      </p>
      <p>
        The underlying compiler is taken directly from the research paper.
      </p>
      <p className="text-xs border-t border-[#252836] pt-4">
        <strong className="text-[#f8fafc]">Paper:</strong>{" "}
        <a
          href="https://arxiv.org/abs/2603.21852"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#6366f1] hover:underline"
        >
          "All elementary functions from a single operator"
        </a>
        <br />
        <strong className="text-[#f8fafc]">Author:</strong> Andrzej Odrzywolek,
        Institute of Theoretical Physics, Jagiellonian University (2026)
        <br />
        <strong className="text-[#f8fafc]">arXiv:</strong>{" "}
        <a
          href="https://arxiv.org/abs/2603.21852"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#6366f1] hover:underline"
        >
          2603.21852
        </a>
      </p>
    </section>
  )
}
