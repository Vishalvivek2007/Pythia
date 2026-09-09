/*
 * PYTHIA Set Runtime Library -- C++17 Header
 *
 * Provides a Python-compatible set wrapper using
 * C++ std::unordered_set.
 *
 * Features:
 *   - Add/remove/discard elements
 *   - Membership checking
 *   - Set union/intersection/difference
 *   - Symmetric difference
 *   - Subset/superset/disjoint checks
 *   - Copying and comparison
 *   - Iteration
 *   - Python-style string representation
 *
 * Owner: Jahnavi
 */

#ifndef PYSET_HPP
#define PYSET_HPP

#include <unordered_set>
#include <vector>
#include <string>
#include <stdexcept>
#include <cstdint>
#include <initializer_list>
#include <type_traits>
#include <sstream>
#include <utility>

namespace pythia_set {

/* ============================================================
 * Exceptions
 * ============================================================ */

class PySetError : public std::runtime_error {
public:
    explicit PySetError(const std::string& msg)
        : std::runtime_error(msg) {}
};

class PyKeyError : public PySetError {
public:
    explicit PyKeyError(const std::string& value)
        : PySetError("KeyError: " + value) {}
};

/* ============================================================
 * Generic PySet class
 * ============================================================ */

template <typename T>
class PySet {
public:
    using Value = T;
    using SetType = std::unordered_set<T>;
    using Iterator = typename SetType::iterator;
    using ConstIterator = typename SetType::const_iterator;

private:
    SetType data_;

public:

    /* ========================================================
     * Constructors
     * ======================================================== */

    PySet() = default;

    PySet(std::initializer_list<T> init) {
        for (const auto& value : init) {
            data_.insert(value);
        }
    }

    PySet(const PySet& other) = default;

    PySet(PySet&& other) noexcept = default;

    PySet& operator=(const PySet& other) = default;

    PySet& operator=(PySet&& other) noexcept = default;

    ~PySet() = default;


    /* ========================================================
     * Basic element operations
     * ======================================================== */

    /*
     * Add an element.
     *
     * Python:
     *     s.add(x)
     *
     * Duplicate values are automatically ignored.
     */
    void add(const T& value) {
        data_.insert(value);
    }


    /*
     * Add all elements from another set.
     *
     * Python:
     *     s.update(other)
     */
    void update(const PySet& other) {
        for (const auto& value : other.data_) {
            data_.insert(value);
        }
    }


    /*
     * Check whether an element exists.
     *
     * Python:
     *     x in s
     */
    bool contains(const T& value) const {
        return data_.find(value) != data_.end();
    }


    /*
     * Remove an element.
     *
     * Python:
     *     s.remove(x)
     *
     * Raises PyKeyError if the value does not exist.
     */
    void remove(const T& value) {
        auto it = data_.find(value);

        if (it == data_.end()) {
            throw PyKeyError(value_to_string(value));
        }

        data_.erase(it);
    }


    /*
     * Remove an element if it exists.
     *
     * Python:
     *     s.discard(x)
     *
     * Does nothing if the value is absent.
     */
    void discard(const T& value) {
        data_.erase(value);
    }


    /*
     * Remove and return an arbitrary element.
     *
     * Python:
     *     s.pop()
     *
     * Because unordered_set has no fixed ordering, the
     * returned element is arbitrary.
     */
    T pop() {
        if (data_.empty()) {
            throw PySetError("KeyError: pop from an empty set");
        }

        auto it = data_.begin();
        T value = *it;
        data_.erase(it);

        return value;
    }


    /*
     * Remove all elements.
     *
     * Python:
     *     s.clear()
     */
    void clear() {
        data_.clear();
    }


    /* ========================================================
     * Size operations
     * ======================================================== */

    size_t size() const {
        return data_.size();
    }

    int64_t len() const {
        return static_cast<int64_t>(data_.size());
    }

    bool empty() const {
        return data_.empty();
    }


    /* ========================================================
     * Set operations
     * ======================================================== */

    /*
     * Union:
     *
     * A | B
     *
     * Returns all elements from both sets.
     */
    PySet union_set(const PySet& other) const {
        PySet result = *this;

        for (const auto& value : other.data_) {
            result.data_.insert(value);
        }

        return result;
    }


    /*
     * Intersection:
     *
     * A & B
     *
     * Returns elements common to both sets.
     */
    PySet intersection(const PySet& other) const {
        PySet result;

        for (const auto& value : data_) {
            if (other.contains(value)) {
                result.data_.insert(value);
            }
        }

        return result;
    }


    /*
     * Difference:
     *
     * A - B
     *
     * Returns elements present in this set
     * but not in the other set.
     */
    PySet difference(const PySet& other) const {
        PySet result;

        for (const auto& value : data_) {
            if (!other.contains(value)) {
                result.data_.insert(value);
            }
        }

        return result;
    }


    /*
     * Symmetric difference:
     *
     * A ^ B
     *
     * Returns elements that are in either set,
     * but not in both.
     */
    PySet symmetric_difference(const PySet& other) const {
        PySet result;

        for (const auto& value : data_) {
            if (!other.contains(value)) {
                result.data_.insert(value);
            }
        }

        for (const auto& value : other.data_) {
            if (!contains(value)) {
                result.data_.insert(value);
            }
        }

        return result;
    }


    /* ========================================================
     * Set relationship operations
     * ======================================================== */

    /*
     * Check whether this set is a subset of another set.
     *
     * Python:
     *     A.issubset(B)
     */
    bool issubset(const PySet& other) const {
        for (const auto& value : data_) {
            if (!other.contains(value)) {
                return false;
            }
        }

        return true;
    }


    /*
     * Check whether this set is a superset of another set.
     *
     * Python:
     *     A.issuperset(B)
     */
    bool issuperset(const PySet& other) const {
        return other.issubset(*this);
    }


    /*
     * Check whether two sets have no common elements.
     *
     * Python:
     *     A.isdisjoint(B)
     */
    bool isdisjoint(const PySet& other) const {
        for (const auto& value : data_) {
            if (other.contains(value)) {
                return false;
            }
        }

        return true;
    }


    /* ========================================================
     * Copy
     * ======================================================== */

    /*
     * Python:
     *     s.copy()
     */
    PySet copy() const {
        return PySet(*this);
    }


    /* ========================================================
     * Iteration
     * ======================================================== */

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


    /* ========================================================
     * Conversion to vector
     * ======================================================== */

    /*
     * Return all set elements as a vector.
     *
     * Useful when generated code needs a sequential
     * collection of the set contents.
     */
    std::vector<T> to_vector() const {
        std::vector<T> result;

        result.reserve(data_.size());

        for (const auto& value : data_) {
            result.push_back(value);
        }

        return result;
    }


    /* ========================================================
     * Comparison operators
     * ======================================================== */

    bool operator==(const PySet& other) const {
        return data_ == other.data_;
    }

    bool operator!=(const PySet& other) const {
        return data_ != other.data_;
    }


    /*
     * Subset comparison operators.
     *
     * These are useful for Python-like set comparisons.
     */

    bool operator<=(const PySet& other) const {
        return issubset(other);
    }

    bool operator>=(const PySet& other) const {
        return issuperset(other);
    }

    bool operator<(const PySet& other) const {
        return issubset(other) && (*this != other);
    }

    bool operator>(const PySet& other) const {
        return issuperset(other) && (*this != other);
    }


    /* ========================================================
     * String representation
     * ======================================================== */

    /*
     * Python-style representation.
     *
     * Example:
     *     {1, 2, 3}
     *
     * Empty set:
     *     set()
     */
    std::string str() const {
        if (data_.empty()) {
            return "set()";
        }

        std::string result = "{";
        bool first = true;

        for (const auto& value : data_) {
            if (!first) {
                result += ", ";
            }

            result += value_to_string(value);
            first = false;
        }

        result += "}";

        return result;
    }


private:

    /* ========================================================
     * Value-to-string helper
     * ======================================================== */

    static std::string value_to_string(const T& value) {

        if constexpr (std::is_same_v<T, std::string>) {
            return "'" + value + "'";
        }
        else if constexpr (std::is_same_v<T, const char*>) {
            return "'" + std::string(value) + "'";
        }
        else if constexpr (std::is_same_v<T, bool>) {
            return value ? "True" : "False";
        }
        else if constexpr (std::is_arithmetic_v<T>) {
            return std::to_string(value);
        }
        else {
            std::ostringstream stream;
            stream << value;
            return stream.str();
        }
    }
};


/* ============================================================
 * Common type aliases
 * ============================================================ */

using PySetInt = PySet<int64_t>;

using PySetFloat = PySet<double>;

using PySetBool = PySet<bool>;

using PySetStr = PySet<std::string>;

} // namespace pythia_set

#endif // PYSET_HPP