# EML Visualiser

Visualise any elementary mathematical function as a binary tree built entirely from a single operator.

## Attribution

This project is based on the research paper:

> **"All elementary functions from a single operator"**
> Andrzej Odrzywolek, Institute of Theoretical Physics, Jagiellonian University, Kraków, Poland
> arXiv:2603.21852v2 [cs.SC] — April 2026
> https://arxiv.org/abs/2603.21852

The EML (Exp-Minus-Log) operator is defined as:

```
eml(x, y) = exp(x) − ln(y)
```

Together with the constant 1, this single binary operator generates the entire standard repertoire of elementary functions — sin, cos, sqrt, log, and all arithmetic operations. This visualiser compiles any expression to pure EML form and renders the resulting binary tree.

The compiler (`backend/eml_compiler_v4.py`) is taken directly from the paper's open-source repository:
https://github.com/VA00/SymbolicRegressionPackage

---

## Project Structure

```
eml-visualiser/
├── backend/          # FastAPI Python backend
│   ├── main.py
│   ├── eml_compiler_v4.py   # from arXiv:2603.21852
│   ├── routes/
│   ├── services/
│   ├── models/
│   └── tests/
└── frontend/         # React + Vite frontend
    ├── src/
    │   ├── components/
    │   ├── hooks/
    │   ├── store/
    │   ├── utils/
    │   └── constants/
    └── public/
```

---

## Local Development

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

The API runs at `http://localhost:8000`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

---

## Running Tests

### Backend

```bash
cd backend
pytest
```

### Frontend

```bash
cd frontend
npm test
```

---

## Deployment

The whole app — frontend **and** backend — runs on a single Vercel project
using Vercel **Services** (`experimentalServices`). The Vite frontend and the
FastAPI backend are built as two services that share one domain, so there is no
separate backend host and no CORS to configure (the frontend calls the API
same-origin under `/api`).

### Vercel (Services)

`vercel.json` declares both services:

```json
{
  "experimentalServices": {
    "frontend": { "root": "frontend", "routePrefix": "/" },
    "backend":  { "root": "backend",  "routePrefix": "/api" }
  }
}
```

- **frontend** (`root: frontend`, `/`) — Vercel detects Vite and serves the
  static build as the catch-all.
- **backend** (`root: backend`, `/api`) — Vercel detects FastAPI and runs
  `backend/main.py` (the `app` instance). Requests to `/api/*` are routed here.

To deploy, import the repository, set the project **Framework Preset** to
**Services**, and deploy. No `ALLOWED_ORIGINS` is needed because both services
share one origin.

`frontend/.env.production` sets `VITE_API_URL=/api`, so the production frontend
calls `/api/compute` on the same domain. `backend/main.py` mounts the compute
router at both `/compute` (local dev) and `/api/compute` (Vercel), so it works
whether or not Vercel strips the `/api` route prefix. Local development keeps
using `http://localhost:8000` via `frontend/.env.development`.

#### Notes

- Rate limiting (`slowapi`) and the in-memory response cache live in the backend
  service's memory. With Fluid compute they are best-effort across instances —
  fine for correctness, but for strict global limits/cache use a shared store
  (e.g. Vercel KV / Upstash Redis).
- The FastAPI service is one bundle and must fit Vercel's 500 MB function limit.
  SymPy is the heavy dependency but fits comfortably.

### Alternative: separate backend host

If you prefer to run the backend elsewhere (e.g. Render with
`uvicorn main:app --host 0.0.0.0 --port 8000`), set `ALLOWED_ORIGINS` on the
backend to your frontend origin and point `frontend/.env.production`'s
`VITE_API_URL` at the backend URL instead of `/api`.

---

## Features

- Compile any elementary expression to pure EML form
- Render the resulting binary tree faithfully matching the paper's Figure 2
- Three performance modes: Lite / Balanced / Full
- Variable support with adaptive domain detection
- Symbolic and evaluate modes
- Expression history (localStorage)
- URL state (shareable links via `?expr=...`)
- Mobile responsive with collapsible panels
- Full attribution to the original paper

---

## Supported input

The compiler accepts any expression that the v4 pipeline can rewrite into
`exp`/`log`/powers. Function names are **case-insensitive** and a single `=`
is read as `lhs - rhs` (root form).

- **Arithmetic / powers:** `+ - * /`, `^` or `**`, implicit multiplication (`2x`).
- **Roots & misc:** `sqrt`, `cbrt`, `abs` (real magnitude, i.e. `sqrt(x^2)`),
  `exp`, `log` (natural; `log(z, b)` for base *b*), `ln`.
- **Trig:** `sin cos tan cot sec csc` and inverses `asin acos atan acot asec acsc`
  (also `arcsin`, `arccos`, … spellings).
- **Hyperbolic:** `sinh cosh tanh coth sech csch` and inverses
  `asinh acosh atanh acoth asech acsch` (also `arsinh`/`arcsch`/… spellings).
- **Constants:** `pi`, `e`, `I` (imaginary unit), `GoldenRatio`.
- **From the paper's table:** `half minus inv sqr avg hypot sigma`
  (`sigmoid`/`logisticsigmoid`) plus Wolfram-style `Plus Times Subtract Divide Power`.

## Known Limitations

- A variable touching a function name needs an operator: write `3x*sec(x)`, not
  `3xsec(x)` — the latter tokenizes as the single unknown name `xsec` (you get a
  clear `Unknown function 'xsec'` error). This is inherent to implicit
  multiplication and is left as-is to stay faithful to the v4 parser.
- Non-elementary functions that don't reduce to `exp`/`log` are unsupported by
  design (e.g. `gamma`, `erf`, `sign`, `sinc`, `LambertW`); they return a clear
  "could not be compiled to EML" error.
- `asyncio.wait_for` cancels the client-facing coroutine on timeout but the underlying SymPy thread continues until it finishes. True termination requires `multiprocessing`. Deferred to v2.
- Domain detection for composed functions (e.g. `sqrt(arcsin(x))`) returns the most restrictive single-function domain rather than the true intersection. Marked `approximate: true`. Scaled arguments like `arcsin(x/2)` use the bare `arcsin` range.
- `e` and `pi` are treated as mathematical constants, not variable names.

---

## License

MIT — see LICENSE file.

The EML compiler (`eml_compiler_v4.py`) is used under the MIT licence of the original SymbolicRegressionPackage repository.
