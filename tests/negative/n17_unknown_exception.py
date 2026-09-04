# expect: unknown exception type
try:
    x: int = 1
except WeirdError as e:
    print(e)
