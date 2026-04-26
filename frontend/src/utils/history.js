const HISTORY_KEY = "eml_history"
const MAX_ENTRIES = 10

export function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []
  } catch {
    return []
  }
}

export function addToHistory(expression) {
  if (!expression.trim()) return
  let history = getHistory().filter((e) => e.expression !== expression)
  history.unshift({ expression, timestamp: Date.now() })
  history = history.slice(0, MAX_ENTRIES)
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
}
