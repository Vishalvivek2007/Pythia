class Counter:
    value: int
    step: int
    def __init__(self, start: int, step: int) -> None:
        self.value = start
        self.step = step
    def bump(self) -> int:
        self.value = self.value + self.step
        return self.value
    def reset_if_over(self, limit: int) -> None:
        if self.value > limit:
            self.value = 0

c: Counter = Counter(0, 3)
for i in range(5):
    print(c.bump())
c.reset_if_over(10)
print(c.value)

# Dict with int keys and float values
scores: dict[int, float] = {}
for i in range(4):
    scores[i] = float(i) * 1.5
print(scores)
total: float = 0.0
for k in scores:
    total += scores[k]
print(total)

# Nested try/except with propagation
def risky(n: int) -> int:
    if n == 0:
        raise ValueError("zero not allowed")
    return 100 // n

def wrapper(n: int) -> int:
    try:
        return risky(n)
    except ValueError as e:
        print("wrapper caught:", e)
        return -1

print(wrapper(5))
print(wrapper(0))

# bare except
try:
    x: int = 10 // 0
except:
    print("bare except caught it")

# except that doesn't match propagates
def outer() -> None:
    try:
        risky(0)
    except ZeroDivisionError:
        print("wrong handler - should not print")

try:
    outer()
except ValueError as e:
    print("propagated to caller:", e)
