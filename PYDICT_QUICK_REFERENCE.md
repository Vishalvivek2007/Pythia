# PyDict Quick Reference Card

## Include & Setup
```cpp
#include "runtime/pydict.hpp"
using namespace pythia_dict;

// Compile with: g++ -std=c++17 your_file.cpp
```

## Creation
```cpp
PyDictStrInt ages;                              // Empty
PyDictStrInt ages = {{"Alice", 25}};            // From list
PyDictStrInt ages2 = ages.copy();               // Copy
```

## Access & Modification
```cpp
ages["Alice"] = 25;                 // Insert/update
int age = ages["Alice"];            // Get (creates if missing)
int age = ages.at("Alice");         // Get (throws if missing)
int age = ages.get("Alice", -1);    // Get with default
```

## Checks & Queries
```cpp
if (ages.contains("Alice")) {}      // Check exists
int n = ages.len();                 // Get length
bool empty = ages.empty();          // Check if empty
auto keys = ages.keys();            // Get all keys
auto values = ages.values();        // Get all values
auto items = ages.items();          // Get key-value pairs
std::string s = ages.str();         // String representation
```

## Modification
```cpp
ages.insert("Bob", 30);             // Insert
ages["Charlie"] = 28;               // Assignment
ages.remove("Bob");                 // Remove key
int x = ages.pop("David");          // Pop (throws if missing)
int x = ages.pop("David", -1);      // Pop with default
ages.update(other);                 // Merge dictionaries
ages.setdefault("Eve", 22);         // Set if missing
ages.clear();                       // Remove all
```

## Iteration
```cpp
// Range-based for loop (C++17)
for (const auto& [name, age] : ages) {
    std::cout << name << ": " << age << std::endl;
}

// Manual iteration
for (auto it = ages.begin(); it != ages.end(); ++it) {
    const auto& [name, age] = *it;
    // Process...
}
```

## Comparison
```cpp
if (ages == other_ages) {}          // Equality
if (ages != other_ages) {}          // Inequality
```

## Error Handling
```cpp
try {
    int age = ages.at("Missing");   // Throws PyKeyError
} catch (const PyKeyError& e) {
    std::cerr << e.what() << std::endl;
}
```

## Type Aliases Available
```
// Key: int64_t
PyDictIntInt, PyDictIntFloat, PyDictIntBool, PyDictIntStr

// Key: std::string (most common)
PyDictStrInt, PyDictStrFloat, PyDictStrBool, PyDictStrStr

// Key: double
PyDictFloatInt, PyDictFloatFloat, PyDictFloatBool, PyDictFloatStr

// Key: bool
PyDictBoolInt, PyDictBoolFloat, PyDictBoolBool, PyDictBoolStr
```

## Complete Example
```cpp
#include <iostream>
#include "runtime/pydict.hpp"
using namespace pythia_dict;

int main() {
    // Create dictionary
    PyDictStrInt scores = {
        {"Alice", 95},
        {"Bob", 87}
    };
    
    // Access and modify
    scores["Charlie"] = 92;
    
    // Iterate and sum
    int total = 0;
    for (const auto& [name, score] : scores) {
        total += score;
        std::cout << name << ": " << score << std::endl;
    }
    
    // Get with default
    int score = scores.get("Dave", 0);
    std::cout << "Average: " << (total / scores.len()) << std::endl;
    
    return 0;
}
```

## Performance Notes
- **Access/Insert/Remove**: O(1) average
- **Iteration**: O(n)
- **Keys/Values/Items**: O(n) - creates new vectors
- **Update**: O(m) - m = size of other dict
- **Copy**: O(n) - full copy

## Common Patterns

### Word Counter
```cpp
PyDictStrInt freq;
for (const auto& word : words) {
    if (freq.contains(word)) {
        freq[word]++;
    } else {
        freq[word] = 1;
    }
}
```

### Safe Lookup
```cpp
int value = dict.get("key", -1);    // Safe, returns default
```

### Merge Configs
```cpp
PyDictStrStr config = defaults.copy();
config.update(user_settings);
```

### Get All Keys
```cpp
auto all_keys = dict.keys();
for (const auto& key : all_keys) {
    // Process key...
}
```

---

**See PYDICT_README.md for more examples and API details.**
