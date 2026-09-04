def bubble(a: list[int]) -> list[int]:
    n: int = len(a)
    for i in range(n):
        for j in range(0, n - i - 1):
            if a[j] > a[j + 1]:
                tmp: int = a[j]
                a[j] = a[j + 1]
                a[j + 1] = tmp
    return a

data: list[int] = [5, 2, 9, -3, 7, 0, 5]
print(bubble(data))

def gcd(a: int, b: int) -> int:
    while b != 0:
        t: int = b
        b = a % b
        a = t
    return a

print(gcd(48, 18), gcd(-48, 18))
