"""
PYTHIA Dictionary Library Integration Guide

This document shows how to integrate PyDict with the PYTHIA compiler
to support dictionary operations in transpiled C++ code.

See: DICTIONARY_LIBRARY.md for the complete API reference.
"""

# ============================================================================
# PART 1: COMPILER MODIFICATIONS (emit_c.py)
# ============================================================================

# Add to emit_c.py after the LIST_RT definition:

DICT_RT = {
    ("int", "int"): "PyDictIntInt",
    ("int", "float"): "PyDictIntFloat",
    ("int", "bool"): "PyDictIntBool",
    ("int", "str"): "PyDictIntStr",
    ("str", "int"): "PyDictStrInt",
    ("str", "float"): "PyDictStrFloat",
    ("str", "bool"): "PyDictStrBool",
    ("str", "str"): "PyDictStrStr",
    ("float", "int"): "PyDictFloatInt",
    ("float", "float"): "PyDictFloatFloat",
    ("float", "bool"): "PyDictFloatBool",
    ("float", "str"): "PyDictFloatStr",
    ("bool", "int"): "PyDictBoolInt",
    ("bool", "float"): "PyDictBoolFloat",
    ("bool", "bool"): "PyDictBoolBool",
    ("bool", "str"): "PyDictBoolStr",
}

def dict_rt_name(t):
    """Get the runtime type name for a dictionary type."""
    return DICT_RT[(t.key.name, t.elem.name)]

def ctype(t):
    """Updated to handle dictionary types."""
    # ... existing code ...
    if t.name == "dict":
        return dict_rt_name(t) + " *"
    # ... rest of function ...

# ============================================================================
# PART 2: EXAMPLE PYTHON PROGRAMS AND GENERATED C++
# ============================================================================

# EXAMPLE 1: Basic Dictionary Operations
# ============================================================================

"""
Python Source (example_dict_1.py):
"""
def count_words(text: str) -> dict[str, int]:
    word_count: dict[str, int] = {}
    # (Simplified: assumes words are space-separated)
    words: list[str] = []  # In real code, use text.split()
    for word in words:
        if word in word_count:
            word_count[word] = word_count[word] + 1
        else:
            word_count[word] = 1
    return word_count

"""
Generated C++ (example_dict_1.cpp):
"""
#include <iostream>
#include "runtime/pydict.hpp"

using namespace pythia_dict;

PyDictStrInt count_words(PyStr *text) {
    PyDictStrInt word_count;
    
    // words list would be populated here
    // For now, demonstrate dictionary operations:
    
    if (word_count.contains(word)) {
        word_count[word] = word_count[word] + 1;
    } else {
        word_count[word] = 1;
    }
    
    return word_count;
}

# ============================================================================
# EXAMPLE 2: Dictionary with get() and pop()
# ============================================================================

"""
Python Source (example_dict_2.py):
"""
def process_config(settings: dict[str, str]) -> str:
    host: str = settings.get("host", "localhost")
    port: str = settings.get("port", "3000")
    timeout: str = settings.pop("timeout", "30")
    return host

"""
Generated C++ (example_dict_2.cpp):
"""
PyStr *process_config(PyDictStrStr *settings) {
    PyStr *host = settings->get(pystr_lit("host"), 
                                pystr_lit("localhost"));
    PyStr *port = settings->get(pystr_lit("port"), 
                                pystr_lit("3000"));
    PyStr *timeout = settings->pop(pystr_lit("timeout"), 
                                   pystr_lit("30"));
    return host;
}

# ============================================================================
# EXAMPLE 3: Dictionary Iteration
# ============================================================================

"""
Python Source (example_dict_3.py):
"""
def sum_scores(scores: dict[str, int]) -> int:
    total: int = 0
    for name in scores.keys():
        total = total + scores[name]
    return total

"""
Generated C++ (example_dict_3.cpp):
"""
int64_t sum_scores(PyDictStrInt *scores) {
    int64_t total = 0;
    
    auto keys = scores->keys();
    for (const auto& name : keys) {
        total = total + (*scores)[name];
    }
    
    return total;
}

# ============================================================================
# EXAMPLE 4: Dictionary Initialization
# ============================================================================

"""
Python Source (example_dict_4.py):
"""
def create_defaults() -> dict[str, int]:
    defaults: dict[str, int] = {
        "retries": 3,
        "timeout": 30,
        "max_pool": 10
    }
    return defaults

"""
Generated C++ (example_dict_4.cpp):
"""
PyDictStrInt create_defaults() {
    PyDictStrInt defaults = {
        {"retries", 3},
        {"timeout", 30},
        {"max_pool", 10}
    };
    return defaults;
}

# ============================================================================
# EXAMPLE 5: Dictionary Methods
# ============================================================================

"""
Python Source (example_dict_5.py):
"""
def merge_settings(user: dict[str, str], 
                   defaults: dict[str, str]) -> dict[str, str]:
    result: dict[str, str] = defaults.copy()
    result.update(user)
    return result

"""
Generated C++ (example_dict_5.cpp):
"""
PyDictStrStr merge_settings(PyDictStrStr *user, 
                             PyDictStrStr *defaults) {
    PyDictStrStr result = defaults->copy();
    result.update(*user);
    return result;
}

# ============================================================================
# IMPLEMENTATION CHECKLIST
# ============================================================================

IMPLEMENTATION_CHECKLIST = """
To fully integrate PyDict with PYTHIA:

PHASE 1: Type System
  [ ] Add DictType AST node for dict[K, V] syntax
  [ ] Update parser to recognize dict literals {k:v, ...}
  [ ] Update type checker to infer dictionary types
  [ ] Add type validation for dictionary operations

PHASE 2: Code Generation
  [ ] Update ctype() to generate PyDict* for dict types
  [ ] Add dict literal emission (initialize lists)
  [ ] Map Python dict operations to PyDict methods:
      [ ] d[k] -> d[k]
      [ ] d[k] = v -> d[k] = v
      [ ] k in d -> d.contains(k)
      [ ] len(d) -> d.len()
      [ ] d.keys() -> d.keys()
      [ ] d.values() -> d.values()
      [ ] d.items() -> d.items()
      [ ] d.get(k, default) -> d.get(k, default)
      [ ] d.pop(k) -> d.pop(k)
      [ ] d.pop(k, default) -> d.pop(k, default)
      [ ] d.update(other) -> d.update(other)
      [ ] d.clear() -> d.clear()
      [ ] d.copy() -> d.copy()
      [ ] d.setdefault(k, v) -> d.setdefault(k, v)

PHASE 3: Runtime Integration
  [ ] Include pydict.hpp in generated code
  [ ] Add C++17 compilation flag
  [ ] Verify proper header search path configuration

PHASE 4: Testing
  [ ] Create test suite with dictionary operations
  [ ] Test type combinations (int, str, float, bool keys/values)
  [ ] Test error handling (KeyError on missing key)
  [ ] Test iteration
  [ ] Test mixed operations
  [ ] Verify differential testing against CPython

PHASE 5: Documentation
  [ ] Update README with dictionary support
  [ ] Add examples to user guide
  [ ] Document type annotations for dictionaries
  [ ] Create migration guide for dict-using programs
"""

# ============================================================================
# BUILD SYSTEM INTEGRATION
# ============================================================================

"""
Makefile updates needed:

# Add to compiler dependencies
CFLAGS += -std=c++17
INCLUDES += -I./runtime

# When compiling generated C++ code:
%.o: %.cpp
    $(CXX) $(CFLAGS) $(INCLUDES) -c $< -o $@

# Example: compile a dictionary-using program
example_dict_1: example_dict_1.cpp
    $(CXX) $(CFLAGS) $(INCLUDES) -o example_dict_1 example_dict_1.cpp
"""

# ============================================================================
# QUICK START: Using Dictionary in Your Python Code
# ============================================================================

"""
Once integrated, you can write:

def fibonacci_memo(n: int) -> int:
    memo: dict[int, int] = {}
    
    def fib(k: int) -> int:
        if k in memo:
            return memo[k]
        
        if k <= 1:
            result: int = k
        else:
            result = fib(k - 1) + fib(k - 2)
        
        memo[k] = result
        return result
    
    return fib(n)

# Compile with:
# python3 -m pythia.cli fibonacci_memo.py --run

# Generates optimized C++ with memoization dictionary!
"""

# ============================================================================
# TROUBLESHOOTING
# ============================================================================

TROUBLESHOOTING = """
Problem: "pydict.hpp: No such file or directory"
Solution: Ensure -I flag points to pydict.hpp location during compilation
  g++ -I/path/to/runtime/directory -std=c++17 ...

Problem: "undefined reference to PyDict"
Solution: pydict.hpp is header-only; ensure it's in compilation include path

Problem: KeyError not being caught
Solution: Dictionary access with [] doesn't throw; use .at() for checked access
  int value = dict.at(key);  // Throws PyKeyError if not found

Problem: Dictionary iteration order differs from Python
Solution: PyDict uses unordered_map; order is NOT preserved
  Use PyOrderedDict variant when insertion order matters

Problem: Type errors with mixed key/value types
Solution: Ensure dictionary is declared with correct type parameters
  dict[str, int] vs dict[int, str] are different types in C++
"""

print(__doc__)
print(IMPLEMENTATION_CHECKLIST)
print(TROUBLESHOOTING)
