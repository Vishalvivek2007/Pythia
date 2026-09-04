# Divergence classes D1-D4: floor division, modulo sign, true division.
def show(a: int, b: int) -> None:
    print(a, b, a // b, a % b, a / b)

show(7, 2)
show(-7, 2)
show(7, -2)
show(-7, -2)
print(2 ** 10, 3 ** 0)
print(10 / 4, 10 // 4, 10 % 4)
print(-1.5 // 0.5, -1.5 % 0.5)
print(abs(-9), abs(-2.5), min(3, 8), max(3.5, 2.0))
