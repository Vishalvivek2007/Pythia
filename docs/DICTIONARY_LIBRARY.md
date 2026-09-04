# PyDict: Python Dictionary Runtime Library for PYTHIA

## Overview

**PyDict** is an external C++17 runtime library that provides Python-compatible dictionary semantics for the PYTHIA Python-to-C++ compiler. It wraps C++ `std::unordered_map` and implements Python's dictionary API, including indexing, iteration, and all standard dictionary methods.

## Architecture

### Class Structure

```cpp
namespace pythia_dict {
    template <typename K, typename V>
    class PyDict {
        std::unordered_map<K, V, KeyHash<K>, KeyEqual<K>> data_;
        // ... methods ...
    };
}
```

**Key Features:**
- Type-safe generic dictionary with any key-value combination
- Efficient `O(1)` average-case lookup and insertion
- Full Python dictionary API
- Exception-based error handling (KeyError, TypeError)
- Support for string representation and iteration

### Supported Type Combinations

The library provides pre-instantiated type aliases for common combinations:

| Key Type | Value Types |
|----------|-------------|
| `int64_t` | int64_t, double, bool, std::string |
| `std::string` | int64_t, double, bool, std::string |
| `double` | int64_t, double, bool, std::string |
| `bool` | int64_t, double, bool, std::string |

**Type Aliases:**
- `PyDictIntInt`, `PyDictIntFloat`, `PyDictIntBool`, `PyDictIntStr`
- `PyDictStrInt`, `PyDictStrFloat`, `PyDictStrBool`, `PyDictStrStr`
- `PyDictFloatInt`, `PyDictFloatFloat`, `PyDictFloatBool`, `PyDictFloatStr`
- `PyDictBoolInt`, `PyDictBoolFloat`, `PyDictBoolBool`, `PyDictBoolStr`

## API Reference

### Constructors

```cpp
PyDict();                           // Empty dictionary
PyDict(const PyDict& other);        // Copy constructor
PyDict(PyDict&& other);             // Move constructor
PyDict({ {k1, v1}, {k2, v2} });    // Initializer list
```

### Element Access

```cpp
V& operator[](const K& key);           // Access/create element (like dict[key])
const V& at(const K& key) const;       // Access with bounds checking (throws KeyError)
V get(const K& key, const V& default_val = V()) const;  // Get with default
```

### Lookup and Modification

```cpp
bool contains(const K& key) const;     // Check if key exists
void insert(const K& key, const V& value);  // Insert/update key-value pair
void set(const K& key, const V& value);     // Alias for insert()
bool remove(const K& key);              // Remove key, returns success
V pop(const K& key);                    // Remove and return value (throws KeyError)
V pop(const K& key, const V& default_val);  // Remove and return with default
```

### Dictionary Operations

```cpp
void update(const PyDict& other);       // Merge another dictionary
void setdefault(const K& key, const V& value);  // Set if key doesn't exist
V setdefault_get(const K& key, const V& value); // Set if missing and return
void clear();                            // Remove all elements
PyDict copy() const;                     // Create a shallow copy
```

### Query Methods

```cpp
size_t size() const;                    // Number of key-value pairs
int64_t len() const;                    // Length as int64_t (Python-compatible)
bool empty() const;                     // Check if empty
std::vector<K> keys() const;            // Get all keys
std::vector<V> values() const;          // Get all values
std::vector<std::pair<K, V>> items() const;  // Get all key-value pairs
```

### Iteration

```cpp
Iterator begin();                        // Begin iterator
Iterator end();                          // End iterator
for (const auto& [k, v] : dict) { ... } // Range-based for loop
```

### Comparison

```cpp
bool operator==(const PyDict& other) const;
bool operator!=(const PyDict& other) const;
```

### String Representation

```cpp
std::string str() const;  // Python-like string representation
```

## Exception Handling

The library defines custom exception classes:

```cpp
class PyDictError : public std::runtime_error;       // Base dictionary error
class PyKeyError : public PyDictError;               // Key not found
class PyTypeError : public PyDictError;              // Type mismatch
```

**Example:**
```cpp
try {
    dict.at(missing_key);  // Throws PyKeyError
} catch (const PyKeyError& e) {
    std::cerr << e.what() << std::endl;
}
```

## Usage Examples

### Basic Usage

```cpp
#include "runtime/pydict.hpp"
using namespace pythia_dict;

int main() {
    PyDictStrInt scores;
    
    // Assignment (dict[key] = value)
    scores["Alice"] = 95;
    scores["Bob"] = 87;
    scores["Charlie"] = 92;
    
    // Lookup with default
    int score = scores.get("Alice", 0);  // Returns 95
    int unknown = scores.get("Dave", 0); // Returns 0
    
    // Check containment
    if (scores.contains("Bob")) {
        std::cout << "Bob's score: " << scores["Bob"] << std::endl;
    }
    
    // Iteration
    for (const auto& [name, score] : scores) {
        std::cout << name << ": " << score << std::endl;
    }
    
    return 0;
}
```

### Dictionary Operations

```cpp
PyDictStrStr config = {
    {"host", "localhost"},
    {"port", "8080"}
};

// Pop a value
std::string port = config.pop("port", "3000");

// Update with another dictionary
PyDictStrStr defaults = {
    {"timeout", "30"},
    {"retries", "3"}
};
config.update(defaults);

// Set default
config.setdefault("ssl", "false");

// Print dictionary
std::cout << config.str() << std::endl;
// Output: {'ssl': 'false', 'retries': '3', 'timeout': '30', 'host': 'localhost'}
```

### Error Handling

```cpp
PyDictIntInt cache;

try {
    // This will throw PyKeyError
    int value = cache.at(999);
} catch (const pythia_dict::PyKeyError& e) {
    std::cerr << "Cache miss: " << e.what() << std::endl;
}

// Using pop with default for safe access
int value = cache.pop(999, -1);  // Returns -1, no exception
```

## Integration with PYTHIA Compiler

### Compiler Changes

The PYTHIA compiler needs to:

1. **Recognize dictionary types** in the AST and type checker
2. **Generate C++ code** that uses PyDict template instantiations
3. **Map Python operations** to PyDict methods:

| Python | C++ Method |
|--------|-----------|
| `d[k]` | `d[k]` or `d.at(k)` |
| `d[k] = v` | `d[k] = v` |
| `k in d` | `d.contains(k)` |
| `d.get(k, default)` | `d.get(k, default)` |
| `d.pop(k)` | `d.pop(k)` |
| `d.pop(k, default)` | `d.pop(k, default)` |
| `d.update(other)` | `d.update(other)` |
| `d.keys()` | `d.keys()` |
| `d.values()` | `d.values()` |
| `d.items()` | `d.items()` |
| `d.clear()` | `d.clear()` |
| `len(d)` | `d.len()` |
| `d.copy()` | `d.copy()` |

### Example Translation

**Python Code:**
```python
def process_data(data: dict[str, int]) -> dict[str, int]:
    result: dict[str, int] = {}
    for key in data.keys():
        result[key] = data[key] * 2
    return result
```

**Generated C++ Code:**
```cpp
using namespace pythia_dict;

PyDictStrInt process_data(PyDictStrInt data) {
    PyDictStrInt result;
    auto keys = data.keys();
    for (const auto& key : keys) {
        result[key] = data[key] * 2;
    }
    return result;
}
```

### Compiler Integration Steps

1. **Update `emit_c.py`:**
   - Add dictionary type handling to `ctype()` function
   - Generate PyDict declarations and initializations
   - Translate dictionary literals to initializer lists
   - Map dict methods to PyDict methods

2. **Update `ast_nodes.py`:**
   - Add `DictLiteral` AST node
   - Add dictionary type expressions

3. **Update `typecheck.py`:**
   - Add dictionary type inference
   - Type-check dictionary operations

4. **Build Integration:**
   - Include `-std=c++17` flag for C++ compilation
   - Link with pydict.hpp (header-only library)

### Compilation Example

```bash
# Compile Python to C++
python3 -m pythia.cli program.py --emit-only > program.cpp

# Compile generated C++ with dictionary support
g++ -std=c++17 -I/path/to/runtime -o program program.cpp runtime/pydict.hpp
```

## Performance Characteristics

| Operation | Time Complexity | Notes |
|-----------|-----------------|-------|
| `dict[key]` | O(1) average | Uses unordered_map hash table |
| `dict.get(key)` | O(1) average | Hash table lookup |
| `dict.pop(key)` | O(1) average | Hash table erase |
| `dict.update()` | O(n) | n = size of other dict |
| `dict.keys()` | O(n) | Creates vector copy |
| `dict.values()` | O(n) | Creates vector copy |
| `dict.items()` | O(n) | Creates vector copy |
| Iteration | O(n) | Linear scan of hash table |

## Known Limitations

1. **No slicing**: Python's dictionary slicing isn't supported (not applicable anyway)
2. **No default __hash__**: Only built-in types (int, float, bool, string) supported as keys
3. **Single-threaded**: No thread safety guarantees
4. **No weak references**: All references are strong
5. **No ordering guarantee**: Unlike Python 3.7+, insertion order is NOT preserved

## Building and Testing

```bash
# Compile the test suite
g++ -std=c++17 -I. -o tests/dict_test.exe tests/dict_test.cpp

# Run tests
./tests/dict_test.exe

# Expected output: "All tests passed!"
```

## Files

- `runtime/pydict.hpp` - Main library header (header-only)
- `tests/dict_test.cpp` - Comprehensive test suite (20 test cases)
- `docs/DICTIONARY_LIBRARY.md` - This documentation

## Future Enhancements

- [ ] Ordered dictionary variant (preserves insertion order)
- [ ] Dictionary comprehensions
- [ ] Custom hash functions for user-defined types
- [ ] Dictionary view objects (keys_view, values_view, items_view)
- [ ] Multi-key dictionaries
- [ ] Thread-safe variant with locks

## License

Part of PYTHIA compiler project. Original work by Team 2, VIT Vellore.
