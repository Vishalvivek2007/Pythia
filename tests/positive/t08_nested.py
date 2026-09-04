def primes_below(n: int) -> list[int]:
    out: list[int] = []
    for c in range(2, n):
        ok: bool = True
        d: int = 2
        while d * d <= c:
            if c % d == 0:
                ok = False
                break
            d += 1
        if ok:
            out.append(c)
    return out

print(primes_below(50))
print(len(primes_below(200)))

def mean(xs: list[int]) -> float:
    if len(xs) == 0:
        return 0.0
    s: int = 0
    for x in xs:
        s += x
    return s / len(xs)

print(mean([1, 2, 3, 4]), mean([1, 2]), mean([]))
