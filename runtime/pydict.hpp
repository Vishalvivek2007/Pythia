/* PYTHIA Dictionary Runtime Library -- C++17 Header
 * 
 * Provides a Python-compatible dictionary wrapper using C++ std::unordered_map.
 * Supports generic key-value pairs with Python dictionary semantics including:
 *   - Indexing and assignment (dict[key] = value)
 *   - Iteration (keys(), values(), items())
 *   - Standard operations (get, pop, update, clear, etc.)
 *   - Type-safe heterogeneous dictionaries (int/str/bool keys with any value type)
 *
 * Owner: Dictionary Runtime Support
 */

#ifndef PYDICT_HPP
#define PYDICT_HPP

#include <unordered_map>
#include <vector>
#include <memory>
#include <string>
#include <functional>
#include <stdexcept>
#include <cstdint>
#include <cassert>

/* Forward declarations for key/value type conversions */
namespace pythia_dict {

/* ---- Base exception for dictionary operations ---- */
class PyDictError : public std::runtime_error {
public:
    explicit PyDictError(const std::string& msg) : std::runtime_error(msg) {}
};

class PyKeyError : public PyDictError {
public:
    explicit PyKeyError(const std::string& key) 
        : PyDictError("KeyError: " + key) {}
};

class PyTypeError : public PyDictError {
public:
    explicit PyTypeError(const std::string& msg) 
        : PyDictError("TypeError: " + msg) {}
};

/* ---- Hash and equality for basic types ---- */
template <typename K>
struct KeyHash {
    size_t operator()(const K& k) const {
        return std::hash<K>()(k);
    }
};

template <>
struct KeyHash<std::string> {
    size_t operator()(const std::string& s) const {
        return std::hash<std::string>()(s);
    }
};

template <typename K>
struct KeyEqual {
    bool operator()(const K& a, const K& b) const {
        return a == b;
    }
};

template <>
struct KeyEqual<std::string> {
    bool operator()(const std::string& a, const std::string& b) const {
        return a == b;
    }
};

/* ---- Generic PyDict template ---- */
template <typename K, typename V>
class PyDict {
public:
    using Key = K;
    using Value = V;
    using MapType = std::unordered_map<K, V, KeyHash<K>, KeyEqual<K>>;
    using Iterator = typename MapType::iterator;
    using ConstIterator = typename MapType::const_iterator;
    using Pair = std::pair<const K, V>;

private:
    MapType data_;

public:
    /* ---- Constructors ---- */
    PyDict() = default;
    
    PyDict(const std::initializer_list<std::pair<K, V>>& init) {
        for (const auto& [k, v] : init) {
            data_[k] = v;
        }
    }
    
    PyDict(const PyDict& other) = default;
    PyDict(PyDict&& other) noexcept = default;
    
    PyDict& operator=(const PyDict& other) = default;
    PyDict& operator=(PyDict&& other) noexcept = default;
    
    ~PyDict() = default;

    /* ---- Element access (dict[key]) ---- */
    V& operator[](const K& key) {
        return data_[key];
    }

    const V& at(const K& key) const {
        auto it = data_.find(key);
        if (it == data_.end()) {
            throw PyKeyError(key_to_string(key));
        }
        return it->second;
    }

    /* ---- Lookup and insertion ---- */
    V get(const K& key, const V& default_val = V()) const {
        auto it = data_.find(key);
        if (it != data_.end()) {
            return it->second;
        }
        return default_val;
    }

    bool contains(const K& key) const {
        return data_.find(key) != data_.end();
    }

    void insert(const K& key, const V& value) {
        data_[key] = value;
    }

    void set(const K& key, const V& value) {
        data_[key] = value;
    }

    bool remove(const K& key) {
        auto it = data_.find(key);
        if (it != data_.end()) {
            data_.erase(it);
            return true;
        }
        return false;
    }

    V pop(const K& key) {
        auto it = data_.find(key);
        if (it == data_.end()) {
            throw PyKeyError(key_to_string(key));
        }
        V val = it->second;
        data_.erase(it);
        return val;
    }

    V pop(const K& key, const V& default_val) {
        auto it = data_.find(key);
        if (it == data_.end()) {
            return default_val;
        }
        V val = it->second;
        data_.erase(it);
        return val;
    }

    /* ---- Dictionary update operations ---- */
    void update(const PyDict& other) {
        for (const auto& [k, v] : other.data_) {
            data_[k] = v;
        }
    }

    void setdefault(const K& key, const V& value) {
        if (data_.find(key) == data_.end()) {
            data_[key] = value;
        }
    }

    V setdefault_get(const K& key, const V& value) {
        auto it = data_.find(key);
        if (it != data_.end()) {
            return it->second;
        }
        data_[key] = value;
        return value;
    }

    void clear() {
        data_.clear();
    }

    /* ---- Size and capacity ---- */
    size_t size() const {
        return data_.size();
    }

    int64_t len() const {
        return static_cast<int64_t>(data_.size());
    }

    bool empty() const {
        return data_.empty();
    }

    /* ---- Key, value, and item access ---- */
    std::vector<K> keys() const {
        std::vector<K> result;
        for (const auto& [k, v] : data_) {
            result.push_back(k);
        }
        return result;
    }

    std::vector<V> values() const {
        std::vector<V> result;
        for (const auto& [k, v] : data_) {
            result.push_back(v);
        }
        return result;
    }

    std::vector<std::pair<K, V>> items() const {
        std::vector<std::pair<K, V>> result;
        for (const auto& [k, v] : data_) {
            result.push_back({k, v});
        }
        return result;
    }

    /* ---- Copy semantics ---- */
    PyDict copy() const {
        return PyDict(*this);
    }

    /* ---- Iteration support ---- */
    Iterator begin() {
        return data_.begin();
    }

    Iterator end() {
        return data_.end();
    }

    ConstIterator begin() const {
        return data_.begin();
    }

    ConstIterator end() const {
        return data_.end();
    }

    ConstIterator cbegin() const {
        return data_.cbegin();
    }

    ConstIterator cend() const {
        return data_.cend();
    }

    /* ---- Comparison operators ---- */
    bool operator==(const PyDict& other) const {
        if (size() != other.size()) {
            return false;
        }
        for (const auto& [k, v] : data_) {
            auto it = other.data_.find(k);
            if (it == other.data_.end() || it->second != v) {
                return false;
            }
        }
        return true;
    }

    bool operator!=(const PyDict& other) const {
        return !(*this == other);
    }

    /* ---- String representation ---- */
    std::string str() const {
        std::string result = "{";
        bool first = true;
        for (const auto& [k, v] : data_) {
            if (!first) result += ", ";
            result += key_to_string(k);
            result += ": ";
            result += value_to_string(v);
            first = false;
        }
        result += "}";
        return result;
    }

private:
    /* ---- Helper conversions for string representation ---- */
    static std::string key_to_string(const K& key) {
        if constexpr (std::is_same_v<K, std::string>) {
            return "'" + key + "'";
        } else if constexpr (std::is_same_v<K, int64_t>) {
            return std::to_string(key);
        } else if constexpr (std::is_same_v<K, double>) {
            return std::to_string(key);
        } else if constexpr (std::is_same_v<K, bool>) {
            return key ? "True" : "False";
        } else {
            return "key";
        }
    }

    static std::string value_to_string(const V& value) {
        if constexpr (std::is_same_v<V, std::string>) {
            return "'" + value + "'";
        } else if constexpr (std::is_same_v<V, int64_t>) {
            return std::to_string(value);
        } else if constexpr (std::is_same_v<V, double>) {
            return std::to_string(value);
        } else if constexpr (std::is_same_v<V, bool>) {
            return value ? "True" : "False";
        } else {
            return "value";
        }
    }
};

/* ---- Type aliases for common dictionary combinations ---- */
using PyDictIntInt = PyDict<int64_t, int64_t>;
using PyDictIntFloat = PyDict<int64_t, double>;
using PyDictIntBool = PyDict<int64_t, bool>;
using PyDictIntStr = PyDict<int64_t, std::string>;

using PyDictStrInt = PyDict<std::string, int64_t>;
using PyDictStrFloat = PyDict<std::string, double>;
using PyDictStrBool = PyDict<std::string, bool>;
using PyDictStrStr = PyDict<std::string, std::string>;

using PyDictFloatInt = PyDict<double, int64_t>;
using PyDictFloatFloat = PyDict<double, double>;
using PyDictFloatBool = PyDict<double, bool>;
using PyDictFloatStr = PyDict<double, std::string>;

using PyDictBoolInt = PyDict<bool, int64_t>;
using PyDictBoolFloat = PyDict<bool, double>;
using PyDictBoolBool = PyDict<bool, bool>;
using PyDictBoolStr = PyDict<bool, std::string>;

} // namespace pythia_dict

#endif // PYDICT_HPP
