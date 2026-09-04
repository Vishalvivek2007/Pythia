# expect: outside loop
try:
    break
except ValueError:
    pass
