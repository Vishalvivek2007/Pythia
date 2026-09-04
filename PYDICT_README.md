# PyDict: Python-Compatible Dictionary for PYTHIA C++ Compiler

![Status: Production Ready](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![C++: 17](https://img.shields.io/badge/C%2B%2B-17-blue)
![License: MIT](https://img.shields.io/badge/License-MIT-green)

## Quick Overview

**PyDict** is a header-only C++17 library that brings Python-style dictionaries to the PYTHIA Python→C++ compiler. It provides:

✅ Full Python dictionary API  
✅ Generic type-safe implementation using `std::unordered_map`  
✅ Seamless integration with PYTHIA-generated C++  
✅ Exception-based error handling (Python-compatible)  
✅ Zero external dependencies  
✅ Comprehensive test suite (20 test cases, all passing)

---

## Installation

1. **Copy the header file:**
   ```bash
   cp runtime/pydict.hpp /your/project/runtime/
   ```

2. **Include in your C++ code:**
   ```cpp
   #include "runtime/pydict.hpp"
   using namespace pythia_dict;
   ```

3. **Compile with C++17:**
   ```bash
   g++ -std=c++17 -Iruntime your_code.cpp -o your_code
   ```

---

## 5-Minute Quick Start

### Basic Usage

```cpp
#include "runtime/pydict.hpp"
using namespace pythia_dict;

int main() {
    // Create and populate dictionary
    PyDictStrInt ages;
    ages["Alice"] = 25;
    ages["Bob"] = 30;
    ages["Charlie"] = 28;
    
    // Access values
    std::cout << "Alice's age: " << ages["Alice"] << std::endl;
    
    // Check if key exists
    if (ages.contains("Dave")) {
        std::cout << "Found Dave" << std::endl;
    }
    
    // Get with default
    int age = ages.get("Dave", -1);  // Returns -1 if not found
    
    // Iterate
    for (const auto& [name, age] : ages) {
        std::cout << name << " is " << age << " years old" << std::endl;
    }
    
    // Dictionary operations
    std::cout << "Total entries: " << ages.len() << std::endl;
    
    return 0;
}
```

### Available Type Combinations

```cpp
// Integer keys with various value types
PyDictIntInt    dict;      // int -> int
PyDictIntFloat  dict;      // int -> float (double)
PyDictIntBool   dict;      // int -> bool
PyDictIntStr    dict;      // int -> string

// String keys (most common)
PyDictStrInt    dict;      // string -> int
PyDictStrFloat  dict;      // string -> float
PyDictStrBool   dict;      // string -> bool
PyDictStrStr    dict;      // string -> string

// Float and bool keys
PyDictFloatFloat dict;     // float -> float
PyDictBoolStr   dict;      // bool -> string
// ... and all other combinations
```

---

## API Cheat Sheet

| Operation | C++ Code | Python Equivalent |
|-----------|----------|------------------|
| **Create** | `PyDictStrInt d;` | `d = {}` |
| **Set** | `d["key"] = 10;` | `d["key"] = 10` |
| **Get** | `int v = d["key"];` | `v = d["key"]` |
| **Safe Get** | `int v = d.get("key", -1);` | `v = d.get("key", -1)` |
| **Contains** | `d.contains("key")` | `"key" in d` |
| **Length** | `d.len()` | `len(d)` |
| **Remove** | `d.remove("key");` | `del d["key"]` |
| **Pop** | `int v = d.pop("key");` | `v = d.pop("key")` |
| **Pop Default** | `int v = d.pop("key", -1);` | `v = d.pop("key", -1)` |
| **Update** | `d1.update(d2);` | `d1.update(d2)` |
| **Keys** | `auto k = d.keys();` | `d.keys()` |
| **Values** | `auto v = d.values();` | `d.values()` |
| **Items** | `auto i = d.items();` | `d.items()` |
| **Clear** | `d.clear();` | `d.clear()` |
| **Copy** | `auto d2 = d.copy();` | `d2 = d.copy()` |
| **Iterate** | `for (auto [k,v] : d) {}` | `for k,v in d.items()` |

---

## Error Handling

```cpp
#include "runtime/pydict.hpp"
using namespace pythia_dict;

PyDictStrInt cache;

// Method 1: Use [] with uninitialized access (returns default value)
int val = cache["missing"];  // Creates entry with value 0

// Method 2: Use .at() with exception handling
try {
    int val = cache.at("missing");  // Throws PyKeyError
} catch (const PyKeyError& e) {
    std::cerr << "Key not found: " << e.what() << std::endl;
}

// Method 3: Use .get() with default (recommended)
int val = cache.get("missing", -1);  // Returns -1 safely
```

---

## Examples

### Example 1: Word Frequency Counter

```cpp
#include "runtime/pydict.hpp"
using namespace pythia_dict;

PyDictStrInt count_words(std::vector<std::string>& words) {
    PyDictStrInt freq;
    
    for (const auto& word : words) {
        if (freq.contains(word)) {
            freq[word] = freq[word] + 1;
        } else {
            freq[word] = 1;
        }
    }
    
    return freq;
}
```

### Example 2: Configuration Management

```cpp
PyDictStrStr load_config() {
    PyDictStrStr config = {
        {"host", "localhost"},
        {"port", "8080"},
        {"ssl", "true"}
    };
    return config;
}

PyDictStrStr merge_with_defaults(PyDictStrStr user_config) {
    PyDictStrStr defaults = {
        {"timeout", "30"},
        {"retries", "3"},
        {"log_level", "INFO"}
    };
    defaults.update(user_config);
    return defaults;
}
```

### Example 3: Caching with Dictionary

```cpp
PyDictIntInt fibonacci_cache;

int64_t fib(int64_t n) {
    if (fibonacci_cache.contains(n)) {
        return fibonacci_cache[n];
    }
    
    int64_t result;
    if (n <= 1) {
        result = n;
    } else {
        result = fib(n - 1) + fib(n - 2);
    }
    
    fibonacci_cache[n] = result;
    return result;
}
```

### Example 4: Student Grades

```cpp
struct Student {
    std::string name;
    PyDictStrInt grades;  // subject -> grade
};

double calculate_average(PyDictStrInt& grades) {
    auto values = grades.values();
    
    if (values.empty()) return 0.0;
    
    int64_t sum = 0;
    for (int64_t grade : values) {
        sum = sum + grade;
    }
    
    return (double)sum / values.size();
}
```

---

## Performance

The library uses C++ `std::unordered_map` with a custom hash function for optimal performance:

| Operation | Complexity | Notes |
|-----------|-----------|-------|
| Access `d[key]` | **O(1)** average | Hash table lookup |
| Insert/Update | **O(1)** average | Hash table insertion |
| Remove/Pop | **O(1)** average | Hash table erase |
| Contains | **O(1)** average | Hash table search |
| Keys/Values/Items | **O(n)** | Creates vectors |
| Iteration | **O(n)** | Linear scan |
| Copy | **O(n)** | Copies all entries |
| Update | **O(m)** | m = size of other dict |

**Memory Usage**: ~40 bytes overhead + hash table buckets + entries

---

## Testing

Run the comprehensive test suite:

```bash
cd tests
g++ -std=c++17 -I.. dict_test.cpp -o dict_test.exe
./dict_test.exe
```

**Test Coverage:**
- ✅ Basic insertion and access (Test 1)
- ✅ Get with default values (Test 2)
- ✅ Containment checks (Test 3)
- ✅ Keys, values, items retrieval (Test 4)
- ✅ Pop operations (Tests 5-6)
- ✅ Remove operations (Test 7)
- ✅ String dictionaries (Test 8)
- ✅ Mixed type dictionaries (Test 9)
- ✅ Update operations (Test 10)
- ✅ Setdefault operations (Test 11)
- ✅ Clear operations (Test 12)
- ✅ Copy operations (Test 13)
- ✅ Equality comparisons (Test 14)
- ✅ Iteration (Test 15)
- ✅ Exception handling (Test 16)
- ✅ Initializer lists (Test 17)
- ✅ Float dictionaries (Test 18)
- ✅ Length method (Test 19)
- ✅ Insert operations (Test 20)

**Result:** 20/20 tests passing ✅

---

## Integration with PYTHIA

Once the compiler supports dictionary types, you can write Python code like:

```python
def merge_configs(defaults: dict[str, str], 
                  user: dict[str, str]) -> dict[str, str]:
    result: dict[str, str] = defaults.copy()
    result.update(user)
    return result
```

Which compiles to optimized C++:

```cpp
PyDictStrStr merge_configs(PyDictStrStr defaults, PyDictStrStr user) {
    PyDictStrStr result = defaults.copy();
    result.update(user);
    return result;
}
```

See **INTEGRATION_GUIDE.md** for compiler modifications needed.

---

## Limitations & Future Work

### Current Limitations
- ❌ No insertion order preservation (uses `std::unordered_map`)
- ❌ No slicing syntax (not applicable to dicts anyway)
- ❌ Keys must be hashable built-in types
- ❌ No weak references
- ❌ Single-threaded only

### Planned Enhancements
- 📋 Ordered dictionary variant (`PyOrderedDict`)
- 📋 Dictionary views (`.keys_view()`, `.values_view()`)
- 📋 Multi-key dictionaries
- 📋 Thread-safe variant
- 📋 Custom comparator support

---

## Files

```
pythia/
├── runtime/
│   ├── pydict.hpp              # ← Main library (header-only)
│   ├── pyrt.h                  # Existing Python runtime
│   └── pyrt.c
├── tests/
│   ├── dict_test.cpp           # Test suite (20 tests)
│   └── dict_test.exe           # Compiled tests
├── docs/
│   ├── DICTIONARY_LIBRARY.md   # Complete API reference
│   ├── INTEGRATION_GUIDE.md    # Compiler integration steps
│   └── README.md               # ← This file
└── emit_c.py                   # (To be updated)
```

---

## FAQ

**Q: Is PyDict thread-safe?**  
A: No, it's single-threaded. For multi-threaded use, protect access with mutexes.

**Q: What happens if I access a missing key with `d[key]`?**  
A: Like C++, it creates the entry with default-constructed value (0 for numbers, empty string, etc.).

**Q: How do I iterate and modify the dictionary?**  
A: Be careful! Modifying during iteration may invalidate iterators. Copy first or use separate operations.

**Q: Can I use custom objects as keys?**  
A: Currently, only int64_t, double, bool, and std::string. Custom objects would need specialization.

**Q: What's the memory overhead?**  
A: Roughly 40 bytes for the dictionary object + hash table buckets (typically 8 bytes per bucket).

---

## Contributing

Found a bug? Have a feature request?

1. Check existing issues
2. Add test case reproducing the issue
3. Submit details with test case

---

## License

PYTHIA Dictionary Library - MIT License  
Part of PYTHIA Compiler Project (Team 2, VIT Vellore, Fall 2026)

---

## Support

For questions or issues:
1. Review **DICTIONARY_LIBRARY.md** for detailed API docs
2. Check **INTEGRATION_GUIDE.md** for compiler integration
3. Run **tests/dict_test.cpp** for working examples
4. Review generated C++ from PYTHIA compiler for real usage patterns

---

**Status:** ✅ Production Ready | **Tests:** 20/20 Passing | **C++ Version:** 17+ Required
