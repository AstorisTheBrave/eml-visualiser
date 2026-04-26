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

### Backend — Render

- **Build command:** `pip install -r requirements.txt`
- **Start command:** `uvicorn main:app --host 0.0.0.0 --port 8000 --workers 1 --loop asyncio`
- **Environment variable:** `ALLOWED_ORIGINS=https://your-app.vercel.app`

### Frontend — Vercel

- **Root directory:** `frontend`
- **Build command:** `npm run build`
- **Output directory:** `dist`

After deploying the backend, update `frontend/.env.production` with your Render URL, then deploy the frontend.

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

## Known Limitations

- `asyncio.wait_for` cancels the client-facing coroutine on timeout but the underlying SymPy thread continues until it finishes. True termination requires `multiprocessing`. Deferred to v2.
- Domain detection for composed functions (e.g. `sqrt(arcsin(x))`) returns the most restrictive single-function domain rather than the true intersection. Marked `approximate: true`.
- `e` and `pi` are treated as mathematical constants, not variable names.

---

## License

MIT — see LICENSE file.

The EML compiler (`eml_compiler_v4.py`) is used under the MIT licence of the original SymbolicRegressionPackage repository.
