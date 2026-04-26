import useStore from "../store/useStore"

const LEVELS = ["lite", "balanced", "full"]

export default function ModeToggle() {
  const { performanceLevel, setPerformanceLevel } = useStore()

  const handleChange = (level) => {
    setPerformanceLevel(level)
    localStorage.setItem("performanceLevel", level)
  }

  return (
    <div
      role="group"
      aria-label="Performance mode"
      className="flex items-center gap-1 bg-[#1a1d27] rounded-lg p-1"
    >
      {LEVELS.map((level) => (
        <button
          key={level}
          onClick={() => handleChange(level)}
          className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize
            transition-colors focus:outline-none focus:ring-2 focus:ring-[#6366f1]
            focus:ring-offset-1 focus:ring-offset-[#1a1d27]
            ${
              performanceLevel === level
                ? "bg-[#6366f1] text-white"
                : "text-[#94a3b8] hover:text-[#f8fafc]"
            }`}
          aria-pressed={performanceLevel === level}
        >
          {level}
        </button>
      ))}
    </div>
  )
}
