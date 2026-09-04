# expect: returning str from a function declared -> int
def f(a: int) -> int:
    return "not an int"
print(f(1))
