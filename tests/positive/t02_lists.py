xs: list[int] = []
for i in range(1, 6):
    xs.append(i * i)
print(xs)
print(xs[0], xs[-1], len(xs))
xs[2] = 99
print(xs)
ys: list[str] = ["alpha", "beta"]
ys.append("gamma")
print(ys)
zs: list[float] = [1.5, 2.0, 0.1]
print(zs)
print([True, False, True])
total: int = 0
for v in xs:
    total += v
print("total", total)
