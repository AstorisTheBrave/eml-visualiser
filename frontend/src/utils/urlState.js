export function readExpressionFromURL() {
  const params = new URLSearchParams(window.location.search)
  return params.get("expr") || ""
}

export function writeExpressionToURL(expression) {
  const params = new URLSearchParams(window.location.search)
  if (expression) {
    params.set("expr", expression)
  } else {
    params.delete("expr")
  }
  const query = params.toString()
  window.history.replaceState({}, "", query ? `?${query}` : "/")
}
