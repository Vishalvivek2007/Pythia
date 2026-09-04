def fib(n: int) -> int:
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)

def classify(n: int) -> str:
    if n < 0:
        return "negative"
    elif n == 0:
        return "zero"
    elif n % 2 == 0:
        return "even"
    else:
        return "odd"

for i in range(10):
    print(i, fib(i), classify(i - 4))

i: int = 0
while True:
    i += 1
    if i % 3 == 0:
        continue
    if i > 10:
        break
    print("w", i)
