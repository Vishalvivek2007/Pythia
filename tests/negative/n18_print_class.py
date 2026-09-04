# expect: no reproducible repr
class Q:
    x: int
    def __init__(self, x: int) -> None:
        self.x = x
q: Q = Q(1)
print(q)
