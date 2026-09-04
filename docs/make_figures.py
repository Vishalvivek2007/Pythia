#!/usr/bin/env python3
"""Generates the Review-1 figures: architecture/data-flow and Gantt chart."""
import os
import subprocess
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import Patch

HERE = os.path.dirname(os.path.abspath(__file__))

INK   = "#1a1a1a"
M1    = "#2563eb"   # Vishal      - front end
M2    = "#059669"   # Rujuta      - semantics
M3    = "#d97706"   # Jahnavi     - IR / runtime
M4    = "#7c3aed"   # Aaryan      - codegen / test
GREY  = "#6b7280"

# ----------------------------------------------------------- architecture
DOT = f"""
digraph PYTHIA {{
  rankdir=TB;
  bgcolor="white";
  node [shape=box style="rounded,filled" fontname="Helvetica" fontsize=11
        color="#00000000" penwidth=0 margin="0.22,0.14"];
  edge [color="{GREY}" penwidth=1.2 arrowsize=0.7 fontname="Helvetica" fontsize=9];

  src   [label="source.py\\n(PySub)" shape=note fillcolor="#f3f4f6" fontcolor="{INK}"];

  subgraph cluster_fe {{
    label="FRONT END  ·  Member 1 (Vishal)"; fontname="Helvetica-Bold";
    fontsize=10; fontcolor="{M1}"; color="{M1}"; style=dashed; penwidth=1;
    lex  [label="1  Lexer\\noff-side rule\\nINDENT / DEDENT" fillcolor="{M1}" fontcolor="white"];
    par  [label="2  Parser\\nrecursive descent\\n+ Pratt expressions" fillcolor="{M1}" fontcolor="white"];
    ast  [label="AST\\n(untyped)" shape=ellipse fillcolor="#dbeafe" fontcolor="{INK}"];
  }}

  subgraph cluster_sem {{
    label="SEMANTIC ANALYSIS  ·  Member 2 (Rujuta)"; fontname="Helvetica-Bold";
    fontsize=10; fontcolor="{M2}"; color="{M2}"; style=dashed; penwidth=1;
    sym  [label="3a  Symbol table\\nnested scopes" fillcolor="{M2}" fontcolor="white"];
    tc   [label="3b  Bidirectional\\ntype checker\\n+ local inference" fillcolor="{M2}" fontcolor="white"];
    tast [label="Typed AST\\n(TAST)" shape=ellipse fillcolor="#d1fae5" fontcolor="{INK}"];
  }}

  subgraph cluster_ir {{
    label="SEMANTIC NORMALISATION  ·  Member 3 (Jahnavi)"; fontname="Helvetica-Bold";
    fontsize=10; fontcolor="{M3}"; color="{M3}"; style=dashed; penwidth=1;
    low  [label="4  Lowering pass\\nexplicit coercions\\ndivergence tagging" fillcolor="{M3}" fontcolor="white"];
    pir  [label="PIR\\n(homogeneously typed)" shape=ellipse fillcolor="#fef3c7" fontcolor="{INK}"];
    rt   [label="pyrt runtime (C)\\nfloordiv · mod · str\\nmonomorphic lists" fillcolor="{M3}" fontcolor="white"];
  }}

  subgraph cluster_be {{
    label="BACK END  ·  Member 4 (Aaryan)"; fontname="Helvetica-Bold";
    fontsize=10; fontcolor="{M4}"; color="{M4}"; style=dashed; penwidth=1;
    emit [label="5  C11 emitter\\nname mangling\\nblock layout" fillcolor="{M4}" fontcolor="white"];
    cc   [label="6  cc -O2\\n(external)" fillcolor="#ede9fe" fontcolor="{INK}"];
  }}

  fid  [label="Semantic Fidelity\\nReport" shape=note fillcolor="#fff7ed" fontcolor="{M3}"];
  diag [label="Diagnostics\\nline · col · caret" shape=note fillcolor="#fef2f2" fontcolor="#b91c1c"];
  outc [label="target.c" shape=note fillcolor="#f3f4f6" fontcolor="{INK}"];
  binr [label="native binary" shape=note fillcolor="#f3f4f6" fontcolor="{INK}"];

  oracle [label="DIFFERENTIAL ORACLE  ·  Member 4\\nCPython 3.12 output  ==  binary output ?"
          shape=box fillcolor="#111827" fontcolor="white" style="rounded,filled"];

  src -> lex -> par -> ast -> sym -> tc -> tast -> low -> pir -> emit -> outc;
  low -> fid [style=dotted];
  par -> diag [style=dotted];
  tc  -> diag [style=dotted];
  outc -> cc; rt -> cc [style=dashed]; cc -> binr;
  binr -> oracle; src -> oracle [style=dashed constraint=false label=" reference run "];
}}
"""


def architecture(path):
    dot = os.path.join(HERE, "_arch.dot")
    open(dot, "w").write(DOT)
    subprocess.run(["dot", "-Tpng", "-Gdpi=200", dot, "-o", path], check=True)
    print("wrote", path)


# ------------------------------------------------------------------ gantt
TASKS = [
    ("M1", "Grammar spec (EBNF) + scope freeze",           1, 2),
    ("M1", "Lexer: off-side rule, INDENT/DEDENT",          1, 3),
    ("M1", "Parser + AST (recursive descent / Pratt)",     2, 4),
    ("M1", "Panic-mode recovery + caret diagnostics",      4, 6),
    ("M1", "R2 features: tuples, while/else, multi-assign", 6, 8),
    ("M1", "R3: class/struct front end",                   9, 11),
    ("M1", "Integration, repo & release management",       1, 12),

    ("M2", "Symbol table + nested scope resolution",       2, 4),
    ("M2", "Bidirectional type checker core",              3, 6),
    ("M2", "Local inference + widening lattice",           5, 7),
    ("M2", "Negative suite -> 60 cases, message quality",  6, 9),
    ("M2", "R2/R3: list[list[T]], dict[K,V], Optional[T]", 8, 11),
    ("M2", "Soundness argument write-up",                  11, 12),

    ("M3", "Divergence catalogue D1-D7",                   2, 3),
    ("M3", "PIR + explicit coercion insertion",            3, 5),
    ("M3", "pyrt runtime: ints, floats, str, lists",       4, 7),
    ("M3", "Fidelity report + range analysis (guard elision)", 6, 9),
    ("M3", "R3: region-based reclamation, dict runtime",   9, 11),
    ("M3", "Optimisation evaluation",                      11, 12),

    ("M4", "C11 emitter (PIR -> C)",                       3, 6),
    ("M4", "Differential oracle + GitHub Actions CI",      4, 6),
    ("M4", "Benchmark harness + grammar-based fuzzer",     6, 9),
    ("M4", "Second backend (WAT) for retargetability",     9, 11),
    ("M4", "Final report, results tables, viva pack",      10, 12),
]

COLORS = {"M1": M1, "M2": M2, "M3": M3, "M4": M4}
NAMES = {"M1": "M1 · Vishal Vivek — Front end & integration",
         "M2": "M2 · Rujuta Kulkarni — Types & semantics",
         "M3": "M3 · Jahnavi Koliparthy — IR, lowering & runtime",
         "M4": "M4 · Aaryan Gupta — Codegen, testing & planning"}


def gantt(path):
    fig, ax = plt.subplots(figsize=(13.5, 9.2))
    y = 0
    yticks, ylabels = [], []
    order = ["M1", "M2", "M3", "M4"]
    rows = []
    for m in order:
        rows.append((m, None))
        for who, label, s, e in TASKS:
            if who == m:
                rows.append((m, (label, s, e)))

    for m, item in rows:
        if item is None:
            ax.text(0.55, y, NAMES[m], fontsize=10.5, fontweight="bold",
                    color=COLORS[m], va="center")
            yticks.append(y); ylabels.append("")
            y -= 1
            continue
        label, s, e = item
        ax.barh(y, e - s + 1, left=s - 0.5, height=0.62,
                color=COLORS[m], alpha=0.88, edgecolor="white", linewidth=1.1,
                zorder=3)
        ax.text(s - 0.35, y, f"W{s}\u2013W{e}", va="center", ha="left",
                fontsize=7.2, color="white", fontweight="bold", zorder=4)
        yticks.append(y); ylabels.append("   " + label)
        y -= 1

    for wk, name, col in ((3, "REVIEW 1", "#b91c1c"),
                          (8, "REVIEW 2", "#b45309"),
                          (12, "REVIEW 3", "#15803d")):
        ax.axvline(wk + 0.5, color=col, linestyle="--", linewidth=1.8, zorder=5)
        ax.text(wk + 0.5, 1.4, name, rotation=0, ha="center", va="bottom",
                fontsize=9, fontweight="bold", color=col,
                bbox=dict(boxstyle="round,pad=0.32", fc="white", ec=col, lw=1.2))

    ax.set_yticks(yticks); ax.set_yticklabels(ylabels, fontsize=8.4)
    ax.set_ylim(y + 0.5, 2.6)
    ax.set_xlim(0.2, 12.9)
    ax.set_xticks(range(1, 13))
    ax.set_xticklabels([f"W{i}" for i in range(1, 13)], fontsize=9)
    ax.set_xlabel("Project week", fontsize=10, labelpad=8)
    ax.grid(axis="x", linestyle=":", alpha=0.4, zorder=0)
    for sp in ("top", "right", "left"):
        ax.spines[sp].set_visible(False)
    ax.set_title("PYTHIA — BCSE307L Team 2 (Project A15) — 12-week work plan",
                 fontsize=13, fontweight="bold", pad=26, loc="left")
    fig.tight_layout()
    fig.savefig(path, dpi=190, bbox_inches="tight", facecolor="white")
    print("wrote", path)


if __name__ == "__main__":
    architecture(os.path.join(HERE, "architecture.png"))
    gantt(os.path.join(HERE, "gantt.png"))
