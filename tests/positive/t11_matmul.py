def matmul(a: list[float], b: list[float], n: int) -> float:
    c: list[float] = []
    for i in range(n * n):
        c.append(0.0)
    for i in range(n):
        for k in range(n):
            aik: float = a[i * n + k]
            for j in range(n):
                c[i * n + j] = c[i * n + j] + aik * b[k * n + j]
    total: float = 0.0
    for v in c:
        total += v
    return total

N: int = 90
A: list[float] = []
B: list[float] = []
for i in range(N * N):
    A.append(float(i % 7) * 0.5)
    B.append(float(i % 5) * 0.25)
print(matmul(A, B, N))
