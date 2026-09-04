# Contribution log — BCSE307L Team 2 (Project A15)

Every entry must name a commit or an artefact. "Helped with coding" is not an entry.

| Date | Member | Task assigned | Task completed | Evidence |
|---|---|---|---|---|
| W1 | Vishal Vivek | Freeze PySub scope; write EBNF grammar | Grammar covering 41 productions | `docs/grammar.ebnf` |
| W1 | Vishal Vivek | Lexer with off-side rule | INDENT/DEDENT, 233 LOC | `pythia/lexer.py` |
| W2 | Vishal Vivek | Parser + AST | Recursive descent + Pratt, panic recovery | `pythia/parser.py`, `pythia/ast_nodes.py` |
| W2 | Rujuta Kulkarni | Symbol table with nested scopes | `Scope` chain, function-closed scoping | `pythia/typecheck.py` |
| W2 | Rujuta Kulkarni | Bidirectional type checker | 567 LOC; 12/12 negative cases rejected | `pythia/typecheck.py`, `tests/negative/` |
| W2 | Jahnavi Koliparthy | Divergence catalogue D1–D7 | 7 classes documented with mitigations | `pythia/lower.py` |
| W3 | Jahnavi Koliparthy | Lowering pass + pyrt runtime | Coercion insertion; 345 LOC runtime | `pythia/lower.py`, `runtime/pyrt.c` |
| W3 | Aaryan Gupta | C11 emitter | 420 LOC; compiles clean under `-Wall` | `pythia/emit_c.py` |
| W3 | Aaryan Gupta | Differential oracle + CI | 14/14 equivalence, 12/12 rejection | `tools/oracle.py`, `.github/workflows/ci.yml` |
| W3 | All | Review 1 document and deck | Submitted | `docs/` |

## Meeting record

| Date | Present | Decisions |
|---|---|---|
| W1 | All 4 | Target language = C (not Go/JS): verifiable end to end with `cc`, and forces us to confront the semantic gap rather than hide behind a GC'd target. |
| W1 | All 4 | Scope frozen at PySub v0.1; classes and dicts deferred to Review 3. |
| W2 | All 4 | Monomorphic list representation chosen over boxed values — keeps the "typed" claim honest and the generated C readable. |
| W2 | All 4 | Semantic Fidelity Report adopted as the project's novelty claim. |
| W3 | All 4 | Overflow guards kept even at ~2x cost on integer-hot code; guard elision via range analysis becomes a Review 2 objective. |
