#!/usr/bin/env python3
"""
PYTHIA :: Grammar-Directed Program Generator
Owner: Member 4 (Aaryan Gupta) -- Review 2 deliverable

Samples well-typed PySub programs from the grammar in docs/grammar.ebnf,
in the spirit of Csmith: the generator tracks a live type environment as it
builds a program, so every expression it emits is one the type checker will
already accept -- the goal is to search the *semantic* space PYTHIA has to
get right, not the syntactic space the parser has to reject.

Usage:
    python3 tools/fuzz.py --n 200 --seed 0 --out tests/generated
    python3 tools/fuzz.py --n 500 --seed 1 --keep-failures-only
"""
import argparse
import os
import random
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT)

INT, FLOAT, BOOL, STR = "int", "float", "bool", "str"
PRIM_TYPES = [INT, FLOAT, BOOL, STR]


class Var:
    __slots__ = ("name", "ty")

    def __init__(self, name, ty):
        self.name, self.ty = name, ty


class Ctx:
    """One function/module body being generated: names in scope, indent
    level, and a budget that guarantees termination."""

    def __init__(self, rng, budget):
        self.rng = rng
        self.vars = []          # List[Var], all types currently bound
        self.budget = budget
        self.tmp = 0
        self.loop_depth = 0

    def fresh(self, prefix="v"):
        self.tmp += 1
        return f"{prefix}{self.tmp}"

    def vars_of(self, ty):
        return [v for v in self.vars if v.ty == ty]

    def spend(self, n=1):
        self.budget -= n
        return self.budget > 0


def list_ty(elem):
    return f"list[{elem}]"


def is_list(ty):
    return ty.startswith("list[")


def elem_of(ty):
    return ty[5:-1]


# --------------------------------------------------------------- literals
def rand_int(rng):
    return rng.choice([0, 1, -1, 2, -2, 7, -7, 100, -100,
                       rng.randint(-1000, 1000)])


def rand_float(rng):
    return round(rng.choice([0.0, 1.0, -1.0, 0.5, -0.5, 3.14,
                             rng.uniform(-1000, 1000)]), 6)


def rand_str(rng):
    words = ["a", "b", "hello", "x", "abc", "", "z9", "world"]
    return rng.choice(words)


def literal(ty, rng):
    if ty == INT:
        return str(rand_int(rng))
    if ty == FLOAT:
        v = rand_float(rng)
        return repr(v) if v != int(v) else f"{v:.1f}"
    if ty == BOOL:
        return rng.choice(["True", "False"])
    if ty == STR:
        return repr(rand_str(rng)).replace("'", '"')
    if is_list(ty):
        n = rng.randint(0, 3)
        elem = elem_of(ty)
        if n == 0:
            return None  # caller must annotate; signal empty
        return "[" + ", ".join(literal(elem, rng) for _ in range(n)) + "]"
    raise ValueError(ty)


# ------------------------------------------------------------- expressions
def gen_expr(ctx, ty, depth=0):
    """Generate an expression of exactly type `ty`, well-typed by construction."""
    ctx.spend()
    choices = []
    if ctx.vars_of(ty):
        choices.append("var")
    choices.append("lit")
    if depth < 3 and ctx.budget > 0:
        if ty in (INT, FLOAT):
            choices += ["binop", "binop", "unary"]
            if ty == INT:
                choices.append("len") if any(is_list(v.ty) or v.ty == STR
                                             for v in ctx.vars) else None
        if ty == BOOL:
            choices += ["compare", "boolop"]
        if ty == STR:
            choices.append("concat")
        if is_list(ty):
            # listcat is exponential when it feeds back into the same
            # loop-carried variable across iterations (l = l+l+... N times
            # nested M loops deep is O(3^N) per outer pass); both CPython
            # and PYTHIA agree it's slow, which isn't a divergence -- but a
            # generator that keeps sampling it wastes fuzzing time on
            # programs that never finish, so keep it out of loop bodies.
            if ctx.loop_depth == 0:
                choices.append("listcat")

    choices = [c for c in choices if c]
    kind = ctx.rng.choice(choices)

    if kind == "var":
        v = ctx.rng.choice(ctx.vars_of(ty))
        return v.name
    if kind == "lit":
        lit = literal(ty, ctx.rng)
        return lit if lit is not None else gen_expr(ctx, ty, depth + 1)

    if kind == "binop" and ty in (INT, FLOAT):
        op = ctx.rng.choice(["+", "-", "*"] + (["//", "%"] if ty == INT else []))
        a = gen_expr(ctx, ty, depth + 1)
        b = gen_expr(ctx, ty, depth + 1)
        if op in ("//", "%"):
            # PySub has no conditional expression, so avoid trivial
            # divide-by-zero noise by biasing the divisor toward a
            # nonzero literal instead of trying to guard it inline.
            b = ctx.rng.choice(["1", "2", "3", "-2", "5", b])
        return f"({a} {op} {b})"

    if kind == "unary" and ty in (INT, FLOAT):
        a = gen_expr(ctx, ty, depth + 1)
        return f"(-{a})" if ctx.rng.random() < 0.5 else f"abs({a})"

    if kind == "len":
        cands = [v for v in ctx.vars if is_list(v.ty) or v.ty == STR]
        v = ctx.rng.choice(cands)
        return f"len({v.name})"

    if kind == "compare" and ty == BOOL:
        num_t = ctx.rng.choice([INT, FLOAT])
        a = gen_expr(ctx, num_t, depth + 1)
        b = gen_expr(ctx, num_t, depth + 1)
        op = ctx.rng.choice(["<", "<=", ">", ">=", "==", "!="])
        return f"({a} {op} {b})"

    if kind == "boolop" and ty == BOOL:
        a = gen_expr(ctx, BOOL, depth + 1)
        b = gen_expr(ctx, BOOL, depth + 1)
        op = ctx.rng.choice(["and", "or"])
        return f"({a} {op} {b})"

    if kind == "concat" and ty == STR:
        a = gen_expr(ctx, STR, depth + 1)
        b = gen_expr(ctx, STR, depth + 1)
        return f"({a} + {b})"

    if kind == "listcat" and is_list(ty):
        a = gen_expr(ctx, ty, depth + 1)
        b = gen_expr(ctx, ty, depth + 1)
        return f"({a} + {b})"

    lit = literal(ty, ctx.rng)
    return lit if lit is not None else "0"


# -------------------------------------------------------------- statements
def gen_type(ctx):
    if ctx.rng.random() < 0.75 or ctx.budget < 5:
        return ctx.rng.choice(PRIM_TYPES)
    return list_ty(ctx.rng.choice(PRIM_TYPES))


def gen_block(ctx, indent, max_stmts):
    lines = []
    n = ctx.rng.randint(1, max_stmts)
    for _ in range(n):
        if not ctx.spend(2):
            break
        lines += gen_stmt(ctx, indent)
    if not lines:
        lines = [("    " * indent) + "pass"]
    return lines


def gen_stmt(ctx, indent):
    pad = "    " * indent
    r = ctx.rng.random()

    if r < 0.35 or not ctx.vars:
        ty = gen_type(ctx)
        name = ctx.fresh("l")
        val = gen_expr(ctx, ty, depth=1)
        ctx.vars.append(Var(name, ty))
        return [f"{pad}{name}: {ty} = {val}"]

    if r < 0.55:
        v = ctx.rng.choice(ctx.vars)
        val = gen_expr(ctx, v.ty, depth=1)
        return [f"{pad}{v.name} = {val}"]

    if r < 0.70 and ctx.budget > 8:
        cond = gen_expr(ctx, BOOL, depth=1)
        saved = list(ctx.vars)
        body = gen_block(ctx, indent + 1, 3)
        ctx.vars = saved
        out = [f"{pad}if {cond}:"] + body
        if ctx.rng.random() < 0.4:
            saved = list(ctx.vars)
            eb = gen_block(ctx, indent + 1, 2)
            ctx.vars = saved
            out += [f"{pad}else:"] + eb
        return out

    if r < 0.85 and ctx.budget > 10 and ctx.loop_depth < 2:
        ctx.loop_depth += 1
        n = ctx.rng.randint(1, 6)
        var = ctx.fresh("i")
        saved = list(ctx.vars)
        ctx.vars.append(Var(var, INT))
        body = gen_block(ctx, indent + 1, 3)
        ctx.vars = saved
        ctx.loop_depth -= 1
        return [f"{pad}for {var} in range({n}):"] + body

    # print something observable
    v = ctx.rng.choice(ctx.vars)
    return [f"{pad}print({v.name})"]


# ------------------------------------------------------------------ driver
def gen_program(seed, budget=60):
    rng = random.Random(seed)
    ctx = Ctx(rng, budget)
    lines = []
    n = rng.randint(3, 8)
    for _ in range(n):
        if not ctx.spend(2):
            break
        lines += gen_stmt(ctx, 0)
    if not any(l.strip().startswith("print(") for l in lines):
        if ctx.vars:
            lines.append(f"print({ctx.rng.choice(ctx.vars).name})")
    return "\n".join(lines) + "\n"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--n", type=int, default=100)
    ap.add_argument("--seed", type=int, default=0)
    ap.add_argument("--budget", type=int, default=60)
    ap.add_argument("--out", default=os.path.join(ROOT, "tests", "generated"))
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)
    for i in range(a.n):
        src = gen_program(seed=a.seed * 1_000_000 + i, budget=a.budget)
        with open(os.path.join(a.out, f"g{a.seed:03d}_{i:04d}.py"), "w") as f:
            f.write(src)
    print(f"wrote {a.n} generated programs to {a.out}")


if __name__ == "__main__":
    main()
