/*
 * PYTHIA PySet Test Suite
 *
 * Tests the Python-compatible PySet runtime library.
 *
 * Owner: Jahnavi
 */

#include <iostream>
#include <cassert>
#include <string>
#include "../runtime/pyset.hpp"

using namespace pythia_set;

int main() {

    std::cout << "=== PySet Test Suite ===\n\n";


    // =========================================================
    // 1. Basic construction and add()
    // =========================================================

    std::cout << "Test 1: Construction and add()... ";

    PySet<int64_t> numbers;

    numbers.add(10);
    numbers.add(20);
    numbers.add(30);

    assert(numbers.len() == 3);
    assert(numbers.contains(10));
    assert(numbers.contains(20));
    assert(numbers.contains(30));

    std::cout << "PASS\n";


    // =========================================================
    // 2. Duplicate elements
    // =========================================================

    std::cout << "Test 2: Duplicate elements... ";

    numbers.add(20);
    numbers.add(20);
    numbers.add(30);

    // A set must contain unique elements.
    assert(numbers.len() == 3);

    std::cout << "PASS\n";


    // =========================================================
    // 3. remove()
    // =========================================================

    std::cout << "Test 3: remove()... ";

    numbers.remove(20);

    assert(!numbers.contains(20));
    assert(numbers.len() == 2);

    std::cout << "PASS\n";


    // =========================================================
    // 4. discard()
    // =========================================================

    std::cout << "Test 4: discard()... ";

    numbers.discard(999);  // Missing element should not throw.

    assert(numbers.len() == 2);

    numbers.discard(10);

    assert(!numbers.contains(10));
    assert(numbers.len() == 1);

    std::cout << "PASS\n";


    // =========================================================
    // 5. contains()
    // =========================================================

    std::cout << "Test 5: contains()... ";

    assert(numbers.contains(30));
    assert(!numbers.contains(100));

    std::cout << "PASS\n";


    // =========================================================
    // 6. empty() and clear()
    // =========================================================

    std::cout << "Test 6: empty() and clear()... ";

    assert(!numbers.empty());

    numbers.clear();

    assert(numbers.empty());
    assert(numbers.len() == 0);

    std::cout << "PASS\n";


    // =========================================================
    // 7. Initializer-list constructor
    // =========================================================

    std::cout << "Test 7: Initializer-list constructor... ";

    PySet<int64_t> a{1, 2, 3, 3, 4};

    assert(a.len() == 4);
    assert(a.contains(1));
    assert(a.contains(4));

    std::cout << "PASS\n";


    // =========================================================
    // 8. Union
    // =========================================================

    std::cout << "Test 8: union_set()... ";

    PySet<int64_t> b{3, 4, 5, 6};

    PySet<int64_t> union_result = a.union_set(b);

    assert(union_result.len() == 6);

    for (int64_t value : {1, 2, 3, 4, 5, 6}) {
        assert(union_result.contains(value));
    }

    std::cout << "PASS\n";


    // =========================================================
    // 9. Intersection
    // =========================================================

    std::cout << "Test 9: intersection()... ";

    PySet<int64_t> intersection_result = a.intersection(b);

    assert(intersection_result.len() == 2);
    assert(intersection_result.contains(3));
    assert(intersection_result.contains(4));

    std::cout << "PASS\n";


    // =========================================================
    // 10. Difference
    // =========================================================

    std::cout << "Test 10: difference()... ";

    PySet<int64_t> difference_result = a.difference(b);

    assert(difference_result.len() == 2);
    assert(difference_result.contains(1));
    assert(difference_result.contains(2));

    std::cout << "PASS\n";


    // =========================================================
    // 11. Symmetric difference
    // =========================================================

    std::cout << "Test 11: symmetric_difference()... ";

    PySet<int64_t> symmetric_result =
        a.symmetric_difference(b);

    assert(symmetric_result.len() == 4);

    assert(symmetric_result.contains(1));
    assert(symmetric_result.contains(2));
    assert(symmetric_result.contains(5));
    assert(symmetric_result.contains(6));

    assert(!symmetric_result.contains(3));
    assert(!symmetric_result.contains(4));

    std::cout << "PASS\n";


    // =========================================================
    // 12. Subset
    // =========================================================

    std::cout << "Test 12: issubset()... ";

    PySet<int64_t> small{3, 4};
    PySet<int64_t> large{1, 2, 3, 4, 5};

    assert(small.issubset(large));
    assert(!large.issubset(small));

    std::cout << "PASS\n";


    // =========================================================
    // 13. Superset
    // =========================================================

    std::cout << "Test 13: issuperset()... ";

    assert(large.issuperset(small));
    assert(!small.issuperset(large));

    std::cout << "PASS\n";


    // =========================================================
    // 14. Disjoint
    // =========================================================

    std::cout << "Test 14: isdisjoint()... ";

    PySet<int64_t> x{1, 2};
    PySet<int64_t> y{3, 4};
    PySet<int64_t> z{2, 5};

    assert(x.isdisjoint(y));
    assert(!x.isdisjoint(z));

    std::cout << "PASS\n";


    // =========================================================
    // 15. Copy
    // =========================================================

    std::cout << "Test 15: copy()... ";

    PySet<int64_t> copied = a.copy();

    assert(copied == a);

    copied.add(100);

    assert(copied != a);
    assert(!a.contains(100));

    std::cout << "PASS\n";


    // =========================================================
    // 16. Comparison
    // =========================================================

    std::cout << "Test 16: comparison operators... ";

    PySet<int64_t> c{1, 2, 3};
    PySet<int64_t> d{1, 2, 3};
    PySet<int64_t> e{1, 2, 3, 4};

    assert(c == d);
    assert(c != e);

    assert(c <= e);
    assert(c < e);

    assert(e >= c);
    assert(e > c);

    std::cout << "PASS\n";


    // =========================================================
    // 17. to_vector()
    // =========================================================

    std::cout << "Test 17: to_vector()... ";

    std::vector<int64_t> values = a.to_vector();

    assert(values.size() == 4);

    for (int64_t value : values) {
        assert(a.contains(value));
    }

    std::cout << "PASS\n";


    // =========================================================
    // 18. String set
    // =========================================================

    std::cout << "Test 18: String set... ";

    PySet<std::string> words{
        "apple",
        "banana",
        "orange"
    };

    assert(words.len() == 3);
    assert(words.contains("apple"));
    assert(!words.contains("grape"));

    std::string representation = words.str();

    assert(!representation.empty());

    std::cout << "PASS\n";


    // =========================================================
    // 19. Empty-set representation
    // =========================================================

    std::cout << "Test 19: Empty-set representation... ";

    PySet<int64_t> empty_set;

    assert(empty_set.str() == "set()");

    std::cout << "PASS\n";


    // =========================================================
    // 20. pop()
    // =========================================================

    std::cout << "Test 20: pop()... ";

    PySet<int64_t> pop_set{100, 200, 300};

    size_t before = pop_set.size();

    int64_t popped = pop_set.pop();

    assert(pop_set.size() == before - 1);
    assert(!pop_set.contains(popped));

    std::cout << "PASS\n";


    // =========================================================
    // Final result
    // =========================================================

    std::cout << "\n=================================\n";
    std::cout << "ALL PYSET TESTS PASSED!\n";
    std::cout << "=================================\n";

    return 0;
}