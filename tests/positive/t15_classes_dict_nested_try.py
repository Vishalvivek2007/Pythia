class Point:
    x: int
    y: int
    def __init__(self, x: int, y: int) -> None:
        self.x = x
        self.y = y
    def dist2(self) -> int:
        return self.x * self.x + self.y * self.y

p: Point = Point(3, 4)
print(p.dist2())
p.x = 10
print(p.x)

d: dict[str, int] = {}
d["a"] = 1
d["b"] = 2
print(d["a"], len(d))
print("a" in d, "z" in d)
print(d)
print(d.get("c", -1))
for k in d:
    print(k)

xs: list[list[int]] = [[1, 2], [3, 4]]
print(xs[0][1], xs[1][0])
xs[0][0] = 99
print(xs)

ys: list[int] = [1, 2, 3]
print(2 in ys, 9 in ys)

try:
    y: int = 1 // 0
    print("unreached")
except ZeroDivisionError as e:
    print("caught", e)

try:
    z: int = d["nope"]
except KeyError as e:
    print("caught key error")
