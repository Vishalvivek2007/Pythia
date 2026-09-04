# expect: no field
class P:
    x: int
    def __init__(self, x: int) -> None:
        self.x = x
p: P = P(1)
print(p.z)
