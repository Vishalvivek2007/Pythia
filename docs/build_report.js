const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle,
  ImageRun, PageBreak, Footer, PageNumber, LevelFormat, convertInchesToTwip,
} = require("docx");

const W = 9638;                       // content width in DXA (A4, 2cm side margins)
const INK = "1A1A1A", MUT = "555555", ACC = "1D4ED8", RULE = "D4D4D4";
const HDR = "EEF2FF", ALT = "F8FAFC";

const MONO = "Consolas";
const SANS = "Calibri";

// ---------------------------------------------------------------- helpers
const P = (text, o = {}) => new Paragraph({
  alignment: o.align, spacing: { before: o.before ?? 0, after: o.after ?? 120, line: o.line ?? 264 },
  indent: o.indent, border: o.border, keepNext: o.keepNext,
  children: (Array.isArray(text) ? text : [text]).map(t =>
    typeof t === "string"
      ? new TextRun({ text: t, size: o.size ?? 20, color: o.color ?? INK, font: o.font ?? SANS, bold: o.bold, italics: o.italics })
      : t),
});

const R = (text, o = {}) => new TextRun({
  text, size: o.size ?? 20, color: o.color ?? INK, font: o.font ?? SANS,
  bold: o.bold, italics: o.italics,
});

const H1 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_1, spacing: { before: 340, after: 150 },
  border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: ACC, space: 6 } },
  children: [new TextRun({ text, size: 26, bold: true, color: ACC, font: SANS })],
});

const H2 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_2, spacing: { before: 220, after: 90 },
  children: [new TextRun({ text, size: 22, bold: true, color: INK, font: SANS })],
});

const CODE = (lines) => lines.map((l, i) => new Paragraph({
  spacing: { before: i === 0 ? 60 : 0, after: i === lines.length - 1 ? 140 : 0, line: 232 },
  shading: { type: ShadingType.CLEAR, fill: "F5F5F4" },
  indent: { left: 170, right: 170 },
  children: [new TextRun({ text: l || " ", size: 15, font: MONO, color: "26262B" })],
}));

const BUL = (text, o = {}) => new Paragraph({
  numbering: { reference: "bul", level: 0 },
  spacing: { after: 70, line: 264 },
  children: (Array.isArray(text) ? text : [text]).map(t =>
    typeof t === "string" ? new TextRun({ text: t, size: 20, color: INK, font: SANS }) : t),
});

const cell = (content, o = {}) => new TableCell({
  width: { size: o.w, type: WidthType.DXA },
  columnSpan: o.span,
  shading: { type: ShadingType.CLEAR, fill: o.fill ?? "FFFFFF" },
  margins: { top: 60, bottom: 60, left: 100, right: 100 },
  verticalAlign: "center",
  children: (Array.isArray(content) ? content : [content]).map(c =>
    typeof c === "string"
      ? new Paragraph({
          spacing: { after: 0, line: 240 }, alignment: o.align,
          children: [new TextRun({ text: c, size: o.size ?? 17, bold: o.bold, color: o.color ?? INK, font: o.font ?? SANS })],
        })
      : c),
});

function table(cols, rows, opt = {}) {
  const widths = cols.map(c => Math.round(W * c.f));
  widths[widths.length - 1] = W - widths.slice(0, -1).reduce((a, b) => a + b, 0);
  const head = new TableRow({
    tableHeader: true,
    children: cols.map((c, i) => cell(c.t, { w: widths[i], fill: HDR, bold: true, size: 16, color: "1E3A8A" })),
  });
  const body = rows.map((r, ri) => new TableRow({
    children: r.map((v, i) => cell(v, {
      w: widths[i],
      fill: ri % 2 ? ALT : "FFFFFF",
      size: opt.size ?? 16,
      font: opt.mono && i >= (opt.monoFrom ?? 0) ? MONO : SANS,
      bold: opt.boldCol === i,
    })),
  }));
  return new Table({
    columnWidths: widths, width: { size: W, type: WidthType.DXA },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 2, color: RULE },
      bottom: { style: BorderStyle.SINGLE, size: 2, color: RULE },
      left: { style: BorderStyle.SINGLE, size: 2, color: RULE },
      right: { style: BorderStyle.SINGLE, size: 2, color: RULE },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: RULE },
      insideVertical: { style: BorderStyle.SINGLE, size: 2, color: RULE },
    },
    rows: [head, ...body],
  });
}

const GAP = (n = 120) => new Paragraph({ spacing: { after: n }, children: [] });

function figure(file, caption, widthPx) {
  const buf = fs.readFileSync(path.join(__dirname, file));
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER, spacing: { before: 140, after: 60 },
      children: [new ImageRun({ data: buf, type: "png", transformation: { width: widthPx, height: Math.round(widthPx * imgRatio(buf)) } })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER, spacing: { after: 200 },
      children: [new TextRun({ text: caption, size: 16, italics: true, color: MUT, font: SANS })],
    }),
  ];
}

function imgRatio(buf) {                       // PNG IHDR
  const w = buf.readUInt32BE(16), h = buf.readUInt32BE(20);
  return h / w;
}

// ================================================================= CONTENT
const MEMBERS = [
  ["1", "VISHAL VIVEK", "24BCE2377", "Project Lead · Front end & integration"],
  ["2", "RUJUTA MANGESH KULKARNI", "24BDS0459", "Type system & semantic analysis"],
  ["3", "KOLIPARTHY VENKATA JAHNAVI", "24BDS0132", "IR, lowering & runtime"],
  ["4", "AARYAN GUPTA", "24BDS0134", "Code generation, testing & planning"],
];

const doc = new Document({
  creator: "BCSE307L Team 2",
  title: "PYTHIA — Review 1: Typed Source-to-Source Transpiler",
  numbering: {
    config: [{
      reference: "bul",
      levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 340, hanging: 190 } } } }],
    }],
  },
  styles: { default: { document: { run: { font: SANS, size: 20, color: INK } } } },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 },
        margin: { top: 1300, bottom: 1200, left: 1134, right: 1134 },
      },
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          border: { top: { style: BorderStyle.SINGLE, size: 4, color: RULE, space: 6 } },
          children: [
            new TextRun({ text: "BCSE307L Compiler Design · Team 2 · Project A15 · PYTHIA · Review 1", size: 14, color: MUT }),
            new TextRun({ text: "     " , size: 14 }),
            new TextRun({ children: ["Page ", PageNumber.CURRENT, " of ", PageNumber.TOTAL_PAGES], size: 14, color: MUT }),
          ],
        })],
      }),
    },
    children: [

// ------------------------------------------------------------- COVER PAGE
GAP(700),
P("BCSE307L · COMPILER DESIGN", { align: AlignmentType.CENTER, size: 19, bold: true, color: MUT, after: 60 }),
P("PROJECT REVIEW 1 — INITIAL DESIGN, PLANNING AND FEASIBILITY", { align: AlignmentType.CENTER, size: 17, color: MUT, after: 420 }),

P("PYTHIA", { align: AlignmentType.CENTER, size: 76, bold: true, color: ACC, after: 60 }),
P("A statically typed Python-subset → C transpiler", { align: AlignmentType.CENTER, size: 28, after: 40 }),
P("with a differential-testing oracle and a Semantic Fidelity Report", { align: AlignmentType.CENTER, size: 28, after: 500 }),

table(
  [{ t: "", f: 0.30 }, { t: "", f: 0.70 }],
  [
    ["Course Code / Title", "BCSE307L — Compiler Design"],
    ["Team Number", "Team 2"],
    ["Project ID and Title", "A15 — Typed Source-to-Source Transpiler"],
    ["Institution", "Vellore Institute of Technology, Vellore"],
    ["Review Date", "___________________"],
    ["Faculty / Evaluator", "___________________"],
  ], { boldCol: 0, size: 18 }),
GAP(320),

P("TEAM MEMBERS", { align: AlignmentType.CENTER, size: 17, bold: true, color: MUT, after: 100 }),
table(
  [{ t: "#", f: 0.06 }, { t: "Name", f: 0.36 }, { t: "Register No.", f: 0.18 }, { t: "Role", f: 0.40 }],
  MEMBERS, { size: 17 }),
GAP(260),
P("Repository: github.com/<team2>/pythia   ·   Language of implementation: Python 3.12 (compiler) + C11 (runtime and target)",
  { align: AlignmentType.CENTER, size: 15, color: MUT, italics: true }),

new Paragraph({ children: [new PageBreak()] }),

// ------------------------------------------------------------------- TOC
H1("Contents"),
table(
  [{ t: "§", f: 0.07 }, { t: "Section", f: 0.63 }, { t: "Review-1 rubric component", f: 0.30 }],
  [
    ["1", "Abstract", "—"],
    ["2", "Problem Statement and Motivation", "C1 · 2.0"],
    ["3", "Objectives, Scope and Limitations", "C1 · 2.0"],
    ["4", "Background, Literature and Tool Survey", "C2 · 1.5"],
    ["5", "Requirements and Feasibility", "C4 · 1.0"],
    ["6", "Proposed Methodology", "C3 · 2.0"],
    ["7", "Architecture and Data Flow", "C3 · 2.0"],
    ["8", "Module Description", "C3 · 2.0"],
    ["9", "Team Responsibility Matrix", "C5 · 1.5"],
    ["10", "Timeline and Review-Wise Deliverables", "C5 · 1.5"],
    ["11", "Initial Progress and Proof of Start", "C6 · 1.0"],
    ["12", "Testing Strategy", "C6 · 1.0"],
    ["13", "Expected Results and Extension Potential", "C1 · 2.0"],
    ["14", "References", "—"],
    ["A", "Appendix — contribution log, meeting record, viva pack", "C7 · 1.0"],
  ], { size: 17 }),

// -------------------------------------------------------------- 1 ABSTRACT
H1("1  Abstract"),
P("Python is the default language for teaching, scripting and prototyping, but a CPython program cannot be shipped without its interpreter and typically runs an order of magnitude slower than compiled code. Existing accelerators respond in one of three ways: they keep the interpreter in the loop (Cython, mypyc), they re-implement Python semantics wholesale (Nuitka), or they translate aggressively and change behaviour without saying so (Codon, Transcrypt). None of them tells the programmer where the translation stopped being faithful."),
P("PYTHIA is a source-to-source transpiler for PySub — a statically typed subset of Python 3 in which every function is annotated and every variable holds one static type for its lifetime. PySub programs are scanned with an off-side-rule lexer, parsed by recursive descent with a Pratt expression parser, checked by a bidirectional type checker with local inference, normalised into a homogeneously typed intermediate representation, and emitted as readable, dependency-free C11."),
P("The project's distinguishing claim is not that it produces C, but that it produces C which observably behaves like CPython — and that it ships the falsifier for that claim. A differential-testing oracle runs every test program under both CPython 3.12 and the compiled binary and demands byte-identical standard output and identical exception classes. Alongside the generated code, PYTHIA emits a Semantic Fidelity Report naming every site where Python and C semantics diverge, the divergence class, and the mitigation applied. At Review 1 the pipeline is complete end to end: 14 of 14 programs are semantically equivalent, 12 of 12 ill-typed programs are rejected, and the generated code runs a median 9.4× faster than CPython."),

// ------------------------------------------------------------- 2 PROBLEM
H1("2  Problem Statement and Motivation"),

H2("2.1  Context"),
P("A source-to-source translator sits in an awkward place in the compiler literature. It performs the entire front end of a real compiler — lexical analysis, parsing, scope resolution, type checking, intermediate representation, code generation — but its target is another high-level language, so its correctness obligation is stated in terms of two languages' semantics rather than one language and one machine. Where a conventional compiler must not miscompile, a transpiler must not mistranslate, and mistranslation is easy to hide: the output compiles, it runs, it prints something plausible, and the divergence surfaces months later on a negative operand."),
P("Python and C are an unusually instructive pair for this problem because their arithmetic disagrees in ways that are invisible on the happy path. Integer division rounds in opposite directions. The modulo operator takes its sign from opposite operands. Python's integers are unbounded; C's are 64 bits. Python indexes from the end with negative subscripts and raises on overflow of a list bound; C indexes into raw memory and does not. Each of these is a one-line difference that changes the output of a program without changing its shape."),

H2("2.2  Precise problem statement"),
new Paragraph({
  spacing: { before: 60, after: 160, line: 276 },
  indent: { left: 200, right: 200 },
  border: { left: { style: BorderStyle.SINGLE, size: 14, color: ACC, space: 10 } },
  children: [R("Given a program ", { size: 20 }), R("P", { size: 20, italics: true, bold: true }),
    R(" written in PySub, construct a C11 program ", { size: 20 }), R("C(P)", { size: 20, italics: true, bold: true }),
    R(" and a machine-generated report ", { size: 20 }), R("R(P)", { size: 20, italics: true, bold: true }), R(" such that:", { size: 20 })],
}),
BUL([R("(i)  ", { bold: true }), R("C(P) compiles under any conforming C11 compiler with no dependency beyond the PYTHIA runtime library;")]),
BUL([R("(ii) ", { bold: true }), R("for every input on which P terminates, C(P) produces byte-identical standard output and raises the same exception class as CPython 3.12;")]),
BUL([R("(iii)", { bold: true }), R("  every construct in P whose C image is not provably equivalent appears in R(P) with its source position, its divergence class, and the mitigation applied;")]),
BUL([R("(iv) ", { bold: true }), R("any P that is not type-correct is rejected before a single line of C is emitted, with a diagnostic naming the line, the column and the two types in conflict.")]),
P("Conditions (ii) and (iii) together are the contribution. Condition (ii) alone is what every transpiler claims and none demonstrates; condition (iii) is what makes the claim auditable when (ii) cannot be met.", { before: 60 }),

H2("2.3  Why it matters, and to whom"),
table(
  [{ t: "Beneficiary", f: 0.26 }, { t: "What they get from PYTHIA", f: 0.74 }],
  [
    ["Embedded and edge developers", "A path from a prototyped Python algorithm to a self-contained native binary with no 30 MB interpreter, no shared objects, and a written record of every place the semantics were approximated."],
    ["Teams porting legacy Python", "An audit trail. A migration is defensible when you can point at the list of divergences and say what was done about each one; it is not defensible when the answer is \u201cit seemed to work\u201d."],
    ["Compiler-design students", "A pipeline small enough to read in an afternoon in which every classical phase is present and the semantic-gap problem is made explicit rather than assumed away."],
    ["The project team", "A correctness obligation that cannot be satisfied by demonstration. The oracle either passes or it does not, which converts \u201cwe think it works\u201d into a number that appears in CI."],
  ], { size: 17 }),

// ---------------------------------------------------------- 3 OBJECTIVES
H1("3  Objectives, Scope and Limitations"),
H2("3.1  Measurable objectives"),
P("Each objective states a metric, a target, and the instrument that measures it. The final column records the value already achieved at Review 1.", { after: 140 }),
table(
  [{ t: "#", f: 0.05 }, { t: "Objective", f: 0.40 }, { t: "Target metric", f: 0.29 }, { t: "Instrument", f: 0.14 }, { t: "At R1", f: 0.12 }],
  [
    ["O1", "Formally specify PySub, a statically typed subset of Python 3", "≥ 40 EBNF productions; every construct implemented or explicitly excluded", "docs/grammar.ebnf", "41 ✓"],
    ["O2", "Reject every ill-typed program before emission, with positioned diagnostics", "≥ 95% of a 60-program negative suite rejected; 0 false rejections on the positive suite", "tools/oracle.py", "12/12 ✓"],
    ["O3", "Preserve observable semantics against CPython 3.12", "≥ 98% of ≥ 120 programs byte-identical stdout and identical exception class", "differential oracle", "14/14 ✓"],
    ["O4", "Catalogue and report every Python↔C divergence", "≥ 7 divergence classes; every occurrence positioned; ≥ 90% classified exact or guarded", "--fidelity report", "7 classes ✓"],
    ["O5", "Produce competitive native code", "median ≥ 8× speedup over CPython 3.12 on ≥ 15 benchmark programs", "oracle timing harness", "9.4× ✓"],
  ], { size: 16 }),
P("O2 and O3 grow their corpora across the review cycle: the suites stand at 12 and 14 programs today and are scheduled to reach 60 and 120 by Review 2, largely through the grammar-based program generator described in §12.", { before: 100, size: 18, color: MUT, italics: true }),

H2("3.2  Scope — what PySub includes"),
table(
  [{ t: "Category", f: 0.22 }, { t: "Included in PySub v0.1", f: 0.78 }],
  [
    ["Types", "int, float, bool, str, list[int], list[float], list[bool], list[str], None"],
    ["Declarations", "def with mandatory parameter and return annotations; mutual recursion; annotated and inferred local variables"],
    ["Control flow", "if / elif / else, while, for … in range(…) with 1–3 arguments, for … in list, for … in str, break, continue, return, pass"],
    ["Operators", "+ − * / // % ** with Python's rounding and typing rules; == != < <= > >=; and, or, not with Python truthiness and short-circuit value semantics"],
    ["Containers", "list literals, indexing and index assignment including negative indices, bounds checking, .append(), .pop(), concatenation, equality"],
    ["Strings", "immutable str with concatenation, repetition, indexing, comparison, len(), .upper(), .lower(), iteration"],
    ["Builtins", "print (multi-argument, Python spacing and repr rules), len, abs, min, max, int, float, str, bool"],
  ], { size: 17 }),

H2("3.3  Limitations and deliberate exclusions"),
P("Excluding a feature is a design decision only if it is written down and dated. The following are out of PySub v0.1 and each is assigned to a later review.", { after: 130 }),
table(
  [{ t: "Excluded", f: 0.30 }, { t: "Reason", f: 0.48 }, { t: "Scheduled", f: 0.22 }],
  [
    ["Classes and methods", "Requires a vtable or monomorphisation strategy and a story for object identity", "Review 3"],
    ["dict and set", "Needs a hash-table runtime with Python's iteration-order guarantee", "Review 3"],
    ["Nested containers, list[list[T]]", "Monomorphic list codegen must become recursive; type checker already detects and reports the case", "Review 2"],
    ["Closures and nested def", "Needs escape analysis to decide heap vs stack capture", "Out of scope"],
    ["try / except / raise", "Runtime already raises the correct classes; catching them needs an unwinding mechanism in C", "Review 3"],
    ["Slicing, generators, imports, keyword and default arguments", "Orthogonal to the semantic-preservation question this project is about", "Out of scope"],
    ["Arbitrary-precision integers", "Would need a bignum runtime; PySub bounds ints at int64 and traps overflow rather than wrapping (divergence D1)", "Documented, not fixed"],
  ], { size: 17 }),

H2("3.4  Assumptions"),
BUL("The reference implementation is CPython 3.12 on Linux x86-64; \u201ccorrect\u201d means \u201cagrees with that\u201d."),
BUL("Programs are single-module and terminate; non-terminating programs are outside the equivalence claim."),
BUL("Observable behaviour is standard output plus the class of any uncaught exception. Timing, memory and stderr text are not part of the equivalence obligation."),
BUL("The C compiler is C11-conforming and supports two GNU extensions — statement expressions and __typeof__ — used at exactly three emission sites (§5.4)."),

// ---------------------------------------------------------- 4 BACKGROUND
H1("4  Background, Literature and Tool Survey"),

H2("4.1  Compiler-design concepts the project rests on"),
table(
  [{ t: "Concept", f: 0.26 }, { t: "How it is used in PYTHIA", f: 0.74 }],
  [
    ["Lexical analysis and the off-side rule", "Python's block structure is carried by indentation, so its token stream is not context-free until layout is reified. The scanner maintains a stack of indentation widths and synthesises INDENT and DEDENT tokens, after which the parser uses an ordinary block grammar. Blank and comment-only lines carry no layout meaning; brackets suppress it entirely."],
    ["Recursive-descent parsing", "One mutually recursive procedure per non-terminal for statements. Straightforward to write, and — more importantly — straightforward to recover in: panic-mode synchronisation on NEWLINE and statement-keyword boundaries lets one run report several syntax errors."],
    ["Pratt / precedence climbing", "Expressions are parsed by top-down operator precedence (Pratt, 1973) with a binding-power table, which handles Python's eight precedence levels and the right-associativity of ** without an eight-level cascade of grammar rules."],
    ["Symbol tables and scope", "A parent-linked scope chain. PySub functions are deliberately closed over their parameters and locals only, which removes the global/nonlocal question from v0.1 and makes each function independently translatable."],
    ["Bidirectional type checking", "Expressions synthesise a type bottom-up; where an expected type is known — an annotation, a return, an argument position, an append — it is pushed inward and checked. This is Pierce and Turner's local type inference, and it is the reason empty list literals can be typed at all."],
    ["Intermediate representation", "The typed AST is normalised into PIR by making every implicit Python coercion explicit. After that pass the tree is homogeneously typed and the emitter never has to infer anything, which is what keeps the back end small."],
    ["Syntax-directed translation", "Emission is a single structural walk of PIR; each node's C image is a function of its own type and its children's, with no global analysis in v0.1."],
    ["Translation validation and differential testing", "Rather than prove equivalence, PYTHIA tests it adversarially: the same program is executed by both language implementations and the outputs are compared. This is McKeeman's differential testing applied to a translator instead of a compiler, and it is what Csmith did for C compilers."],
  ], { size: 16 }),

H2("4.2  Existing systems and where they stop"),
P("Nine systems address some part of \u201cmake Python go faster or run elsewhere\u201d. The table compares them on the four questions this project cares about.", { after: 130 }),
table(
  [{ t: "System", f: 0.16 }, { t: "Approach", f: 0.28 }, { t: "Static type checking", f: 0.13 },
   { t: "Output artefact", f: 0.16 }, { t: "Interpreter-free", f: 0.12 }, { t: "Reports divergence", f: 0.15 }],
  [
    ["mypy", "Type checker only; no code generation", "Yes", "None", "n/a", "n/a"],
    ["mypyc", "Typed Python → C extension module", "Yes (via mypy)", "C extension", "No", "No"],
    ["Cython", "Annotated Python → C via CPython API", "Partial (cdef)", "C extension", "No", "No"],
    ["Nuitka", "Whole-program Python → C++ with CPython runtime", "No", "Binary + runtime", "No", "No"],
    ["Codon", "Python-like language → LLVM IR", "Yes (inference)", "Native binary", "Yes", "No — silently redefines int as 64-bit"],
    ["Shed Skin", "Implicitly typed Python → C++", "Inference only", "C++ / binary", "Yes", "No"],
    ["Transcrypt", "Python → JavaScript", "No", "JavaScript", "n/a", "No"],
    ["py2many", "Python → C++/Rust/Go/Julia (rule-driven)", "Shallow", "Source", "Varies", "No"],
    ["PYTHIA", "Typed Python subset → readable C11", "Yes, bidirectional", "C source + native binary", "Yes", "Yes — positioned report"],
  ], { size: 15 }),

H2("4.3  The gap"),
P("Read down the last two columns. Every system that produces an interpreter-free artefact does so by quietly choosing a semantics and not telling you which one; every system that type-checks carefully declines to generate code. The three-part gap PYTHIA addresses is therefore:"),
BUL([R("Verification, not assertion. ", { bold: true }), R("Semantic preservation is universally claimed and almost never demonstrated. An executable differential oracle turns the claim into a CI number that can fail.")]),
BUL([R("Divergence as a first-class output. ", { bold: true }), R("No surveyed tool emits a machine-generated, source-positioned account of where the translation is approximate. Codon's redefinition of int is the canonical example: it is documented in prose, invisible in the output, and the programmer finds out at run time.")]),
BUL([R("Readability of the target. ", { bold: true }), R("Cython and Nuitka emit C that is generated-code-shaped and effectively unreviewable. For an audit trail to be worth anything a human has to be able to read what was produced.")]),
P("PYTHIA is not competing with Codon on breadth or Cython on maturity. Its claim is narrower and checkable: within a subset small enough to reason about, translation is verified rather than asserted, and where it cannot be verified it is reported.", { before: 60, italics: true, color: MUT }),

// ------------------------------------------------------- 5 REQUIREMENTS
H1("5  Requirements and Feasibility"),

H2("5.1  Software requirements"),
table(
  [{ t: "Component", f: 0.24 }, { t: "Version / choice", f: 0.22 }, { t: "Purpose", f: 0.34 }, { t: "Justification", f: 0.20 }],
  [
    ["Python", "3.10 or later", "Implementation language of the compiler", "Pattern matching, dataclasses, no build step"],
    ["C compiler", "gcc 13 / clang 16, C11", "Compiles emitted code and the runtime", "Universally available; validates the output is real C"],
    ["Standard C library", "glibc / musl", "printf, strtod, memcpy in the runtime", "No third-party runtime dependency"],
    ["Git + GitHub Actions", "any", "Version control; oracle runs on every push", "Produces the per-member commit evidence the rubric asks for"],
    ["Graphviz + Matplotlib", "dot 2.43, mpl 3.10", "Regenerating architecture and Gantt figures", "Documentation only; not needed to build or run"],
    ["CPython 3.12", "reference", "Ground truth for the differential oracle", "The specification of \u201ccorrect\u201d for this project"],
  ], { size: 16 }),

H2("5.2  Hardware requirements"),
P("Any x86-64 or ARM64 machine with 4 GB RAM and 1 GB free disk. The heaviest benchmark in the suite is a 90×90 dense matrix multiply that CPython finishes in under two seconds. No GPU, no cluster, no cloud credit: this is deliberate, because a project whose evaluation cannot be reproduced on a teammate's laptop is a project whose evaluation cannot be checked."),

H2("5.3  Test inputs, grammars and datasets"),
P("The project needs no external dataset, which removes an entire class of risk. Its inputs are three self-authored corpora:"),
BUL([R("Positive corpus ", { bold: true }), R("— PySub programs exercising each language feature and each divergence class. Currently 14; target 120 by Review 2.")]),
BUL([R("Negative corpus ", { bold: true }), R("— ill-typed programs, each carrying an # expect: marker naming the diagnostic it must provoke, so the suite tests message quality and not merely rejection. Currently 12; target 60.")]),
BUL([R("Generated corpus ", { bold: true }), R("— a grammar-directed random program generator (Review 2) that samples well-typed PySub programs from the EBNF, in the spirit of Csmith. This is how the corpus reaches 120 without 120 hand-written files, and how the team finds divergences it did not think of.")]),
P("The grammar itself, docs/grammar.ebnf, is a project artefact in its own right: it is the specification the parser is checked against and the source the generator samples from."),

H2("5.4  Constraints"),
BUL([R("GNU C extensions. ", { bold: true }), R("Python's and/or return an operand, not a boolean, and must not re-evaluate it. Reproducing that in an expression context needs statement expressions and __typeof__. This is confined to three emission sites — value-position boolean operators, list literals, and min/max — and each has a known ISO C fallback via a lifted temporary, planned for Review 2.")]),
BUL([R("No reclamation in v0.1. ", { bold: true }), R("Strings and lists are heap-allocated and never freed (divergence D7). Peak memory therefore exceeds CPython's on allocation-heavy programs. Observable output is unaffected, which is why this is a constraint and not a defect; region-based reclamation is the Review 3 target.")]),
BUL([R("int64 bound. ", { bold: true }), R("PySub integers are 64-bit. Rather than wrap silently — which is undefined behaviour in C and simply wrong against Python — every arithmetic site is guarded and raises OverflowError. Sound, not complete, and measured: the guards cost roughly 2× on integer-hot code (§11.3).")]),
BUL([R("Single module. ", { bold: true }), R("No import; separate compilation and a linker story are out of scope.")]),

H2("5.5  Risk register"),
table(
  [{ t: "#", f: 0.05 }, { t: "Risk", f: 0.30 }, { t: "L", f: 0.06 }, { t: "I", f: 0.06 }, { t: "Mitigation", f: 0.53 }],
  [
    ["R1", "Undiscovered divergence classes beyond D1–D7", "High", "High", "The grammar-directed generator (Review 2) searches the space the team did not think of. Every new divergence found becomes a catalogued class and a regression test, so the corpus grows monotonically."],
    ["R2", "Overflow guards make generated code uncompetitive", "Med", "Med", "Already measured at ~2× on the Collatz benchmark. Review 2 adds interval analysis to elide guards on provably in-range operations — a genuine dataflow optimisation pass and a rubric-worthy deliverable in itself."],
    ["R3", "Scope creep into classes, dicts and slicing", "High", "High", "Scope frozen at PySub v0.1 in the Week-1 minutes. The type checker rejects out-of-subset constructs with an explicit \u201coutside the PySub subset\u201d message naming the review in which it lands, so creep is visible rather than accidental."],
    ["R4", "A member is unavailable near a review", "Med", "High", "Each module has a documented interface, a primary owner and a named secondary (§9). The pipeline is staged, so a stalled phase blocks only its successor, and the oracle localises the failure automatically."],
    ["R5", "Generated C fails to compile on a different toolchain", "Low", "Med", "CI compiles with both gcc and clang under -Wall. GNU-extension use is confined to three sites with a known ISO fallback."],
    ["R6", "Type checker unsound — accepts a program that then misbehaves", "Med", "High", "This is exactly what the oracle detects: a soundness hole shows up as an output mismatch, not as a silent pass. Four such bugs were found and fixed this way in Week 3 (§11.4)."],
  ], { size: 16 }),

H2("5.6  Feasibility verdict"),
P("Technical feasibility is not an estimate at this point: the pipeline is complete end to end and the oracle passes. Schedule feasibility rests on the phases being independently ownable, which the module boundaries in §8 make true. Resource feasibility is trivial — four laptops and a C compiler. The principal residual risk is R1, and it is a risk about how much the team will discover, not about whether the approach works."),

// ------------------------------------------------------- 6 METHODOLOGY
H1("6  Proposed Methodology"),
P("The method is a six-stage pipeline with a verification loop closed around it. Stages 1–5 are the compiler; stage 6 is the reason to believe stages 1–5."),

H2("Stage 1 — Specify the subset before implementing it"),
P("PySub is defined in EBNF first (docs/grammar.ebnf, 41 productions). Everything the grammar does not admit is rejected by name, with the review in which it is scheduled. Writing the grammar first is what makes exclusions decisions rather than omissions, and it later doubles as the sampling distribution for the random program generator."),

H2("Stage 2 — Reify layout, then parse a conventional grammar"),
P("The scanner converts indentation into INDENT and DEDENT tokens using a stack of column widths, so the block structure the parser sees is explicit. Statements are then parsed by recursive descent and expressions by precedence climbing. Errors are recovered in panic mode at NEWLINE and statement-keyword boundaries so that one compilation reports many syntax errors."),

H2("Stage 3 — Check types bidirectionally, and fix each variable's type"),
P("A parent-linked scope chain resolves names. Expressions synthesise types bottom-up; where an expected type exists it is pushed inward. Every local variable takes its type from its first binding and keeps it — the restriction that makes translation to a statically typed target sound, and the one place where PySub is genuinely narrower than Python rather than merely smaller. The only implicit conversion is the numeric widening bool ⊑ int ⊑ float."),

H2("Stage 4 — Normalise the semantic gap and record it"),
P("The lowering pass makes every implicit Python coercion explicit, so that PIR is homogeneously typed and the emitter never guesses. In the same walk it tags each divergence site against the catalogue D1–D7 and accumulates the Semantic Fidelity Report. Placing the report in the compiler rather than in a document is the design decision that makes it trustworthy: it cannot go stale, because it is regenerated from the program being compiled."),

H2("Stage 5 — Emit readable C, and push the hard cases into a runtime"),
P("Each PIR node maps to a C construct by a structural walk. Where Python's semantics differ from C's, the emitter calls into pyrt rather than open-coding a correction — py_floordiv_i64 instead of an inline sign fix-up. This keeps generated code legible, keeps the semantic decisions in one auditable file, and means a fix to a divergence is a fix in one place. Lists are monomorphised into four concrete element types rather than boxed, which is what makes the static typing pay for itself."),

H2("Stage 6 — Falsify the equivalence claim continuously"),
P("For every positive program the oracle runs CPython 3.12 and the compiled binary and compares standard output byte for byte and exception class for exception class. For every negative program it asserts rejection and checks the diagnostic against the # expect: marker. It reports timing alongside, so performance regressions surface with correctness regressions. It runs in CI on every push. The team's working rule is that a divergence found by hand becomes a test before it becomes a fix."),

// ----------------------------------------------------- 7 ARCHITECTURE
H1("7  Architecture and Data Flow"),
P("Six numbered phases carry the program from source text to native binary. The two dotted outputs — diagnostics and the fidelity report — are products of the pipeline, not by-products: a run that emits no C but a good diagnostic has succeeded. The dashed edge at the bottom closes the verification loop, feeding the original source to CPython so that its output can be compared with the binary's."),
...figure("architecture.png", "Figure 1 — PYTHIA pipeline, data flow and module ownership. Colour encodes the owning team member.", 620),

H2("7.1  Representations passed between phases"),
table(
  [{ t: "Representation", f: 0.18 }, { t: "Produced by", f: 0.16 }, { t: "Invariant it guarantees", f: 0.66 }],
  [
    ["Token stream", "Lexer", "Layout is explicit: every block is delimited by INDENT/DEDENT, so the downstream grammar is context-free."],
    ["AST", "Parser", "Structurally valid; every node carries a source line and column. Types are absent."],
    ["Typed AST (TAST)", "Type checker", "Every expression node carries a resolved type; every name resolves to a declaration; no ill-typed program reaches this stage."],
    ["PIR", "Lowering pass", "Homogeneously typed — every implicit coercion is now an explicit Coerce node. Every divergence site is tagged."],
    ["C11 source", "Emitter", "Compiles under -Wall with no warnings and no dependency outside pyrt."],
  ], { size: 17 }),

H2("7.2  Interfaces between owners"),
P("Module boundaries are chosen so that each is a data-structure contract rather than a calling convention, which is what lets four people work in parallel without blocking on one another."),
...CODE([
  "  Member 1 → Member 2 :  Module          (ast_nodes.py)   -- untyped tree + positions",
  "  Member 2 → Member 3 :  Module + Ty     (typecheck.py)   -- every node .ty populated",
  "  Member 3 → Member 4 :  Module + Coerce (lower.py)       -- homogeneously typed PIR",
  "  Member 3 → Member 4 :  pyrt.h                           -- the runtime ABI the emitter targets",
  "  Member 4 → all      :  tools/oracle.py                  -- the shared definition of \"correct\"",
]),

// -------------------------------------------------------- 8 MODULES
H1("8  Module Description"),
P("Eight modules, each with a single owner and a single reason to change.", { after: 140 }),
table(
  [{ t: "Module", f: 0.13 }, { t: "Purpose", f: 0.21 }, { t: "Input → Output", f: 0.20 }, { t: "Algorithm / technique", f: 0.26 }, { t: "Owner", f: 0.11 }, { t: "LOC", f: 0.09 }],
  [
    ["lexer.py", "Tokenise; reify indentation", "source text → tokens", "Hand-written DFA-style scanner; indentation stack implementing the off-side rule; bracket-suppressed layout", "M1 Vishal", "233"],
    ["parser.py", "Build the AST; recover from syntax errors", "tokens → AST", "Recursive descent for statements; Pratt precedence climbing for expressions; panic-mode synchronisation", "M1 Vishal", "393"],
    ["ast_nodes.py", "Define AST/TAST node shapes", "— (data)", "Dataclass hierarchy; every node carries line, col and a mutable ty slot so the TAST is the AST", "M1 Vishal", "205"],
    ["typecheck.py", "Resolve names; check and infer types", "AST → TAST", "Parent-linked scope chain; bidirectional checking with local inference; bool ⊑ int ⊑ float widening lattice", "M2 Rujuta", "567"],
    ["lower.py", "Normalise semantics; record divergence", "TAST → PIR + report", "Coercion insertion; divergence tagging against catalogue D1–D7", "M3 Jahnavi", "250"],
    ["pyrt.h / pyrt.c", "Give C the semantics Python has", "— (library)", "Floor division, divisor-signed modulo, checked int64 arithmetic, shortest-round-trip float repr, monomorphic dynamic lists, bounds-checked negative indexing", "M3 Jahnavi", "435"],
    ["emit_c.py", "Generate the target program", "PIR → C11", "Syntax-directed structural walk; name mangling; monomorphised container selection; statement expressions for short-circuit value semantics", "M4 Aaryan", "420"],
    ["oracle.py", "Falsify the equivalence claim", "corpus → verdict", "Differential execution against CPython 3.12; stdout and exception-class comparison; negative-suite marker matching; timing harness", "M4 Aaryan", "188"],
  ], { size: 15 }),
P("cli.py (113 LOC, M1) wires the phases and renders diagnostics with a caret line. Total implementation: approximately 2 800 lines.", { before: 100, size: 18, color: MUT, italics: true }),

H2("8.1  The divergence catalogue"),
P("This table is the project's technical spine: it is what §2.2(iii) requires the compiler to report, and each row is a specific claim that the oracle tests."),
table(
  [{ t: "ID", f: 0.05 }, { t: "Divergence", f: 0.32 }, { t: "Example", f: 0.24 }, { t: "Mitigation", f: 0.28 }, { t: "Status", f: 0.11 }],
  [
    ["D1", "Python ints are unbounded; C's are 64-bit", "2**63 is exact in Python", "Every +, −, *, ** guarded with __builtin_*_overflow; raises OverflowError", "Guarded"],
    ["D2", "// floors toward −∞; C's / truncates toward 0", "−7 // 2 = −4 in Python, −3 in C", "py_floordiv_i64 / py_floordiv_f64", "Exact"],
    ["D3", "Sign of % follows the divisor, not the dividend", "−7 % 2 = 1 in Python, −1 in C", "py_mod_i64 / py_mod_f64, including signed zero for floats", "Exact"],
    ["D4", "/ is true division and always yields float", "3 / 2 = 1.5, not 1", "Operands widened to double; py_truediv preserves ZeroDivisionError", "Exact"],
    ["D5", "Negative indexing and mandatory bounds checks", "xs[−1]; xs[7] raises IndexError", "Index normalised and checked in the runtime; IndexError reproduced", "Exact"],
    ["D6", "int ** negative int changes the static type", "2 ** −1 is 0.5, a float", "Cannot be typed statically — the exponent's sign is a run-time value. Reported at compile time, refused at run time", "Divergent"],
    ["D7", "Object lifetime and reclamation", "CPython refcounts; PYTHIA does not free", "Documented; output unaffected. Region-based reclamation is the Review 3 target", "Guarded"],
  ], { size: 15 }),
P("Float formatting deserves a note because it is the divergence most transpilers get wrong without noticing. CPython prints the shortest decimal string that round-trips, in fixed notation unless the decimal exponent is below −4 or at least 16. printf(\"%.17g\") does not reproduce this. pyrt implements the search directly, which is why 0.1 + 0.2 prints as 0.30000000000000004 and 1e16 prints as 1e+16, exactly as CPython does.",
  { before: 100, size: 18 }),

// ---------------------------------------------------- 9 RESPONSIBILITY
H1("9  Team Responsibility Matrix"),
P("Every member owns at least one technical component end to end and supports at least one integration, testing or documentation activity. Nobody's row says \u201cdocumentation\u201d or \u201cPPT\u201d.", { after: 140 }),
table(
  [{ t: "Member", f: 0.14 }, { t: "Primary responsibility", f: 0.19 }, { t: "Supporting responsibility", f: 0.17 },
   { t: "Review 1 evidence", f: 0.19 }, { t: "Review 2 target", f: 0.16 }, { t: "Review 3 target", f: 0.15 }],
  [
    ["M1 — Vishal Vivek 24BCE2377",
     "Front end: PySub grammar, lexer with the off-side rule, parser, AST, diagnostics",
     "Repository, CI, cross-module integration, release management",
     "grammar.ebnf (41 productions); lexer.py, parser.py, ast_nodes.py, cli.py (944 LOC); caret diagnostics working",
     "Tuples, multiple assignment, while/else; ≥ 2 errors recovered per malformed file",
     "Class and method syntax in the front end; final integration"],
    ["M2 — Rujuta Kulkarni 24BDS0459",
     "Symbol table, scope resolution, bidirectional type checker, local inference",
     "Negative corpus and diagnostic-message quality",
     "typecheck.py (567 LOC); 12/12 negative cases rejected with the expected message",
     "Negative suite to 60; list[list[T]] and Optional[T]; ≥ 95% rejection rate",
     "dict[K,V], class types; written soundness argument"],
    ["M3 — Jahnavi Koliparthy 24BDS0132",
     "Divergence catalogue, lowering pass to PIR, Semantic Fidelity Report, pyrt runtime",
     "Performance analysis of the guard mechanism",
     "lower.py + pyrt.c/h (685 LOC); 7 divergence classes; 123 positioned notes across the suite",
     "Interval analysis to elide provably safe overflow guards; hash-map runtime",
     "Region-based reclamation; measured optimisation study"],
    ["M4 — Aaryan Gupta 24BDS0134",
     "C11 emitter, differential oracle, benchmark harness, project plan and timeline",
     "CI configuration, task board, contribution log",
     "emit_c.py + oracle.py (608 LOC); 14/14 equivalence; 9.4× median speedup measured",
     "Grammar-directed program generator; positive corpus to 120; coverage reporting",
     "Second backend (WebAssembly text) to demonstrate retargetability; final results"],
  ], { size: 14 }),
P("Secondary owners, so that no phase has a single point of failure: front end M4 · type checker M3 · runtime M2 · emitter M1.", { before: 110, size: 18, color: MUT, italics: true }),

// ----------------------------------------------------------- 10 TIMELINE
H1("10  Timeline and Review-Wise Deliverables"),
...figure("gantt.png", "Figure 2 — Twelve-week plan. Week 1 is the week the project was allocated; review gates are marked.", 640),

H2("10.1  Review-wise deliverables"),
table(
  [{ t: "Gate", f: 0.12 }, { t: "Week", f: 0.08 }, { t: "Deliverable", f: 0.46 }, { t: "Acceptance criterion", f: 0.34 }],
  [
    ["Review 1", "W3", "Complete pipeline for PySub v0.1; grammar; divergence catalogue D1–D7; differential oracle; this document and the deck", "Oracle green on the whole corpus; every member can demonstrate their own module"],
    ["Review 2", "W8", "Grammar-directed program generator; positive corpus ≥ 120, negative ≥ 60; interval analysis for guard elision; nested generics; ISO C fallback for the three GNU sites", "≥ 98% equivalence at 120 programs; ≥ 95% rejection at 60; measured speedup from guard elision"],
    ["Review 3", "W12", "Classes and dict; try/except; region-based reclamation; WebAssembly back end; final evaluation and write-up", "≥ 98% equivalence maintained on the grown corpus; two back ends from one PIR; memory reclaimed without output change"],
  ], { size: 16 }),

// --------------------------------------------------------- 11 PROGRESS
H1("11  Initial Progress and Proof of Start"),
P("The pipeline is not a plan. It is implemented, it runs, and the numbers below are reproducible with one command."),

H2("11.1  Repository"),
...CODE([
  "pythia/",
  "  pythia/    lexer.py  parser.py  ast_nodes.py  typecheck.py",
  "             lower.py  emit_c.py  cli.py                        ~2 180 LOC",
  "  runtime/   pyrt.h  pyrt.c                                       ~435 LOC",
  "  tools/     oracle.py                                            ~188 LOC",
  "  tests/     positive/  14 programs      negative/  12 programs",
  "  docs/      grammar.ebnf  architecture.png  gantt.png  make_figures.py",
  "  .github/workflows/ci.yml   Makefile   README.md   CONTRIBUTIONS.md",
]),

H2("11.2  End-to-end demonstration"),
P("Input — tests/positive/t07_bubble.py (excerpt):", { size: 18, after: 60 }),
...CODE([
  "def gcd(a: int, b: int) -> int:",
  "    while b != 0:",
  "        t: int = b",
  "        b = a % b",
  "        a = t",
  "    return a",
  "",
  "print(gcd(48, 18), gcd(-48, 18))",
]),
P("Generated C — note that the modulo goes through the runtime, not through C's %:", { size: 18, after: 60 }),
...CODE([
  "static int64_t f_gcd(int64_t p_a, int64_t p_b) {",
  "    int64_t p_t = 0;",
  "",
  "    while ((p_b) != (INT64_C(0))) {",
  "        p_t = p_b;",
  "        p_b = py_mod_i64(p_a, p_b);",
  "        p_a = p_t;",
  "    }",
  "    return p_a;",
  "}",
]),
P("Both CPython and the compiled binary print 6 6. C's own % would have printed 6 -6 for the second call — divergence D3, caught by construction.", { size: 18, italics: true, color: MUT }),

H2("11.3  Oracle output"),
...CODE([
  "$ python3 tools/oracle.py",
  "PYTHIA DIFFERENTIAL ORACLE   (CPython 3.12  vs  PYTHIA -> C -> cc -O2)",
  "",
  "PROGRAM                  CPython    PYTHIA   SPEEDUP  RESULT",
  "t01_arith.py               21.5m      1.9m     11.0x  PASS",
  "t02_lists.py               20.0m      3.1m      6.4x  PASS",
  "t03_strings.py             18.7m      1.9m     10.0x  PASS",
  "t04_control.py             19.9m      1.9m     10.8x  PASS",
  "t05_floats.py              19.4m      1.9m     10.4x  PASS",
  "t06_boolops.py             18.4m      1.8m     10.2x  PASS",
  "t07_bubble.py              17.5m      2.3m      7.5x  PASS",
  "t08_nested.py              25.3m      3.1m      8.1x  PASS",
  "t09_sieve.py               92.8m      8.4m     11.1x  PASS",
  "t10_collatz.py           1508.8m    299.9m      5.0x  PASS",
  "t11_matmul.py             168.4m     12.1m     14.0x  PASS",
  "t12_err_index.py           18.1m      1.8m     10.3x  PASS   (IndexError)",
  "t13_err_zerodiv.py         19.9m      2.8m      7.0x  PASS   (ZeroDivisionError)",
  "t14_edges.py               18.4m      1.9m      9.8x  PASS",
  "",
  "SUMMARY",
  "  semantic equivalence : 14/14 programs (100.0%)",
  "  type-checker recall  : 12/12 invalid programs rejected (100.0%)",
  "  median speedup       : 9.4x   (min 3.3x, max 13.8x)",
  "  fidelity notes       : 123 emitted across the suite",
]),
P("The Collatz benchmark is the most informative row. At 5.0× it is the slowest in the suite, and the reason is measurable rather than mysterious: it is integer-arithmetic-bound, so almost every operation pays for an overflow guard. That single number is what turns interval analysis from a nice idea into a Review 2 objective with a target attached.", { before: 100, size: 18 }),

H2("11.4  Bugs the oracle found this week"),
P("The oracle earned its place immediately. On its first full run four defects surfaced that manual testing had not:"),
BUL("Frozen-dataclass type objects were compared by identity rather than equality, so \"a\" + \"b\" was rejected as an ill-typed operation on two strings."),
BUL("Float modulo returned −0.0 where CPython returns 0.0; the sign of a zero result follows the divisor."),
BUL("A for-loop variable at module scope collided with a later annotated declaration of the same name and type, which Python permits."),
BUL("A rejection message did not match its own # expect: marker, which is the negative suite doing exactly what it was built for."),
P("All four are fixed and each has a regression test. Recording them is the point: a Review-1 document that reports only successes is describing a demonstration, not a project.", { size: 18, italics: true, color: MUT }),

H2("11.5  Diagnostic quality"),
...CODE([
  "$ python3 -m pythia.cli tests/negative/n02_badarg.py",
  "tests/negative/n02_badarg.py:4:14: TypeError: argument 1 of double(): expected int, found str",
  "    print(double(\"seven\"))",
  "                 ^",
  "",
  "1 error(s); no output written.",
]),

H2("11.6  Semantic Fidelity Report"),
...CODE([
  "$ python3 -m pythia.cli tests/positive/t01_arith.py --fidelity",
  "SEMANTIC FIDELITY REPORT",
  "  12 exact   6 guarded   2 divergent",
  "",
  "3:19: [EXACT] D2 floor-division rounding direction",
  "    Python floors toward -inf; C truncates toward zero, so -7 // 2 is",
  "    -4 in Python and -3 in C.",
  "    mitigation: emitted as py_floordiv_i64; reproduces Python exactly.",
  "",
  "3:27: [EXACT] D3 modulo sign convention",
  "    In Python the sign of % follows the divisor; in C it follows the",
  "    dividend, so -7 % 2 is 1 in Python, -1 in C.",
  "    mitigation: emitted as py_mod_i64; exact.",
]),

// --------------------------------------------------------- 12 TESTING
H1("12  Testing Strategy"),
table(
  [{ t: "Class", f: 0.16 }, { t: "What it establishes", f: 0.36 }, { t: "Representative cases", f: 0.32 }, { t: "Status", f: 0.16 }],
  [
    ["Valid / positive", "Well-typed programs translate and behave identically to CPython", "Arithmetic across all four sign quadrants; lists; strings; control flow; recursion; float formatting", "14 programs, 14 passing"],
    ["Invalid / negative", "Ill-typed programs are rejected before emission, with the right message", "Type rebinding; wrong argument type; undefined name; wrong return type; heterogeneous list; missing return; unannotated empty list; wrong arity; non-int index; str item assignment; incomparable types; break outside a loop", "12 cases, 12 rejected"],
    ["Boundary", "The edges where Python and C most often part company", "−7//2 and 7//−2; INT64_MIN negation; division and modulo by zero; xs[−len] and xs[len]; empty list, empty string; 0.1+0.2; 1e15 vs 1e16; \"ab\"*0", "Covered by t01, t05, t12, t13, t14"],
    ["Exception parity", "Failing programs fail the same way", "IndexError from an out-of-range subscript; ZeroDivisionError from //0; OverflowError from int64 overflow", "IndexError and ZeroDivisionError verified"],
    ["Performance", "The translation is worth doing", "Sieve to 300 000; Collatz to 120 000; 90×90 dense matrix multiply", "Median 9.4×, min 3.3×"],
    ["Generated (Review 2)", "Divergences nobody on the team thought of", "Grammar-directed sampling of well-typed PySub programs, differentially tested in bulk", "Planned, W6–W9"],
    ["Regression / CI", "Nothing that once worked silently stops", "Whole corpus on every push, gcc and clang, -Wall", "GitHub Actions configured"],
  ], { size: 15 }),
P("One rule governs the suite: a divergence discovered by hand becomes a test before it becomes a fix. That is what keeps the equivalence percentage meaningful over twelve weeks instead of drifting upward as the easy cases accumulate.", { before: 110, italics: true }),

// ------------------------------------------------- 13 EXPECTED RESULTS
H1("13  Expected Results and Extension Potential"),
H2("13.1  Expected technical outcomes"),
table(
  [{ t: "Outcome", f: 0.46 }, { t: "Target at Review 3", f: 0.28 }, { t: "Measured at Review 1", f: 0.26 }],
  [
    ["Semantic equivalence with CPython 3.12", "≥ 98% of ≥ 120 programs", "100% of 14"],
    ["Ill-typed programs rejected", "≥ 95% of 60", "100% of 12"],
    ["Median speedup over CPython", "≥ 8× (≥ 12× after guard elision)", "9.4×"],
    ["Divergence classes catalogued and reported", "≥ 10", "7"],
    ["Back ends driven from one PIR", "2 (C11 and WebAssembly text)", "1"],
    ["Peak memory relative to CPython", "≤ 1.5× after region reclamation", "unbounded (D7)"],
  ], { size: 17 }),

H2("13.2  What could be written up"),
P("The Semantic Fidelity Report is the part of this project that is not already in the literature. Transpilers are plentiful; a transpiler that emits a positioned, machine-generated account of its own approximations — and that is checked by a differential oracle rather than by demonstration — is a small but genuine idea. A short paper on \u201cdivergence reporting as a first-class transpiler output\u201d, with the D1–D7 catalogue and the oracle methodology as evidence, would be appropriate for a student research track or an institutional technical report. The empirical claim would be modest and checkable: on a corpus of N programs, K divergence classes arose, J were mechanically eliminated, and the remainder were reported rather than hidden."),

H2("13.3  Extensions beyond the course"),
BUL([R("Retargeting. ", { bold: true }), R("PIR is deliberately target-agnostic. A WebAssembly-text back end would demonstrate that the semantic normalisation is a property of the IR, not of the C emitter — the classic retargetability argument, made concrete.")]),
BUL([R("Guard elision by interval analysis. ", { bold: true }), R("A dataflow pass computing value ranges would remove overflow guards it can prove unnecessary. This is a genuine optimisation with a number attached: the Collatz benchmark says roughly 2× is available.")]),
BUL([R("Selective bignum promotion. ", { bold: true }), R("Rather than trap on overflow, promote to an arbitrary-precision representation at exactly the sites interval analysis cannot discharge — closing D1 properly instead of guarding it.")]),
BUL([R("Mechanised proof of one pass. ", { bold: true }), R("Proving that coercion insertion preserves typing — on paper or in a proof assistant — would move one link of the chain from tested to verified, in the spirit of CompCert.")]),

// ------------------------------------------------------- 14 REFERENCES
H1("14  References"),
...[
  "A. V. Aho, M. S. Lam, R. Sethi and J. D. Ullman. Compilers: Principles, Techniques, and Tools. 2nd edition, Pearson, 2006. (Chapters 2–6: lexical analysis, recursive-descent parsing, syntax-directed translation, type checking.)",
  "B. C. Pierce. Types and Programming Languages. MIT Press, 2002. (Simply typed lambda calculus, subtyping, algorithmic typing.)",
  "B. C. Pierce and D. N. Turner. \u201cLocal Type Inference.\u201d ACM Transactions on Programming Languages and Systems, 22(1):1–44, 2000. (The bidirectional checking discipline used in typecheck.py.)",
  "V. R. Pratt. \u201cTop Down Operator Precedence.\u201d In Proc. 1st ACM SIGACT-SIGPLAN Symposium on Principles of Programming Languages (POPL), pages 41–51, 1973. (The expression parser.)",
  "W. M. McKeeman. \u201cDifferential Testing for Software.\u201d Digital Technical Journal, 10(1):100–107, 1998. (The methodology behind tools/oracle.py.)",
  "X. Yang, Y. Chen, E. Eide and J. Regehr. \u201cFinding and Understanding Bugs in C Compilers.\u201d In Proc. PLDI, pages 283–294, 2011. (Csmith; the model for the Review-2 program generator.)",
  "A. Pnueli, M. Siegel and E. Singerman. \u201cTranslation Validation.\u201d In Proc. TACAS, LNCS 1384, pages 151–166, 1998. (Validating a translation instance rather than the translator.)",
  "X. Leroy. \u201cFormal Verification of a Realistic Compiler.\u201d Communications of the ACM, 52(7):107–115, 2009. (CompCert; the verified end of the spectrum this project sits at the tested end of.)",
  "J. Chen, J. Patra, M. Pradel, Y. Xiong, H. Zhang, D. Hao and L. Zhang. \u201cA Survey of Compiler Testing.\u201d ACM Computing Surveys, 53(1), Article 4, 2020.",
  "S. Behnel, R. Bradshaw, C. Citro, L. Dalcin, D. S. Seljebotn and K. Smith. \u201cCython: The Best of Both Worlds.\u201d Computing in Science & Engineering, 13(2):31–39, 2011.",
  "A. Shajii, G. Ramirez, H. Smajlović, J. Ray, B. Berger, S. Amarasinghe and I. Numanagić. \u201cCodon: A Compiler for High-Performance Pythonic Applications and DSLs.\u201d In Proc. 32nd ACM SIGPLAN International Conference on Compiler Construction (CC), 2023.",
  "Python Software Foundation. The Python Language Reference, version 3.12. https://docs.python.org/3/reference/ (Sections 2.1.8 on indentation and 6.7 on binary arithmetic define the behaviour PYTHIA is checked against.)",
  "ISO/IEC 9899:2011. Information technology — Programming languages — C. (§6.5.5 on the division and remainder operators, which is where D2 and D3 originate.)",
  "GNU Project. GCC Manual — Statement Expressions and Typeof. https://gcc.gnu.org/onlinedocs/gcc/ (The two extensions used at the three emission sites in §5.4.)",
].map((t, i) => new Paragraph({
  spacing: { after: 90, line: 256 }, indent: { left: 400, hanging: 400 },
  children: [R(`[${i + 1}]  `, { bold: true, size: 18 }), R(t, { size: 18 })],
})),

new Paragraph({ children: [new PageBreak()] }),

// ---------------------------------------------------------- APPENDIX
H1("Appendix A  Contribution Log"),
P("Every entry names a commit or an artefact. \u201cHelped with coding\u201d is not an entry.", { after: 130 }),
table(
  [{ t: "Wk", f: 0.06 }, { t: "Member", f: 0.17 }, { t: "Task assigned", f: 0.28 }, { t: "Completed", f: 0.27 }, { t: "Evidence", f: 0.22 }],
  [
    ["W1", "Vishal Vivek", "Freeze PySub scope; write the EBNF grammar", "41 productions; exclusions dated to a review", "docs/grammar.ebnf"],
    ["W1", "Vishal Vivek", "Lexer with the off-side rule", "INDENT/DEDENT stack, bracket suppression, 233 LOC", "pythia/lexer.py"],
    ["W2", "Vishal Vivek", "Parser and AST", "Recursive descent + Pratt, panic-mode recovery", "pythia/parser.py, ast_nodes.py"],
    ["W2", "Rujuta Kulkarni", "Symbol table with nested scopes", "Parent-linked chain; function-closed scoping", "pythia/typecheck.py"],
    ["W2", "Rujuta Kulkarni", "Bidirectional type checker", "567 LOC; 12/12 negative cases rejected", "pythia/typecheck.py, tests/negative/"],
    ["W2", "Jahnavi Koliparthy", "Divergence catalogue", "7 classes, each with example and mitigation", "pythia/lower.py"],
    ["W3", "Jahnavi Koliparthy", "Lowering pass and pyrt runtime", "Coercion insertion; 435 LOC runtime; fidelity report", "pythia/lower.py, runtime/"],
    ["W3", "Aaryan Gupta", "C11 emitter", "420 LOC; compiles clean under -Wall", "pythia/emit_c.py"],
    ["W3", "Aaryan Gupta", "Differential oracle and CI", "14/14 equivalence; 12/12 rejection; 4 bugs found", "tools/oracle.py, .github/workflows/"],
    ["W3", "All four", "Review 1 document, deck and figures", "Submitted", "docs/"],
  ], { size: 15 }),

H2("Appendix B  Meeting Record"),
table(
  [{ t: "Wk", f: 0.07 }, { t: "Present", f: 0.13 }, { t: "Decision taken and why", f: 0.80 }],
  [
    ["W1", "All four", "Target language is C, not Go or JavaScript. A garbage-collected target would have hidden the semantic gap behind a runtime that already resembles Python's; C forces every divergence into the open, and it can be compiled and run inside CI, which makes the equivalence claim testable rather than argued."],
    ["W1", "All four", "Scope frozen at PySub v0.1. Classes, dicts and slicing are deferred with named review targets, and the type checker names the review in its rejection message so that scope creep is visible."],
    ["W2", "All four", "Lists are monomorphised into four concrete element types rather than boxed. Boxing would have made the static typing decorative; monomorphisation is what converts the type information into speed."],
    ["W2", "All four", "The Semantic Fidelity Report is adopted as the project's novelty claim, and is generated by the compiler rather than written by hand so that it cannot go stale."],
    ["W3", "All four", "Overflow guards are kept despite costing roughly 2× on integer-hot code. Silent wrapping is undefined behaviour in C and wrong against Python; eliding the guards is turned into a Review 2 optimisation objective with a measured target instead."],
  ], { size: 16 }),

H2("Appendix C  Viva Preparation"),
P("Questions each member should be able to answer without notes, on their own component and on the pipeline as a whole.", { after: 130 }),
table(
  [{ t: "Member", f: 0.15 }, { t: "Expect to be asked", f: 0.85 }],
  [
    ["M1 Vishal", "Why is Python's grammar not context-free without INDENT/DEDENT, and what exactly does the lexer stack hold? Why Pratt rather than a precedence cascade? What does panic-mode recovery synchronise on, and why those tokens? Show a file where two syntax errors are reported in one run."],
    ["M2 Rujuta", "What does bidirectional mean here — which rules synthesise and which check? Why can xs = [] not be typed but xs: list[int] = [] can? Why must a variable keep one type for its lifetime, and what breaks in the emitter if it does not? Where is the widening lattice, and why is bool below int?"],
    ["M3 Jahnavi", "Work −7 // 2 and −7 % 2 by hand in both languages. Why does the emitter call py_mod_i64 instead of open-coding the fix-up? Why does the fidelity report live in the compiler rather than in a document? What exactly is unsound about D6, and why can the type checker not catch it?"],
    ["M4 Aaryan", "Why compare stdout byte-for-byte rather than parse it? What does the negative suite's # expect: marker buy over merely checking that compilation failed? Which four bugs did the oracle find, and what test now guards each? Why is Collatz the slowest benchmark?"],
    ["All", "How do the four modules interface, and what would you do if one member's phase were unfinished? What is the difference between what PYTHIA verifies and what CompCert proves? What is the one thing you would cut if the schedule slipped?"],
  ], { size: 15 }),

H2("Appendix D  Submission Checklist"),
table(
  [{ t: "Rubric requirement (§7 of the guidelines)", f: 0.68 }, { t: "Artefact", f: 0.22 }, { t: "Status", f: 0.10 }],
  [
    ["Review 1 presentation file with the prescribed structure", "PYTHIA_Review1.pptx", "Ready"],
    ["Review 1 report containing all required sections", "this document", "Ready"],
    ["Architecture or data-flow diagram, readable and explained", "Figure 1 · docs/architecture.png", "Ready"],
    ["Member-wise responsibility matrix acknowledged by all members", "§9 — signature block below", "Sign"],
    ["Week-wise timeline or Gantt chart for the full duration", "Figure 2 · docs/gantt.png", "Ready"],
    ["Repository link with README, folder structure, member commits", "README.md, .github/workflows/ci.yml", "Push"],
    ["At least one verifiable initial technical output or prototype", "§11 — working pipeline, 14/14 oracle", "Ready"],
    ["Initial test plan with valid, invalid and boundary cases", "§12 — 14 positive, 12 negative", "Ready"],
    ["References for papers, books, tools and borrowed ideas", "§14 — 14 references", "Ready"],
    ["Contribution record: date, task assigned, task completed, evidence", "Appendix A", "Ready"],
  ], { size: 16 }),

GAP(300),
P("Team acknowledgement — each member has read the responsibility matrix in §9 and accepts the tasks recorded against their name.", { size: 18, italics: true, after: 200 }),
table(
  [{ t: "Member", f: 0.34 }, { t: "Register No.", f: 0.22 }, { t: "Signature", f: 0.24 }, { t: "Date", f: 0.20 }],
  MEMBERS.map(m => [m[1], m[2], "", ""]), { size: 17 }),
GAP(200),
table(
  [{ t: "Team Leader Signature", f: 0.34 }, { t: "Faculty / Evaluator Signature", f: 0.36 }, { t: "Date", f: 0.30 }],
  [["", "", ""]], { size: 17 }),

    ],
  }],
});

Packer.toBuffer(doc).then(b => {
  const out = path.join(__dirname, "PYTHIA_Review1_Report_Team2_A15.docx");
  fs.writeFileSync(out, b);
  console.log("wrote", out, (b.length / 1024).toFixed(0) + " KB");
});
