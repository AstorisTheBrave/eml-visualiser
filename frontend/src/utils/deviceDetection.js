export function getDefaultPerformanceLevel() {
  const isMobile = /mobile/i.test(navigator.userAgent)
  const lowCPU   = navigator.hardwareConcurrency <= 2
  const lowMem   =
    navigator.deviceMemory !== undefined && navigator.deviceMemory < 4
  if (isMobile || lowCPU || lowMem) return "lite"
  return "balanced"
  // Full mode is never set automatically — user must opt in.
}
