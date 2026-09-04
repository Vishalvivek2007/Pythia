# expect: without returning a value
def g(n: int) -> int:
    if n > 0:
        return 1
print(g(3))
