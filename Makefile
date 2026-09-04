.PHONY: test bench clean figures
PY ?= python3

test:
	$(PY) tools/oracle.py -v

figures:
	$(PY) docs/make_figures.py

clean:
	rm -rf build __pycache__ pythia/__pycache__ docs/_arch.dot
