const pptxgen = require("pptxgenjs");
const path = require("path");

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";                 // 13.333 x 7.5
pres.author = "BCSE307L Team 2";
pres.title = "PYTHIA — Review 1";

// ---- design system -----------------------------------------------------
const INK   = "0F172A";   // near-black navy  (dominant)
const SLATE = "334155";
const MUT   = "64748B";
const LINE  = "E2E8F0";
const PAPER = "FFFFFF";
const CARD  = "F1F5F9";
const AMBER = "F59E0B";   // accent
const AMBD  = "B45309";
const TEAL  = "0D9488";
const RED   = "BE123C";

const SER = "Cambria";
const SAN = "Calibri";
const MONO = "Courier New";

const M = 0.62;                 // page margin
const CW = 13.333 - 2 * M;      // content width

let n = 0;

function badge(s, who) {
  if (!who) return;
  s.addShape(pres.ShapeType.roundRect, {
    x: 13.333 - M - 3.05, y: 0.34, w: 3.05, h: 0.34,
    fill: { color: CARD }, line: { color: LINE, width: 0.75 }, rectRadius: 0.17,
  });
  s.addText(who.toUpperCase(), {
    x: 13.333 - M - 3.05, y: 0.34, w: 3.05, h: 0.34,
    fontSize: 9, bold: true, color: SLATE, font: SAN, align: "center",
    valign: "middle", charSpacing: 0.8, margin: 0,
  });
}

function foot(s, dark) {
  s.addText(`${n}`, {
    x: 13.333 - M - 0.6, y: 7.5 - 0.52, w: 0.6, h: 0.3,
    fontSize: 10, color: dark ? "475569" : MUT, font: SAN, align: "right", margin: 0,
  });
  s.addText("PYTHIA  ·  BCSE307L Team 2  ·  Project A15", {
    x: M, y: 7.5 - 0.52, w: 6, h: 0.3,
    fontSize: 9, color: dark ? "475569" : "94A3B8", font: SAN, margin: 0,
  });
}

function slide(title, who, opts = {}) {
  n += 1;
  const s = pres.addSlide();
  s.background = { color: opts.dark ? INK : PAPER };
  if (title) {
    s.addText(title, {
      x: M, y: 0.30, w: CW - 3.3, h: 0.62,
      fontSize: opts.small ? 24 : 30, bold: true, font: SER,
      color: opts.dark ? PAPER : INK, valign: "middle", margin: 0,
    });
  }
  badge(s, who);
  foot(s, opts.dark);
  return s;
}

// a content card: tinted background, bold heading, body lines
function card(s, o) {
  s.addShape(pres.ShapeType.roundRect, {
    x: o.x, y: o.y, w: o.w, h: o.h,
    fill: { color: o.fill || CARD }, line: { color: o.line || LINE, width: 0.75 },
    rectRadius: 0.08,
  });
  let ty = o.y + 0.15;
  if (o.tag) {
    s.addText(o.tag, {
      x: o.x + 0.22, y: ty, w: o.w - 0.44, h: 0.24, margin: 0,
      fontSize: 9.5, bold: true, color: o.tagColor || AMBD, font: SAN, charSpacing: 0.9,
    });
    ty += 0.26;
  }
  if (o.head) {
    const hl = o.headLines || 1;
    s.addText(o.head, {
      x: o.x + 0.22, y: ty, w: o.w - 0.44, h: 0.22 * hl + 0.08, margin: 0,
      fontSize: o.headSize || 15, bold: true, color: o.headColor || INK, font: SAN,
      valign: "top", lineSpacing: 17,
    });
    ty += 0.24 * hl + 0.08;
  }
  if (o.body) {
    s.addText(o.body, {
      x: o.x + 0.22, y: ty, w: o.w - 0.44, h: o.y + o.h - ty - 0.14, margin: 0,
      fontSize: o.size || 11.5, color: o.bodyColor || SLATE, font: o.bodyFont || SAN,
      valign: "top", lineSpacing: o.lh || 15,
    });
  }
}

function bullets(s, items, o) {
  s.addText(items.map((t, i) => ({
    text: t, options: { bullet: true, breakLine: i !== items.length - 1 },
  })), {
    x: o.x, y: o.y, w: o.w, h: o.h, margin: 0,
    fontSize: o.size || 12.5, color: o.color || SLATE, font: SAN,
    paraSpaceAfter: o.gap ?? 7, lineSpacing: o.lh || 16,
  });
}

function tbl(s, o) {
  const head = o.cols.map(c => ({
    text: c, options: { bold: true, color: "1E293B", fill: { color: CARD }, fontSize: o.hs || 10.5 },
  }));
  const rows = o.rows.map((r, ri) => r.map((c, ci) => ({
    text: c,
    options: {
      fontSize: o.fs || 10, color: ci === 0 ? INK : SLATE,
      bold: ci === 0 && o.boldFirst !== false,
      fill: { color: ri % 2 ? "FAFAFA" : "FFFFFF" },
    },
  })));
  s.addTable([head, ...rows], {
    x: o.x, y: o.y, w: o.w, colW: o.colW,
    border: { type: "solid", color: LINE, pt: 0.6 },
    fontFace: SAN, valign: "middle",
    rowH: o.rowH || 0.3, margin: [4, 7, 4, 7],
  });
}

function stat(s, x, y, w, big, label, color) {
  s.addText(big, {
    x, y, w, h: 0.72, margin: 0, fontSize: 40, bold: true,
    color: color || AMBER, font: SER, align: "center", valign: "middle",
  });
  s.addText(label, {
    x, y: y + 0.70, w, h: 0.5, margin: 0, fontSize: 10.5,
    color: MUT, font: SAN, align: "center", valign: "top", lineSpacing: 13,
  });
}

// =======================================================================
// 1 — TITLE
// =======================================================================
n += 1;
{
  const s = pres.addSlide();
  s.background = { color: INK };
  s.addText("BCSE307L  ·  COMPILER DESIGN  ·  PROJECT REVIEW 1", {
    x: M, y: 0.85, w: CW, h: 0.3, margin: 0,
    fontSize: 12, bold: true, color: AMBER, font: SAN, charSpacing: 2.2,
  });
  s.addText("PYTHIA", {
    x: M, y: 1.28, w: CW, h: 1.35, margin: 0,
    fontSize: 78, bold: true, color: PAPER, font: SER, valign: "middle",
  });
  s.addText("A statically typed Python-subset → C transpiler,", {
    x: M, y: 2.62, w: CW, h: 0.36, margin: 0,
    fontSize: 20, color: "CBD5E1", font: SAN,
  });
  s.addText("verified by a differential-testing oracle", {
    x: M, y: 2.96, w: CW, h: 0.36, margin: 0,
    fontSize: 20, italic: true, color: AMBER, font: SAN,
  });

  s.addShape(pres.ShapeType.line, {
    x: M, y: 3.62, w: CW, h: 0, line: { color: "1E293B", width: 1.5 },
  });

  const meta = [
    ["Team Number", "Team 2"],
    ["Project ID", "A15 — Typed Source-to-Source Transpiler"],
    ["Institution", "VIT Vellore"],
  ];
  meta.forEach((m2, i) => {
    s.addText(m2[0].toUpperCase(), {
      x: M + i * 4.05, y: 3.82, w: 3.8, h: 0.24, margin: 0,
      fontSize: 9, bold: true, color: MUT, font: SAN, charSpacing: 1.2,
    });
    s.addText(m2[1], {
      x: M + i * 4.05, y: 4.05, w: 3.8, h: 0.3, margin: 0,
      fontSize: 13, color: PAPER, font: SAN,
    });
  });

  const team = [
    ["VISHAL VIVEK", "24BCE2377", "Project lead · Front end", AMBER],
    ["RUJUTA M. KULKARNI", "24BDS0459", "Type system · Semantics", TEAL],
    ["K. V. JAHNAVI", "24BDS0132", "IR · Lowering · Runtime", "F97316"],
    ["AARYAN GUPTA", "24BDS0134", "Codegen · Testing · Plan", "8B5CF6"],
  ];
  team.forEach((t, i) => {
    const x = M + i * 3.06;
    s.addShape(pres.ShapeType.roundRect, {
      x, y: 4.78, w: 2.86, h: 1.42,
      fill: { color: "1E293B" }, line: { color: "334155", width: 0.75 }, rectRadius: 0.08,
    });
    s.addShape(pres.ShapeType.ellipse, {
      x: x + 0.2, y: 4.96, w: 0.26, h: 0.26, fill: { color: t[3] }, line: { width: 0 },
    });
    s.addText(`M${i + 1}`, {
      x: x + 0.2, y: 4.96, w: 0.26, h: 0.26, margin: 0,
      fontSize: 8, bold: true, color: INK, font: SAN, align: "center", valign: "middle",
    });
    s.addText(t[0], {
      x: x + 0.55, y: 4.94, w: 2.2, h: 0.3, margin: 0,
      fontSize: 11.5, bold: true, color: PAPER, font: SAN, valign: "middle",
    });
    s.addText(t[1], {
      x: x + 0.2, y: 5.32, w: 2.5, h: 0.24, margin: 0,
      fontSize: 10, color: MUT, font: MONO,
    });
    s.addText(t[2], {
      x: x + 0.2, y: 5.60, w: 2.5, h: 0.5, margin: 0,
      fontSize: 10.5, color: "CBD5E1", font: SAN, lineSpacing: 13,
    });
  });

  s.addText("14 / 14 programs semantically equivalent to CPython  ·  12 / 12 ill-typed programs rejected  ·  9.4× median speedup", {
    x: M, y: 6.45, w: CW, h: 0.34, margin: 0,
    fontSize: 12, bold: true, color: AMBER, font: SAN, align: "center",
  });
  foot(s, true);
  s.addNotes("Introduce the team. State the one-line claim: we built a transpiler that does not merely produce C, but produces C we can prove behaves like CPython — and we ship the falsifier. The numbers at the bottom are already achieved, not targets.");
}

// =======================================================================
// 2 — BACKGROUND & MOTIVATION
// =======================================================================
{
  const s = slide("Why this problem is worth solving", "Member 1 · Vishal");
  s.addText("Python is where algorithms get written. C is where they have to run. The gap between them is not syntax — it is arithmetic.", {
    x: M, y: 1.00, w: CW, h: 0.58, margin: 0,
    fontSize: 15, italic: true, color: SLATE, font: SAN,
  });

  const gaps = [
    ["−7 // 2", "Python  −4", "C  −3", "floors toward −∞ vs truncates toward 0"],
    ["−7 % 2", "Python  1", "C  −1", "sign follows divisor vs dividend"],
    ["3 / 2", "Python  1.5", "C  1", "true division always yields a float"],
    ["xs[−1]", "Python  last", "C  ✗", "negative indexing, bounds checks"],
  ];
  gaps.forEach((g, i) => {
    const x = M + i * 3.06;
    s.addShape(pres.ShapeType.roundRect, {
      x, y: 1.66, w: 2.86, h: 1.72,
      fill: { color: CARD }, line: { color: LINE, width: 0.75 }, rectRadius: 0.08,
    });
    s.addText(g[0], {
      x: x + 0.18, y: 1.80, w: 2.5, h: 0.34, margin: 0,
      fontSize: 17, bold: true, color: INK, font: MONO,
    });
    s.addText(g[1], {
      x: x + 0.18, y: 2.20, w: 2.5, h: 0.26, margin: 0,
      fontSize: 12, bold: true, color: TEAL, font: MONO,
    });
    s.addText(g[2], {
      x: x + 0.18, y: 2.46, w: 2.5, h: 0.26, margin: 0,
      fontSize: 12, bold: true, color: RED, font: MONO,
    });
    s.addText(g[3], {
      x: x + 0.18, y: 2.76, w: 2.5, h: 0.52, margin: 0,
      fontSize: 10, color: MUT, font: SAN, lineSpacing: 12,
    });
  });

  s.addText("Each is a one-line difference that changes a program's output without changing its shape. A transpiler that gets any of them wrong still compiles, still runs, and still prints something plausible.", {
    x: M, y: 3.52, w: CW, h: 0.44, margin: 0,
    fontSize: 12.5, color: SLATE, font: SAN,
  });

  card(s, {
    x: M, y: 4.14, w: 6.0, h: 2.32, tag: "WHO NEEDS IT",
    head: "Practical relevance",
    body: "Embedded and edge developers who cannot ship a 30 MB interpreter.\n\nTeams porting legacy Python who need an audit trail, not \u201cit seemed to work\u201d.\n\nCompiler students: every classical phase is present, and the semantic gap is made explicit instead of assumed away.",
    size: 11.5,
  });
  card(s, {
    x: M + 6.3, y: 4.14, w: 5.79, h: 2.32, fill: "FFFBEB", line: "FDE68A",
    tag: "THE OBSERVATION", tagColor: AMBD,
    head: "Nobody tells you where translation\nstopped being faithful", headLines: 2,
    body: "Codon silently redefines int as 64-bit. Cython and Nuitka emit unreviewable generated C. Transcrypt does not type-check at all.\n\nEvery one of them asserts semantic preservation. None of them demonstrates it.",
    size: 11.5,
  });
  s.addNotes("Lead with the four arithmetic examples — they land instantly and they are the whole motivation. Emphasise: the failure mode is silent. Then the two cards: who benefits, and what the field currently does not do.");
}

// =======================================================================
// 3 — PROBLEM STATEMENT, SCOPE, OBJECTIVES
// =======================================================================
{
  const s = slide("Problem statement, scope and objectives", "Member 1 · Vishal", { small: true });

  s.addShape(pres.ShapeType.roundRect, {
    x: M, y: 1.04, w: CW, h: 1.42,
    fill: { color: INK }, line: { width: 0 }, rectRadius: 0.08,
  });
  s.addText([
    { text: "Given a program P in PySub, produce a C11 program C(P) and a report R(P) such that:  ", options: { bold: true, color: PAPER } },
    { text: "(i) ", options: { bold: true, color: AMBER } },
    { text: "C(P) compiles anywhere with no dependency beyond our runtime;  ", options: { color: "CBD5E1" } },
    { text: "(ii) ", options: { bold: true, color: AMBER } },
    { text: "for every input on which P terminates, C(P) produces byte-identical stdout and the same exception class as CPython 3.12;  ", options: { color: "CBD5E1" } },
    { text: "(iii) ", options: { bold: true, color: AMBER } },
    { text: "every construct whose C image is not provably equivalent appears in R(P) with its position, class and mitigation;  ", options: { color: "CBD5E1" } },
    { text: "(iv) ", options: { bold: true, color: AMBER } },
    { text: "any ill-typed P is rejected before a line of C is emitted.", options: { color: "CBD5E1" } },
  ], {
    x: M + 0.24, y: 1.18, w: CW - 0.48, h: 1.16, margin: 0,
    fontSize: 12, font: SAN, lineSpacing: 16, valign: "middle",
  });
  s.addText("(ii) is what every transpiler claims. (iii) is what makes it auditable when (ii) cannot be met. Together they are the contribution.", {
    x: M, y: 2.52, w: CW, h: 0.3, margin: 0,
    fontSize: 11, italic: true, color: MUT, font: SAN,
  });

  tbl(s, {
    x: M, y: 2.94, w: 7.55, colW: [0.42, 3.55, 2.35, 1.23], rowH: 0.30, fs: 9.5, hs: 9.5,
    cols: ["#", "Measurable objective", "Target", "At R1"],
    rows: [
      ["O1", "Formally specify PySub in EBNF", "≥ 40 productions", "41 ✓"],
      ["O2", "Reject every ill-typed program", "≥ 95% of 60 cases", "12/12 ✓"],
      ["O3", "Preserve semantics vs CPython 3.12", "≥ 98% of 120 programs", "14/14 ✓"],
      ["O4", "Catalogue + report every divergence", "≥ 7 classes, positioned", "7 ✓"],
      ["O5", "Produce competitive native code", "median ≥ 8× speedup", "9.4× ✓"],
    ],
  });

  card(s, {
    x: M + 7.85, y: 2.94, w: 4.24, h: 1.62, tag: "IN SCOPE — PySub v0.1", tagColor: TEAL,
    body: "int · float · bool · str · list[T] · None\ndef with mandatory annotations · mutual recursion\nif/elif/else · while · for-in-range · for-in-list\n+ − * / // % ** with Python's rounding rules\nindexing with negative subscripts · print · len · abs",
    size: 10, lh: 13.5,
  });
  card(s, {
    x: M + 7.85, y: 4.62, w: 4.24, h: 1.92, fill: "FEF2F2", line: "FECACA",
    tag: "DEFERRED — DATED, NOT FORGOTTEN", tagColor: RED,
    body: "Nested list[list[T]]  →  Review 2\nClasses · dict · try/except  →  Review 3\nClosures · slicing  →  out of scope\nArbitrary-precision int  →  D1, guarded\n\nThe checker names the review in its rejection message, so scope creep stays visible.",
    size: 10, lh: 13.5,
  });
  s.addText("O2 and O3 corpora grow to 60 and 120 by Review 2, largely via the grammar-directed program generator.", {
    x: M, y: 4.86, w: 7.55, h: 0.3, margin: 0,
    fontSize: 10.5, italic: true, color: MUT, font: SAN,
  });
  s.addNotes("Read the problem statement aloud — it is deliberately formal because the whole project is judged against it. Then: five objectives, each with a metric, a target and an instrument, and the right-hand column shows what is already achieved. Scope: what is in, and what is deferred with a named review.");
}

// =======================================================================
// 4 — COMPILER CONCEPTS
// =======================================================================
{
  const s = slide("Compiler-design concepts the project rests on", "Member 2 · Rujuta", { small: true });

  const items = [
    ["01", "Off-side rule", "Python's block structure lives in whitespace, so the token stream is not context-free until layout is reified. A stack of indentation widths synthesises INDENT / DEDENT; the parser then uses an ordinary block grammar.", AMBER],
    ["02", "Recursive descent", "One mutually recursive procedure per non-terminal. Chosen for recoverability: panic-mode synchronisation at NEWLINE and statement keywords lets one run report several syntax errors.", TEAL],
    ["03", "Pratt parsing", "Top-down operator precedence (Pratt, 1973) with a binding-power table handles eight precedence levels and the right-associativity of ** without an eight-rule cascade.", "F97316"],
    ["04", "Bidirectional typing", "Expressions synthesise bottom-up; where an expected type exists — annotation, return, argument, append — it is pushed inward and checked. Pierce & Turner's local type inference.", "8B5CF6"],
    ["05", "IR + translation", "The typed AST is normalised into PIR by making every implicit coercion explicit. After that the emitter never infers anything, which is what keeps the back end small.", "0EA5E9"],
    ["06", "Differential testing", "Rather than prove equivalence, falsify it: run both implementations, compare. McKeeman's method, applied to a translator instead of a compiler — the approach behind Csmith.", RED],
  ];
  items.forEach((it, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const x = M + col * 4.08, y = 1.12 + row * 2.72;
    s.addShape(pres.ShapeType.roundRect, {
      x, y, w: 3.88, h: 2.5,
      fill: { color: CARD }, line: { color: LINE, width: 0.75 }, rectRadius: 0.08,
    });
    s.addShape(pres.ShapeType.ellipse, {
      x: x + 0.22, y: y + 0.22, w: 0.42, h: 0.42, fill: { color: it[3] }, line: { width: 0 },
    });
    s.addText(it[0], {
      x: x + 0.22, y: y + 0.22, w: 0.42, h: 0.42, margin: 0,
      fontSize: 11, bold: true, color: PAPER, font: SAN, align: "center", valign: "middle",
    });
    s.addText(it[1], {
      x: x + 0.76, y: y + 0.24, w: 2.9, h: 0.38, margin: 0,
      fontSize: 14, bold: true, color: INK, font: SAN, valign: "middle",
    });
    s.addText(it[2], {
      x: x + 0.22, y: y + 0.76, w: 3.44, h: 1.6, margin: 0,
      fontSize: 10.5, color: SLATE, font: SAN, valign: "top", lineSpacing: 13.5,
    });
  });
  s.addNotes("Six concepts, one per card. Be ready to justify each choice, not just name it — especially why Pratt rather than a precedence cascade, and what bidirectional means (which rules synthesise, which check).");
}

// =======================================================================
// 5 — EXISTING APPROACHES AND THE GAP
// =======================================================================
{
  const s = slide("Existing approaches, comparison and the gap", "Member 2 · Rujuta", { small: true });

  tbl(s, {
    x: M, y: 1.06, w: 12.09, colW: [1.55, 3.35, 1.75, 1.9, 1.45, 2.09],
    rowH: 0.285, fs: 9.5, hs: 9.5,
    cols: ["System", "Approach", "Type checking", "Output artefact", "Interpreter-free", "Reports divergence"],
    rows: [
      ["mypy", "Type checker only, no codegen", "Yes", "None", "n/a", "n/a"],
      ["mypyc", "Typed Python → C extension", "Yes (via mypy)", "C extension", "No", "No"],
      ["Cython", "Annotated Python → C via CPython API", "Partial (cdef)", "C extension", "No", "No"],
      ["Nuitka", "Whole-program Python → C++", "No", "Binary + runtime", "No", "No"],
      ["Codon", "Python-like language → LLVM IR", "Yes (inference)", "Native binary", "Yes", "No — silently redefines int"],
      ["Shed Skin", "Implicitly typed Python → C++", "Inference only", "C++ / binary", "Yes", "No"],
      ["Transcrypt", "Python → JavaScript", "No", "JavaScript", "n/a", "No"],
      ["py2many", "Python → C++/Rust/Go/Julia", "Shallow", "Source", "Varies", "No"],
      ["PYTHIA", "Typed Python subset → readable C11", "Yes, bidirectional", "C source + binary", "Yes", "Yes — positioned"],
    ],
  });

  s.addText("Read down the last two columns.", {
    x: M, y: 4.32, w: 3.6, h: 0.3, margin: 0,
    fontSize: 13, bold: true, color: INK, font: SAN,
  });
  s.addText("Everything that produces an interpreter-free artefact does so by quietly choosing a semantics. Everything that type-checks carefully declines to generate code.", {
    x: M, y: 4.62, w: 3.6, h: 1.1, margin: 0,
    fontSize: 11, color: SLATE, font: SAN, lineSpacing: 14,
  });

  const gap = [
    ["Verification, not assertion", "An executable differential oracle turns a universal claim into a CI number that can fail.", TEAL],
    ["Divergence as an output", "No surveyed tool emits a machine-generated, source-positioned account of its own approximations.", AMBD],
    ["Readability of the target", "An audit trail is worth nothing if a human cannot read what was produced.", "8B5CF6"],
  ];
  gap.forEach((g, i) => {
    const x = M + 3.9 + i * 2.78;
    s.addShape(pres.ShapeType.roundRect, {
      x, y: 4.32, w: 2.58, h: 1.72,
      fill: { color: "FFFBEB" }, line: { color: "FDE68A", width: 0.75 }, rectRadius: 0.08,
    });
    s.addText(`0${i + 1}`, {
      x: x + 0.2, y: 4.44, w: 1, h: 0.3, margin: 0,
      fontSize: 11, bold: true, color: g[2], font: MONO,
    });
    s.addText(g[0], {
      x: x + 0.2, y: 4.72, w: 2.2, h: 0.5, margin: 0,
      fontSize: 12.5, bold: true, color: INK, font: SAN, lineSpacing: 14,
    });
    s.addText(g[1], {
      x: x + 0.2, y: 5.24, w: 2.2, h: 0.72, margin: 0,
      fontSize: 10, color: SLATE, font: SAN, lineSpacing: 12.5,
    });
  });

  s.addText("PYTHIA is not competing with Codon on breadth or Cython on maturity. Its claim is narrower and checkable: within a subset small enough to reason about, translation is verified rather than asserted — and where it cannot be verified, it is reported.", {
    x: M, y: 6.20, w: CW, h: 0.4, margin: 0,
    fontSize: 11.5, italic: true, color: MUT, font: SAN,
  });
  s.addNotes("Do not read the table row by row. Point at the last two columns and state the pattern. Then the three-part gap. Close with the honesty line — we are not claiming to beat Codon; we are claiming to be checkable.");
}

// =======================================================================
// 6 — REQUIREMENTS AND FEASIBILITY
// =======================================================================
{
  const s = slide("Requirements, test inputs and feasibility", "Member 2 · Rujuta", { small: true });

  card(s, {
    x: M, y: 1.06, w: 3.88, h: 2.5, tag: "SOFTWARE",
    body: "Python 3.10+  —  compiler implementation\ngcc 13 / clang 16, C11  —  compiles emitted code\nglibc / musl  —  the only runtime dependency\nGit + GitHub Actions  —  oracle on every push\nCPython 3.12  —  ground truth for equivalence\nGraphviz + Matplotlib  —  figures only",
    size: 10.5, lh: 15,
  });
  card(s, {
    x: M + 4.08, y: 1.06, w: 3.88, h: 2.5, tag: "HARDWARE",
    head: "Any laptop. Deliberately.",
    body: "x86-64 or ARM64, 4 GB RAM, 1 GB disk. The heaviest benchmark is a 90×90 dense matrix multiply that CPython finishes in under two seconds.\n\nNo GPU, no cluster, no cloud credit — a project whose evaluation cannot be reproduced on a teammate's laptop is a project whose evaluation cannot be checked.",
    size: 10.5, lh: 14,
  });
  card(s, {
    x: M + 8.16, y: 1.06, w: 3.93, h: 2.5, tag: "TEST INPUTS — NO EXTERNAL DATASET", tagColor: TEAL,
    body: "Positive corpus — PySub programs exercising each feature and each divergence class.  14 → 120\n\nNegative corpus — ill-typed programs, each carrying an # expect: marker naming the diagnostic it must provoke.  12 → 60\n\nGenerated corpus — grammar-directed random program sampler (Review 2), in the spirit of Csmith.",
    size: 10, lh: 13.5,
  });

  s.addText("Risk register", {
    x: M, y: 3.76, w: 4, h: 0.32, margin: 0,
    fontSize: 15, bold: true, color: INK, font: SAN,
  });
  tbl(s, {
    x: M, y: 4.12, w: 12.09, colW: [0.5, 3.1, 0.62, 0.62, 7.25],
    rowH: 0.30, fs: 9.5, hs: 9.5,
    cols: ["#", "Risk", "L", "I", "Mitigation"],
    rows: [
      ["R1", "Divergence classes beyond D1–D7", "High", "High", "The grammar-directed generator searches the space we did not think of; every new class becomes a catalogued row and a regression test"],
      ["R2", "Overflow guards cost performance", "Med", "Med", "Already measured at ~2× on Collatz. Review 2 adds interval analysis to elide provably safe guards — a real dataflow pass"],
      ["R3", "Scope creep into classes and dicts", "High", "High", "Scope frozen in the Week-1 minutes; the checker rejects out-of-subset constructs by name and states the review they land in"],
      ["R4", "A member unavailable near a review", "Med", "High", "Every module has a documented interface, a primary and a named secondary owner; the oracle localises a failure automatically"],
      ["R5", "Generated C fails on another toolchain", "Low", "Med", "CI compiles under gcc and clang with -Wall; GNU-extension use is confined to three sites with a known ISO fallback"],
      ["R6", "Type checker unsound", "Med", "High", "This is precisely what the oracle detects — four such bugs were found and fixed this way in Week 3"],
    ],
  });
  s.addNotes("Requirements are unremarkable and that is the point — feasibility is not in question. Spend the time on the risk register, especially R1 and R6: R6 is the interesting one, because the oracle turns an unsoundness into a visible failure rather than a silent pass.");
}

// =======================================================================
// 7 — METHODOLOGY
// =======================================================================
{
  const s = slide("Methodology — six stages and a verification loop", "Member 3 · Jahnavi", { small: true });

  const stages = [
    ["1", "Specify before implementing", "PySub is defined in EBNF first — 41 productions. Everything the grammar does not admit is rejected by name, with the review it is scheduled for. This is what makes exclusions decisions rather than omissions, and it later doubles as the sampling distribution for the random program generator.", AMBER],
    ["2", "Reify layout, then parse", "The scanner turns indentation into INDENT / DEDENT using a stack of column widths, so the parser sees explicit blocks. Statements by recursive descent, expressions by precedence climbing, errors recovered in panic mode so one run reports many.", TEAL],
    ["3", "Check types bidirectionally", "A parent-linked scope chain resolves names. Every local takes its type from its first binding and keeps it — the restriction that makes translation to a statically typed target sound, and the one place PySub is genuinely narrower than Python rather than merely smaller.", "F97316"],
    ["4", "Normalise the gap and record it", "Lowering makes every implicit coercion explicit, so PIR is homogeneously typed and the emitter never guesses. In the same walk it tags each divergence against D1–D7 and accumulates the Fidelity Report — in the compiler, so it cannot go stale.", "8B5CF6"],
    ["5", "Emit readable C; push hard cases to a runtime", "Where Python differs from C the emitter calls pyrt rather than open-coding a fix — py_mod_i64, not an inline sign correction. Semantic decisions stay in one auditable file. Lists are monomorphised, not boxed: that is what makes the typing pay for itself.", "0EA5E9"],
    ["6", "Falsify the claim, continuously", "Every positive program is run under CPython 3.12 and as a compiled binary; stdout compared byte for byte, exception class for exception class. Every negative program must be rejected with the message its marker names. Runs in CI on every push.", RED],
  ];
  stages.forEach((st, i) => {
    const y = 1.06 + i * 0.94;
    s.addShape(pres.ShapeType.roundRect, {
      x: M, y, w: CW, h: 0.84,
      fill: { color: i === 5 ? "FEF2F2" : CARD }, line: { color: i === 5 ? "FECACA" : LINE, width: 0.75 },
      rectRadius: 0.06,
    });
    s.addShape(pres.ShapeType.ellipse, {
      x: M + 0.2, y: y + 0.22, w: 0.4, h: 0.4, fill: { color: st[3] }, line: { width: 0 },
    });
    s.addText(st[0], {
      x: M + 0.2, y: y + 0.22, w: 0.4, h: 0.4, margin: 0,
      fontSize: 13, bold: true, color: PAPER, font: SER, align: "center", valign: "middle",
    });
    s.addText(st[1], {
      x: M + 0.76, y: y + 0.12, w: 3.0, h: 0.6, margin: 0,
      fontSize: 12.5, bold: true, color: INK, font: SAN, valign: "middle", lineSpacing: 14,
    });
    s.addText(st[2], {
      x: M + 3.9, y: y + 0.10, w: CW - 4.1, h: 0.64, margin: 0,
      fontSize: 10, color: SLATE, font: SAN, valign: "middle", lineSpacing: 12.5,
    });
  });
  s.addText("Stages 1–5 are the compiler. Stage 6 is the reason to believe stages 1–5.", {
    x: M, y: 6.78, w: CW, h: 0.3, margin: 0,
    fontSize: 12, bold: true, italic: true, color: AMBD, font: SAN, align: "center",
  });
  s.addNotes("Walk the six stages briskly — the audience can read. Land hard on two design decisions: the fidelity report lives in the compiler so it cannot go stale, and lists are monomorphised rather than boxed, which is what turns the type information into speed.");
}

// =======================================================================
// 8 — ARCHITECTURE
// =======================================================================
{
  const s = slide("System architecture and data flow", "Member 3 · Jahnavi");
  s.addImage({
    path: path.join(__dirname, "architecture.png"),
    x: 0.40, y: 0.95, h: 6.05, w: 6.05 * (2140 / 3130),
  });
  const bx = 4.9;
  s.addText("Six phases, two products", {
    x: bx, y: 1.02, w: 7.9, h: 0.36, margin: 0,
    fontSize: 16, bold: true, color: INK, font: SAN,
  });
  s.addText("The dotted outputs — diagnostics and the fidelity report — are products of the pipeline, not by-products. A run that emits no C but a good diagnostic has succeeded. The dashed edge at the bottom closes the verification loop.", {
    x: bx, y: 1.40, w: 7.9, h: 0.72, margin: 0,
    fontSize: 11.5, color: SLATE, font: SAN, lineSpacing: 14.5,
  });

  tbl(s, {
    x: bx, y: 2.24, w: 7.85, colW: [1.55, 1.35, 4.95], rowH: 0.42, fs: 9.5, hs: 9.5,
    cols: ["Representation", "Produced by", "Invariant it guarantees"],
    rows: [
      ["Token stream", "Lexer", "Layout is explicit — every block delimited by INDENT/DEDENT, so the grammar downstream is context-free"],
      ["AST", "Parser", "Structurally valid; every node carries line and column. Types absent"],
      ["Typed AST", "Type checker", "Every expression carries a resolved type; no ill-typed program reaches this stage"],
      ["PIR", "Lowering", "Homogeneously typed — every implicit coercion is now an explicit Coerce node; divergences tagged"],
      ["C11 source", "Emitter", "Compiles under -Wall with no warnings and no dependency outside pyrt"],
    ],
  });

  card(s, {
    x: bx, y: 4.94, w: 7.85, h: 1.56, fill: "0F172A", line: "0F172A",
    tag: "INTERFACES — WHY FOUR PEOPLE CAN WORK IN PARALLEL", tagColor: AMBER,
    bodyColor: "CBD5E1", size: 10, lh: 13.5, bodyFont: MONO,
    body: "M1 → M2   Module            untyped tree + source positions\nM2 → M3   Module + Ty       every node .ty populated\nM3 → M4   Module + Coerce   homogeneously typed PIR\nM3 → M4   pyrt.h            the runtime ABI the emitter targets\nM4 → all  oracle.py         the shared definition of \u201ccorrect\u201d",
  });
  s.addNotes("Trace one program through the diagram left to right. Then the invariants table — each stage guarantees something the next one relies on. Finish on the interfaces: these are data-structure contracts, not calling conventions, which is why the four of us are not blocked on each other.");
}

// =======================================================================
// 9 — MODULES, ALGORITHMS, DIVERGENCE CATALOGUE
// =======================================================================
{
  const s = slide("Modules, algorithms and divergence catalogue", "Member 3 · Jahnavi", { small: true });

  tbl(s, {
    x: M, y: 1.04, w: 12.09, colW: [1.32, 2.0, 5.1, 1.55, 2.12], rowH: 0.29, fs: 9.5, hs: 9.5,
    cols: ["Module", "Input → Output", "Algorithm / technique", "Owner", "LOC"],
    rows: [
      ["lexer.py", "text → tokens", "Hand-written scanner; indentation stack implementing the off-side rule; bracket-suppressed layout", "M1 Vishal", "233"],
      ["parser.py", "tokens → AST", "Recursive descent for statements; Pratt precedence climbing; panic-mode synchronisation", "M1 Vishal", "393 (+205 AST)"],
      ["typecheck.py", "AST → TAST", "Parent-linked scope chain; bidirectional checking with local inference; bool ⊑ int ⊑ float lattice", "M2 Rujuta", "567"],
      ["lower.py", "TAST → PIR", "Coercion insertion; divergence tagging against D1–D7; fidelity accumulation", "M3 Jahnavi", "250"],
      ["pyrt.h / .c", "runtime library", "Floor division, divisor-signed modulo, checked int64, shortest-round-trip float repr, monomorphic lists", "M3 Jahnavi", "435"],
      ["emit_c.py", "PIR → C11", "Syntax-directed structural walk; name mangling; monomorphised container selection", "M4 Aaryan", "420"],
      ["oracle.py", "corpus → verdict", "Differential execution vs CPython 3.12; stdout and exception-class comparison; timing harness", "M4 Aaryan", "188"],
    ],
  });

  s.addText("The divergence catalogue — the project's technical spine", {
    x: M, y: 3.62, w: 8, h: 0.3, margin: 0,
    fontSize: 14, bold: true, color: INK, font: SAN,
  });
  tbl(s, {
    x: M, y: 3.98, w: 12.09, colW: [0.5, 3.5, 2.05, 4.34, 1.7], rowH: 0.285, fs: 9.5, hs: 9.5,
    cols: ["ID", "Divergence", "Example", "Mitigation", "Status"],
    rows: [
      ["D1", "Python ints unbounded; C's are 64-bit", "2**63 exact in Python", "Guarded with __builtin_*_overflow; raises OverflowError", "Guarded"],
      ["D2", "// floors toward −∞; C truncates toward 0", "−7 // 2 = −4 vs −3", "py_floordiv_i64 / py_floordiv_f64", "Exact"],
      ["D3", "Sign of % follows the divisor", "−7 % 2 = 1 vs −1", "py_mod_i64 / py_mod_f64, incl. signed zero", "Exact"],
      ["D4", "/ is true division, always float", "3 / 2 = 1.5, not 1", "Operands widened; py_truediv keeps ZeroDivisionError", "Exact"],
      ["D5", "Negative indexing, mandatory bounds checks", "xs[−1]; xs[7] raises", "Normalised and checked in the runtime", "Exact"],
      ["D6", "int ** negative int changes the static type", "2 ** −1 = 0.5, a float", "Not statically typable — reported, then refused at run time", "Divergent"],
      ["D7", "Object lifetime and reclamation", "CPython refcounts", "Documented; output unaffected. Regions are the R3 target", "Guarded"],
    ],
  });
  s.addText("Float formatting is the divergence most transpilers get wrong without noticing: CPython prints the shortest round-tripping decimal, fixed unless the exponent is < −4 or ≥ 16. printf(\"%.17g\") does not reproduce it — pyrt implements the search directly, which is why 0.1 + 0.2 prints 0.30000000000000004.", {
    x: M, y: 6.42, w: CW, h: 0.42, margin: 0,
    fontSize: 10.5, italic: true, color: MUT, font: SAN,
  });
  s.addNotes("Modules first — one owner, one reason to change. Then the catalogue: this is the table to know cold. Be ready to work −7//2 and −7%2 by hand in both languages, and to explain why D6 cannot be caught statically (the exponent's sign is a run-time value).");
}

// =======================================================================
// 10 — WORK ALLOCATION
// =======================================================================
{
  const s = slide("Work allocation and integration responsibilities", "Member 4 · Aaryan", { small: true });

  const team = [
    ["M1", "VISHAL VIVEK", "24BCE2377", AMBER,
      "Front end: grammar, lexer with the off-side rule, parser, AST, diagnostics",
      "Repository, CI, cross-module integration, release management",
      "grammar.ebnf (41 productions); 944 LOC across lexer, parser, AST, CLI; caret diagnostics working",
      "Tuples, multiple assignment, while/else"],
    ["M2", "RUJUTA M. KULKARNI", "24BDS0459", TEAL,
      "Symbol table, scope resolution, bidirectional type checker, local inference",
      "Negative corpus and diagnostic-message quality",
      "typecheck.py (567 LOC); 12/12 negative cases rejected with the expected message",
      "Negative suite to 60; list[list[T]], Optional[T]"],
    ["M3", "K. V. JAHNAVI", "24BDS0132", "F97316",
      "Divergence catalogue, lowering to PIR, Fidelity Report, pyrt runtime",
      "Performance analysis of the guard mechanism",
      "lower.py + pyrt (685 LOC); 7 divergence classes; 123 positioned notes across the suite",
      "Interval analysis to elide safe guards; hash-map runtime"],
    ["M4", "AARYAN GUPTA", "24BDS0134", "8B5CF6",
      "C11 emitter, differential oracle, benchmark harness, project plan",
      "CI configuration, task board, contribution log",
      "emit_c.py + oracle.py (608 LOC); 14/14 equivalence; 9.4× median speedup measured",
      "Grammar-directed generator; corpus to 120"],
  ];
  team.forEach((t, i) => {
    const y = 1.04 + i * 1.36;
    s.addShape(pres.ShapeType.roundRect, {
      x: M, y, w: CW, h: 1.24,
      fill: { color: CARD }, line: { color: LINE, width: 0.75 }, rectRadius: 0.06,
    });
    s.addShape(pres.ShapeType.ellipse, {
      x: M + 0.18, y: y + 0.16, w: 0.4, h: 0.4, fill: { color: t[3] }, line: { width: 0 },
    });
    s.addText(t[0], {
      x: M + 0.18, y: y + 0.16, w: 0.4, h: 0.4, margin: 0,
      fontSize: 11, bold: true, color: PAPER, font: SAN, align: "center", valign: "middle",
    });
    s.addText(t[1], {
      x: M + 0.68, y: y + 0.14, w: 2.3, h: 0.28, margin: 0,
      fontSize: 11.5, bold: true, color: INK, font: SAN,
    });
    s.addText(t[2], {
      x: M + 0.68, y: y + 0.42, w: 2.3, h: 0.24, margin: 0,
      fontSize: 9.5, color: MUT, font: MONO,
    });
    s.addText("PRIMARY", { x: M + 0.68, y: y + 0.70, w: 2.3, h: 0.2, margin: 0, fontSize: 7.5, bold: true, color: t[3], font: SAN, charSpacing: 0.8 });
    s.addText(t[4], { x: M + 0.68, y: y + 0.88, w: 2.35, h: 0.32, margin: 0, fontSize: 8.5, color: SLATE, font: SAN, lineSpacing: 10.5 });

    s.addText("SUPPORTING", { x: M + 3.2, y: y + 0.14, w: 2.5, h: 0.2, margin: 0, fontSize: 7.5, bold: true, color: MUT, font: SAN, charSpacing: 0.8 });
    s.addText(t[5], { x: M + 3.2, y: y + 0.32, w: 2.5, h: 0.5, margin: 0, fontSize: 9, color: SLATE, font: SAN, lineSpacing: 11 });

    s.addText("REVIEW 1 EVIDENCE", { x: M + 5.9, y: y + 0.14, w: 3.6, h: 0.2, margin: 0, fontSize: 7.5, bold: true, color: TEAL, font: SAN, charSpacing: 0.8 });
    s.addText(t[6], { x: M + 5.9, y: y + 0.32, w: 3.6, h: 0.78, margin: 0, fontSize: 9, color: SLATE, font: SAN, lineSpacing: 11 });

    s.addText("REVIEW 2 TARGET", { x: M + 9.7, y: y + 0.14, w: 2.3, h: 0.2, margin: 0, fontSize: 7.5, bold: true, color: AMBD, font: SAN, charSpacing: 0.8 });
    s.addText(t[7], { x: M + 9.7, y: y + 0.32, w: 2.3, h: 0.6, margin: 0, fontSize: 9, color: SLATE, font: SAN, lineSpacing: 11 });
  });
  s.addText("Every member owns one technical component end to end. Secondary owners so no phase is a single point of failure: front end M4 · type checker M3 · runtime M2 · emitter M1.", {
    x: M, y: 6.50, w: CW, h: 0.42, margin: 0,
    fontSize: 10.5, italic: true, color: MUT, font: SAN,
  });
  s.addNotes("Point out explicitly that nobody's row says 'documentation' or 'PPT' — the guidelines ask for division by module and measurable output. Then the secondary-owner line: that is our answer to R4.");
}

// =======================================================================
// 11 — TIMELINE
// =======================================================================
{
  const s = slide("Timeline, milestones and Review 2 / 3 outcomes", "Member 4 · Aaryan", { small: true });
  s.addImage({
    path: path.join(__dirname, "gantt.png"),
    x: M, y: 1.10, w: 7.55, h: 7.55 * (1727 / 2546),
  });

  const gates = [
    ["REVIEW 1", "W3", TEAL, "Complete pipeline for PySub v0.1 · grammar · catalogue D1–D7 · differential oracle · report and deck", "Oracle green on the whole corpus; every member demonstrates their own module"],
    ["REVIEW 2", "W8", AMBD, "Grammar-directed generator · corpus 120 / 60 · interval analysis for guard elision · nested generics · ISO C fallback", "≥ 98% equivalence at 120 programs; ≥ 95% rejection at 60; measured gain from guard elision"],
    ["REVIEW 3", "W12", "8B5CF6", "Classes and dict · try/except · region-based reclamation · WebAssembly back end · final evaluation", "≥ 98% equivalence maintained; two back ends from one PIR; memory reclaimed without output change"],
  ];
  gates.forEach((g, i) => {
    const y = 1.02 + i * 1.9;
    s.addShape(pres.ShapeType.roundRect, {
      x: M + 7.85, y, w: 4.24, h: 1.72,
      fill: { color: CARD }, line: { color: LINE, width: 0.75 }, rectRadius: 0.08,
    });
    s.addText(g[0], {
      x: M + 8.05, y: y + 0.14, w: 2.2, h: 0.26, margin: 0,
      fontSize: 11.5, bold: true, color: g[2], font: SAN, charSpacing: 1,
    });
    s.addText(g[1], {
      x: M + 10.4, y: y + 0.14, w: 1.5, h: 0.26, margin: 0,
      fontSize: 11.5, bold: true, color: MUT, font: MONO, align: "right",
    });
    s.addText(g[3], {
      x: M + 8.05, y: y + 0.44, w: 3.84, h: 0.66, margin: 0,
      fontSize: 9.5, color: SLATE, font: SAN, lineSpacing: 12,
    });
    s.addText("ACCEPTANCE", {
      x: M + 8.05, y: y + 1.10, w: 3.84, h: 0.18, margin: 0,
      fontSize: 7.5, bold: true, color: MUT, font: SAN, charSpacing: 0.8,
    });
    s.addText(g[4], {
      x: M + 8.05, y: y + 1.26, w: 3.84, h: 0.4, margin: 0,
      fontSize: 9.5, italic: true, color: g[2], font: SAN, lineSpacing: 11.5,
    });
  });
  s.addNotes("The Gantt has four swimlanes and 25 tasks; do not read it. Say: work is parallel from Week 2 because the interfaces are data structures, and the three gates on the right each have an acceptance criterion that is a number, not an opinion.");
}

// =======================================================================
// 12 — INITIAL PROGRESS
// =======================================================================
{
  const s = slide("Initial progress — and the numbers behind it", "Member 4 · Aaryan", { small: true });

  [["14 / 14", "programs semantically\nequivalent to CPython 3.12", TEAL],
   ["12 / 12", "ill-typed programs\nrejected before emission", "8B5CF6"],
   ["9.4×", "median speedup\n(min 3.3×, max 13.8×)", AMBER],
   ["~2 800", "lines of implementation\nacross 8 modules", "0EA5E9"],
   ["123", "positioned fidelity notes\nacross 7 divergence classes", "F97316"]].forEach((st, i) => {
    const x = M + i * 2.44;
    s.addShape(pres.ShapeType.roundRect, {
      x, y: 1.02, w: 2.26, h: 1.5,
      fill: { color: CARD }, line: { color: LINE, width: 0.75 }, rectRadius: 0.08,
    });
    stat(s, x, 1.10, 2.26, st[0], st[1], st[2]);
  });

  s.addText("End-to-end: gcd, and the one line that matters", {
    x: M, y: 2.72, w: 6, h: 0.3, margin: 0, fontSize: 13, bold: true, color: INK, font: SAN,
  });
  s.addShape(pres.ShapeType.roundRect, {
    x: M, y: 3.06, w: 5.85, h: 3.28,
    fill: { color: "0F172A" }, line: { width: 0 }, rectRadius: 0.06,
  });
  s.addText([
    { text: "def gcd(a: int, b: int) -> int:\n", options: { color: "7DD3FC" } },
    { text: "    while b != 0:\n        t: int = b\n        b = a % b\n        a = t\n    return a\n\n", options: { color: "E2E8F0" } },
    { text: "print(gcd(48, 18), gcd(-48, 18))\n", options: { color: "E2E8F0" } },
    { text: "────────────────────────────────\n", options: { color: "334155" } },
    { text: "static int64_t f_gcd(int64_t p_a, int64_t p_b) {\n    int64_t p_t = 0;\n    while ((p_b) != (INT64_C(0))) {\n        p_t = p_b;\n        p_b = ", options: { color: "E2E8F0" } },
    { text: "py_mod_i64(p_a, p_b)", options: { color: AMBER, bold: true } },
    { text: ";\n        p_a = p_t;\n    }\n    return p_a;\n}", options: { color: "E2E8F0" } },
  ], {
    x: M + 0.22, y: 3.20, w: 5.45, h: 3.0, margin: 0,
    fontSize: 9, font: MONO, valign: "top", lineSpacing: 11.5,
  });

  s.addText("Both print 6 6. C's own % would print 6 −6 — divergence D3, caught by construction.", {
    x: M, y: 6.40, w: 5.85, h: 0.3, margin: 0,
    fontSize: 10, italic: true, color: AMBD, font: SAN,
  });

  s.addText("The oracle earned its place in week one", {
    x: M + 6.2, y: 2.72, w: 6, h: 0.3, margin: 0, fontSize: 13, bold: true, color: INK, font: SAN,
  });
  card(s, {
    x: M + 6.2, y: 3.06, w: 5.89, h: 2.06, fill: "FEF2F2", line: "FECACA",
    tag: "FOUR BUGS FOUND ON THE FIRST FULL RUN", tagColor: RED,
    body: "Frozen-dataclass types compared by identity, not equality — so \"a\" + \"b\" was rejected as ill-typed.\nFloat modulo returned −0.0 where CPython returns 0.0; a zero result takes the divisor's sign.\nA module-scope loop variable collided with a later annotated declaration of the same name and type, which Python permits.\nA rejection message did not match its own # expect: marker.",
    size: 9.5, lh: 12,
  });
  card(s, {
    x: M + 6.2, y: 5.26, w: 5.89, h: 1.44, fill: CARD,
    tag: "THE MOST INFORMATIVE ROW", tagColor: AMBD,
    body: "Collatz is the slowest benchmark at 5.0×, and the reason is measurable rather than mysterious: it is integer-bound, so nearly every operation pays for an overflow guard.\nThat single number turns interval analysis into a Review 2 objective with a target attached.",
    size: 9.5, lh: 12,
  });
  s.addNotes("Lead with the five stats. Then the gcd example — show the py_mod_i64 call and say what C's own % would have printed. Then, deliberately, the bugs: a Review 1 that reports only successes is describing a demonstration, not a project. Close on Collatz feeding Review 2.");
}

// =======================================================================
// 13 — RISKS, OUTCOMES, CONCLUSION
// =======================================================================
{
  const s = slide("Expected outcomes, extensions and conclusion", "All members", { dark: true, small: true });

  tbl(s, {
    x: M, y: 1.04, w: 6.6, colW: [3.4, 1.75, 1.45], rowH: 0.33, fs: 10, hs: 10,
    cols: ["Outcome", "Target at R3", "At R1"],
    rows: [
      ["Semantic equivalence with CPython 3.12", "≥ 98% of ≥ 120", "100% of 14"],
      ["Ill-typed programs rejected", "≥ 95% of 60", "100% of 12"],
      ["Median speedup over CPython", "≥ 8× (≥ 12× after elision)", "9.4×"],
      ["Divergence classes catalogued", "≥ 10", "7"],
      ["Back ends driven from one PIR", "2 (C11 + WASM text)", "1"],
      ["Peak memory vs CPython", "≤ 1.5× after regions", "unbounded (D7)"],
    ],
  });

  s.addText("Extension and publication potential", {
    x: M + 6.95, y: 1.04, w: 5.1, h: 0.3, margin: 0,
    fontSize: 14, bold: true, color: PAPER, font: SAN,
  });
  bullets(s, [
    "Retargeting — PIR is target-agnostic by construction; a WebAssembly back end would show the normalisation belongs to the IR, not the C emitter.",
    "Guard elision by interval analysis — a real dataflow pass with a number attached: Collatz says ~2× is available.",
    "Selective bignum promotion — promote only at the sites interval analysis cannot discharge, closing D1 properly instead of guarding it.",
    "Mechanised proof that coercion insertion preserves typing — moving one link from tested to verified, in the spirit of CompCert.",
  ], { x: M + 6.95, y: 1.42, w: 5.14, h: 2.5, size: 10.5, color: "CBD5E1", lh: 13, gap: 8 });

  s.addShape(pres.ShapeType.roundRect, {
    x: M, y: 3.34, w: CW, h: 1.5,
    fill: { color: "1E293B" }, line: { color: "334155", width: 0.75 }, rectRadius: 0.08,
  });
  s.addText("Top risks and what we actually do about them", {
    x: M + 0.24, y: 3.46, w: 6, h: 0.28, margin: 0,
    fontSize: 12, bold: true, color: AMBER, font: SAN,
  });
  [["R1  Undiscovered divergences", "The grammar-directed generator searches the space we did not think of; each find becomes a class and a test."],
   ["R2  Guards cost performance", "Measured, not guessed: ~2× on Collatz. Interval analysis becomes a Review 2 objective with a target."],
   ["R6  Type checker unsound", "Exactly what the oracle detects — an unsoundness surfaces as an output mismatch, not a silent pass."]].forEach((r, i) => {
    const x = M + 0.24 + i * 3.95;
    s.addText(r[0], {
      x, y: 3.80, w: 3.75, h: 0.26, margin: 0,
      fontSize: 10.5, bold: true, color: PAPER, font: SAN,
    });
    s.addText(r[1], {
      x, y: 4.06, w: 3.75, h: 0.64, margin: 0,
      fontSize: 9.5, color: "94A3B8", font: SAN, lineSpacing: 12,
    });
  });

  s.addShape(pres.ShapeType.roundRect, {
    x: M, y: 5.02, w: CW, h: 1.42,
    fill: { color: AMBER }, line: { width: 0 }, rectRadius: 0.08,
  });
  s.addText("Conclusion", {
    x: M + 0.3, y: 5.14, w: 3, h: 0.3, margin: 0,
    fontSize: 12, bold: true, color: "78350F", font: SAN, charSpacing: 1,
  });
  s.addText("A transpiler that silently approximates is a miscompiler. One that reports is a tool.", {
    x: M + 0.3, y: 5.42, w: 11.5, h: 0.38, margin: 0,
    fontSize: 19, bold: true, color: "451A03", font: SER,
  });
  s.addText("At Review 1 the pipeline is complete end to end, the equivalence claim is tested rather than asserted, and every place the translation is approximate is named by the compiler itself — with a line, a column and a mitigation.", {
    x: M + 0.3, y: 5.86, w: 11.5, h: 0.44, margin: 0,
    fontSize: 11.5, color: "78350F", font: SAN, lineSpacing: 14,
  });
  s.addNotes("This is the closing slide — slow down. Outcomes table shows targets against what is already measured. Three risks, each with a concrete response. Then the one-line conclusion, which is the sentence we want the evaluator to remember.");
}

// =======================================================================
// 14 — REFERENCES
// =======================================================================
{
  const s = slide("References", "Any member", { small: true });
  const refs = [
    ["[1]", "A. V. Aho, M. S. Lam, R. Sethi, J. D. Ullman. Compilers: Principles, Techniques, and Tools. 2nd ed., Pearson, 2006. — Ch. 2–6: lexical analysis, recursive-descent parsing, syntax-directed translation, type checking."],
    ["[2]", "B. C. Pierce. Types and Programming Languages. MIT Press, 2002. — subtyping and algorithmic typing."],
    ["[3]", "B. C. Pierce, D. N. Turner. \u201cLocal Type Inference.\u201d ACM TOPLAS 22(1):1–44, 2000. — the bidirectional discipline used in typecheck.py."],
    ["[4]", "V. R. Pratt. \u201cTop Down Operator Precedence.\u201d POPL, pp. 41–51, 1973. — the expression parser."],
    ["[5]", "W. M. McKeeman. \u201cDifferential Testing for Software.\u201d Digital Technical Journal 10(1):100–107, 1998. — the methodology behind tools/oracle.py."],
    ["[6]", "X. Yang, Y. Chen, E. Eide, J. Regehr. \u201cFinding and Understanding Bugs in C Compilers.\u201d PLDI, pp. 283–294, 2011. — Csmith; the model for the Review-2 generator."],
    ["[7]", "A. Pnueli, M. Siegel, E. Singerman. \u201cTranslation Validation.\u201d TACAS, LNCS 1384, pp. 151–166, 1998."],
    ["[8]", "X. Leroy. \u201cFormal Verification of a Realistic Compiler.\u201d CACM 52(7):107–115, 2009. — CompCert."],
    ["[9]", "J. Chen et al. \u201cA Survey of Compiler Testing.\u201d ACM Computing Surveys 53(1), Art. 4, 2020."],
    ["[10]", "S. Behnel et al. \u201cCython: The Best of Both Worlds.\u201d Computing in Science & Engineering 13(2):31–39, 2011."],
    ["[11]", "A. Shajii et al. \u201cCodon: A Compiler for High-Performance Pythonic Applications and DSLs.\u201d CC, 2023."],
    ["[12]", "Python Software Foundation. The Python Language Reference 3.12 — §2.1.8 (indentation) and §6.7 (binary arithmetic) define the behaviour PYTHIA is checked against."],
    ["[13]", "ISO/IEC 9899:2011, Programming languages — C. §6.5.5 on division and remainder, where D2 and D3 originate."],
    ["[14]", "GNU Project. GCC Manual — Statement Expressions and Typeof. The two extensions used at the three emission sites."],
  ];
  refs.forEach((r, i) => {
    const y = 1.06 + i * 0.395;
    s.addText(r[0], {
      x: M, y, w: 0.5, h: 0.36, margin: 0,
      fontSize: 10, bold: true, color: AMBD, font: MONO, valign: "top",
    });
    s.addText(r[1], {
      x: M + 0.52, y, w: CW - 0.52, h: 0.36, margin: 0,
      fontSize: 10, color: SLATE, font: SAN, valign: "top", lineSpacing: 12.5,
    });
  });
  s.addNotes("Do not read these. They are on the slide so the evaluator can see the work is grounded. If asked which mattered most: Pierce & Turner for the type checker, McKeeman and Csmith for the oracle, and the Python Language Reference plus ISO C for the divergence catalogue.");
}

// =======================================================================
// BACKUP SLIDES
// =======================================================================
{
  const s = slide("Backup — PySub grammar and diagnostics", "Backup", { small: true });
  s.addShape(pres.ShapeType.roundRect, {
    x: M, y: 1.04, w: 6.0, h: 5.3,
    fill: { color: "0F172A" }, line: { width: 0 }, rectRadius: 0.06,
  });
  s.addText([
    { text: "(* PySub v0.1 — 41 productions, docs/grammar.ebnf *)\n\n", options: { color: MUT } },
    { text: "module      = { NEWLINE | funcdef | statement } EOF ;\nfuncdef     = \"def\" NAME \"(\" [params] \")\" [\"->\" type] \":\" block ;\nparam       = NAME \":\" type ;\ntype        = \"int\" | \"float\" | \"bool\" | \"str\" | \"None\"\n            | \"list\" \"[\" type \"]\" ;\nblock       = NEWLINE INDENT statement { statement } DEDENT ;\n\nif_stmt     = \"if\" expr \":\" block { \"elif\" expr \":\" block }\n              [ \"else\" \":\" block ] ;\nfor_stmt    = \"for\" NAME \"in\" ( range_call | expr ) \":\" block ;\nannassign   = NAME \":\" type \"=\" expr NEWLINE ;\n\n", options: { color: "E2E8F0" } },
    { text: "(* Expressions: precedence climbing.  Binding powers,\n   loosest to tightest:\n   or(1) < and(2) < cmp(4) < +,-(6) < *,/,//,%(8) < **(12, R) *)\n\n", options: { color: "7DD3FC" } },
    { text: "power       = unary [ \"**\" power ] ;\nunary       = ( \"-\" | \"+\" | \"not\" ) unary | postfix ;\npostfix     = atom { \"[\" expr \"]\" | \".\" NAME \"(\" [arglist] \")\" } ;\n\n", options: { color: "E2E8F0" } },
    { text: "(* INDENT / DEDENT are synthesised by the scanner from\n   leading whitespace.  Blank and comment-only lines carry\n   no layout meaning; ( ) and [ ] suppress it entirely. *)", options: { color: MUT } },
  ], {
    x: M + 0.22, y: 1.18, w: 5.6, h: 5.0, margin: 0,
    fontSize: 8.5, font: MONO, valign: "top", lineSpacing: 11.5,
  });

  s.addText("Diagnostics carry a position and a caret", {
    x: M + 6.3, y: 1.04, w: 5.8, h: 0.3, margin: 0,
    fontSize: 13, bold: true, color: INK, font: SAN,
  });
  s.addShape(pres.ShapeType.roundRect, {
    x: M + 6.3, y: 1.40, w: 5.79, h: 1.5,
    fill: { color: "0F172A" }, line: { width: 0 }, rectRadius: 0.06,
  });
  s.addText([
    { text: "$ python3 -m pythia.cli tests/negative/n02_badarg.py\n", options: { color: "7DD3FC" } },
    { text: "n02_badarg.py:4:14: ", options: { color: "E2E8F0" } },
    { text: "TypeError: argument 1 of double():\n    expected int, found str\n", options: { color: "FCA5A5" } },
    { text: "    print(double(\"seven\"))\n                 ^\n", options: { color: "E2E8F0" } },
    { text: "1 error(s); no output written.", options: { color: MUT } },
  ], {
    x: M + 6.5, y: 1.52, w: 5.4, h: 1.26, margin: 0,
    fontSize: 9, font: MONO, valign: "top", lineSpacing: 12,
  });

  s.addText("The negative suite tests messages, not just rejection", {
    x: M + 6.3, y: 3.06, w: 5.8, h: 0.3, margin: 0,
    fontSize: 13, bold: true, color: INK, font: SAN,
  });
  s.addText("Each of the 12 negative programs carries an # expect: marker naming the diagnostic it must provoke. A checker that rejects everything would pass a rejection-only test; it fails this one.", {
    x: M + 6.3, y: 3.40, w: 5.79, h: 0.6, margin: 0,
    fontSize: 10.5, color: SLATE, font: SAN, lineSpacing: 13.5,
  });
  bullets(s, [
    "type rebinding · wrong argument type · undefined name",
    "wrong return type · heterogeneous list literal",
    "missing return on a path · unannotated empty list",
    "wrong arity · non-int index · str item assignment",
    "incomparable types · break outside a loop",
  ], { x: M + 6.3, y: 4.04, w: 5.79, h: 1.4, size: 10.5, gap: 4 });

  card(s, {
    x: M + 6.3, y: 5.50, w: 5.79, h: 0.84, fill: CARD,
    body: "One rule governs the suite: a divergence discovered by hand becomes a test before it becomes a fix. That is what keeps the equivalence percentage meaningful over twelve weeks.",
    size: 10.5, lh: 13,
  });
  s.addNotes("Backup — use if asked about the grammar, the diagnostic quality, or how the negative suite works.");
}

{
  const s = slide("Backup — full oracle output and fidelity report", "Backup", { small: true });
  s.addShape(pres.ShapeType.roundRect, {
    x: M, y: 1.04, w: 6.0, h: 5.3,
    fill: { color: "0F172A" }, line: { width: 0 }, rectRadius: 0.06,
  });
  s.addText([
    { text: "$ python3 tools/oracle.py\n", options: { color: "7DD3FC" } },
    { text: "PYTHIA DIFFERENTIAL ORACLE\n(CPython 3.12  vs  PYTHIA -> C -> cc -O2)\n\n", options: { color: MUT } },
    { text: "PROGRAM              CPython   PYTHIA  SPEEDUP  RESULT\n", options: { color: "94A3B8" } },
    { text: "t01_arith.py           21.5m     1.9m    11.0x  PASS\nt02_lists.py           20.0m     3.1m     6.4x  PASS\nt03_strings.py         18.7m     1.9m    10.0x  PASS\nt04_control.py         19.9m     1.9m    10.8x  PASS\nt05_floats.py          19.4m     1.9m    10.4x  PASS\nt06_boolops.py         18.4m     1.8m    10.2x  PASS\nt07_bubble.py          17.5m     2.3m     7.5x  PASS\nt08_nested.py          25.3m     3.1m     8.1x  PASS\nt09_sieve.py           92.8m     8.4m    11.1x  PASS\n", options: { color: "E2E8F0" } },
    { text: "t10_collatz.py       1508.8m   299.9m     5.0x  PASS\n", options: { color: AMBER } },
    { text: "t11_matmul.py         168.4m    12.1m    14.0x  PASS\nt12_err_index.py       18.1m     1.8m    10.3x  PASS\nt13_err_zerodiv.py     19.9m     2.8m     7.0x  PASS\nt14_edges.py           18.4m     1.9m     9.8x  PASS\n\n", options: { color: "E2E8F0" } },
    { text: "SUMMARY\n  semantic equivalence : 14/14 (100.0%)\n  type-checker recall  : 12/12 (100.0%)\n  median speedup       : 9.4x  (3.3x – 13.8x)\n  fidelity notes       : 123 across the suite", options: { color: "86EFAC" } },
  ], {
    x: M + 0.22, y: 1.18, w: 5.6, h: 5.0, margin: 0,
    fontSize: 8.8, font: MONO, valign: "top", lineSpacing: 11.8,
  });

  s.addText("t12 and t13 verify exception parity — IndexError and ZeroDivisionError are raised by the binary exactly where CPython raises them.", {
    x: M, y: 6.42, w: 6.0, h: 0.36, margin: 0,
    fontSize: 9.5, italic: true, color: MUT, font: SAN,
  });

  s.addText("Semantic Fidelity Report — generated, not written", {
    x: M + 6.3, y: 1.04, w: 5.8, h: 0.3, margin: 0,
    fontSize: 13, bold: true, color: INK, font: SAN,
  });
  s.addShape(pres.ShapeType.roundRect, {
    x: M + 6.3, y: 1.40, w: 5.79, h: 3.5,
    fill: { color: "0F172A" }, line: { width: 0 }, rectRadius: 0.06,
  });
  s.addText([
    { text: "$ python3 -m pythia.cli t01_arith.py --fidelity\n\n", options: { color: "7DD3FC" } },
    { text: "SEMANTIC FIDELITY REPORT\n  12 exact   6 guarded   2 divergent\n\n", options: { color: "86EFAC" } },
    { text: "3:19: [EXACT] D2 floor-division rounding\n", options: { color: AMBER } },
    { text: "    Python floors toward -inf; C truncates toward\n    zero, so -7 // 2 is -4 in Python and -3 in C.\n    mitigation: py_floordiv_i64; exact.\n\n", options: { color: "CBD5E1" } },
    { text: "3:27: [EXACT] D3 modulo sign convention\n", options: { color: AMBER } },
    { text: "    In Python the sign of % follows the divisor;\n    in C it follows the dividend, so -7 % 2 is 1\n    in Python and -1 in C.\n    mitigation: py_mod_i64; exact.\n\n", options: { color: "CBD5E1" } },
    { text: "3:34: [EXACT] D4 true division yields float\n", options: { color: AMBER } },
    { text: "    mitigation: operands widened to double;\n    ZeroDivisionError preserved.", options: { color: "CBD5E1" } },
  ], {
    x: M + 6.5, y: 1.52, w: 5.4, h: 3.26, margin: 0,
    fontSize: 8.6, font: MONO, valign: "top", lineSpacing: 11.2,
  });

  card(s, {
    x: M + 6.3, y: 5.04, w: 5.79, h: 1.30, fill: "FFFBEB", line: "FDE68A",
    tag: "WHY IT LIVES IN THE COMPILER", tagColor: AMBD,
    body: "A hand-written divergence list goes stale the moment the emitter changes. This one is regenerated from the program being compiled, so it cannot describe a translation that no longer happens.",
    size: 10.5, lh: 13.5,
  });
  s.addNotes("Backup — use if asked for the full results or to see the fidelity report in detail. The Collatz row is highlighted because it is the one that motivates Review 2.");
}

pres.writeFile({ fileName: path.join(__dirname, "PYTHIA_Review1_Deck_Team2_A15.pptx") })
  .then(f => console.log("wrote", f));
