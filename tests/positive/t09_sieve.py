def sieve(n: int) -> int:
    flags: list[bool] = []
    for i in range(n + 1):
        flags.append(True)
    count: int = 0
    for p in range(2, n + 1):
        if flags[p]:
            count += 1
            m: int = p * p
            while m <= n:
                flags[m] = False
                m += p
    return count

print(sieve(300000))
