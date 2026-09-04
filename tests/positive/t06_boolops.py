def sign(x: int) -> int:
    if x > 0 and x < 100:
        return 1
    if x < 0 or x > 1000:
        return -1
    return 0

print(sign(5), sign(-5), sign(500), sign(2000))
a: bool = True
b: bool = False
print(a and b, a or b, not a, not b)
print(1 < 2, 2.5 >= 2, "a" < "b")
n: int = 0
if not n:
    print("zero is falsy")
s: str = ""
if not s:
    print("empty string is falsy")
xs: list[int] = []
if not xs:
    print("empty list is falsy")
