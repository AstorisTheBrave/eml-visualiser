/**
 * Returns a debounced version of fn that delays execution
 * by `delay` ms after the last call.
 */
export function debounce(fn, delay) {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}
