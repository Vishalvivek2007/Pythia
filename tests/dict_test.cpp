#include <iostream>
#include <cassert>
#include "../runtime/pydict.hpp"

using namespace pythia_dict;

int main() {
    std::cout << "=== Testing PyDict Dictionary Library ===" << std::endl;

    /* Test 1: Basic integer-to-integer dictionary */
    std::cout << "\n[Test 1] Int->Int Dictionary" << std::endl;
    PyDictIntInt dict_ii;
    dict_ii[1] = 100;
    dict_ii[2] = 200;
    dict_ii[3] = 300;
    
    assert(dict_ii.size() == 3);
    assert(dict_ii[1] == 100);
    assert(dict_ii[2] == 200);
    std::cout << "✓ Basic insertion and access works" << std::endl;
    std::cout << "  Dict: " << dict_ii.str() << std::endl;

    /* Test 2: Get with default */
    std::cout << "\n[Test 2] Get with default value" << std::endl;
    assert(dict_ii.get(1) == 100);
    assert(dict_ii.get(999, -1) == -1);
    std::cout << "✓ get() with default works" << std::endl;

    /* Test 3: Contains check */
    std::cout << "\n[Test 3] Contains check" << std::endl;
    assert(dict_ii.contains(1) == true);
    assert(dict_ii.contains(999) == false);
    std::cout << "✓ contains() works" << std::endl;

    /* Test 4: Keys, values, items */
    std::cout << "\n[Test 4] Keys, values, items" << std::endl;
    auto keys = dict_ii.keys();
    auto values = dict_ii.values();
    auto items = dict_ii.items();
    assert(keys.size() == 3);
    assert(values.size() == 3);
    assert(items.size() == 3);
    std::cout << "✓ keys(), values(), items() work" << std::endl;
    std::cout << "  Keys count: " << keys.size() << std::endl;
    std::cout << "  Values count: " << values.size() << std::endl;

    /* Test 5: Pop operation */
    std::cout << "\n[Test 5] Pop operation" << std::endl;
    int64_t popped = dict_ii.pop(2);
    assert(popped == 200);
    assert(dict_ii.size() == 2);
    assert(dict_ii.contains(2) == false);
    std::cout << "✓ pop() removes and returns value" << std::endl;

    /* Test 6: Pop with default */
    std::cout << "\n[Test 6] Pop with default" << std::endl;
    int64_t pop_default = dict_ii.pop(999, -1);
    assert(pop_default == -1);
    std::cout << "✓ pop() with default for missing key works" << std::endl;

    /* Test 7: Remove */
    std::cout << "\n[Test 7] Remove operation" << std::endl;
    bool removed = dict_ii.remove(1);
    assert(removed == true);
    removed = dict_ii.remove(1);  // Already removed
    assert(removed == false);
    std::cout << "✓ remove() works correctly" << std::endl;

    /* Test 8: String keys dictionary */
    std::cout << "\n[Test 8] String->String Dictionary" << std::endl;
    PyDictStrStr dict_ss;
    dict_ss["name"] = "Alice";
    dict_ss["city"] = "NYC";
    dict_ss["country"] = "USA";
    assert(dict_ss.size() == 3);
    assert(dict_ss["name"] == "Alice");
    std::cout << "✓ String dictionaries work" << std::endl;
    std::cout << "  Dict: " << dict_ss.str() << std::endl;

    /* Test 9: String keys with int values */
    std::cout << "\n[Test 9] String->Int Dictionary" << std::endl;
    PyDictStrInt dict_si;
    dict_si["age"] = 25;
    dict_si["year"] = 2026;
    dict_si["score"] = 95;
    assert(dict_si["age"] == 25);
    std::cout << "✓ Mixed type dictionaries work" << std::endl;
    std::cout << "  Dict: " << dict_si.str() << std::endl;

    /* Test 10: Update operation */
    std::cout << "\n[Test 10] Update operation" << std::endl;
    PyDictStrStr dict_update;
    dict_update["a"] = "1";
    dict_update["b"] = "2";
    PyDictStrStr dict_update2;
    dict_update2["b"] = "20";
    dict_update2["c"] = "30";
    dict_update.update(dict_update2);
    assert(dict_update.size() == 3);
    assert(dict_update["b"] == "20");
    assert(dict_update["c"] == "30");
    std::cout << "✓ update() merges dictionaries" << std::endl;

    /* Test 11: Setdefault */
    std::cout << "\n[Test 11] Setdefault operation" << std::endl;
    PyDictStrInt dict_sd;
    dict_sd.setdefault("key1", 10);
    dict_sd.setdefault("key1", 99);  // Should not overwrite
    assert(dict_sd["key1"] == 10);
    dict_sd.setdefault("key2", 20);
    assert(dict_sd["key2"] == 20);
    std::cout << "✓ setdefault() works" << std::endl;

    /* Test 12: Clear operation */
    std::cout << "\n[Test 12] Clear operation" << std::endl;
    PyDictIntInt dict_clear;
    dict_clear[1] = 10;
    dict_clear[2] = 20;
    assert(dict_clear.size() == 2);
    dict_clear.clear();
    assert(dict_clear.size() == 0);
    assert(dict_clear.empty() == true);
    std::cout << "✓ clear() empties dictionary" << std::endl;

    /* Test 13: Copy */
    std::cout << "\n[Test 13] Copy operation" << std::endl;
    PyDictIntInt dict_orig;
    dict_orig[1] = 100;
    dict_orig[2] = 200;
    PyDictIntInt dict_copied = dict_orig.copy();
    assert(dict_copied.size() == dict_orig.size());
    assert(dict_copied[1] == 100);
    dict_copied[3] = 300;
    assert(dict_orig.size() == 2);  // Original unchanged
    assert(dict_copied.size() == 3);
    std::cout << "✓ copy() creates independent copy" << std::endl;

    /* Test 14: Equality comparison */
    std::cout << "\n[Test 14] Equality comparison" << std::endl;
    PyDictIntInt d1 = {{{1, 10}, {2, 20}}};
    PyDictIntInt d2 = {{{1, 10}, {2, 20}}};
    PyDictIntInt d3 = {{{1, 10}, {2, 30}}};
    assert(d1 == d2);
    assert(d1 != d3);
    std::cout << "✓ Equality operators work" << std::endl;

    /* Test 15: Iteration */
    std::cout << "\n[Test 15] Iteration over dictionary" << std::endl;
    PyDictIntInt dict_iter;
    dict_iter[10] = 100;
    dict_iter[20] = 200;
    dict_iter[30] = 300;
    int count = 0;
    for (const auto& [k, v] : dict_iter) {
        std::cout << "  [" << k << "] = " << v << std::endl;
        count++;
    }
    assert(count == 3);
    std::cout << "✓ Iteration with range-for works" << std::endl;

    /* Test 16: KeyError on missing key with at() */
    std::cout << "\n[Test 16] KeyError handling" << std::endl;
    try {
        dict_ii.at(9999);
        assert(false && "Should have thrown KeyError");
    } catch (const PyKeyError& e) {
        std::cout << "✓ KeyError thrown: " << e.what() << std::endl;
    }

    /* Test 17: Initializer list construction */
    std::cout << "\n[Test 17] Initializer list construction" << std::endl;
    PyDictStrInt dict_init = {
        {"apple", 5},
        {"banana", 3},
        {"orange", 7}
    };
    assert(dict_init.size() == 3);
    assert(dict_init["apple"] == 5);
    std::cout << "✓ Initializer list construction works" << std::endl;

    /* Test 18: Float keys and values */
    std::cout << "\n[Test 18] Float->Float Dictionary" << std::endl;
    PyDictFloatFloat dict_ff;
    dict_ff[1.5] = 2.5;
    dict_ff[3.14] = 2.71;
    assert(dict_ff.size() == 2);
    std::cout << "✓ Float dictionaries work" << std::endl;
    std::cout << "  Dict: " << dict_ff.str() << std::endl;

    /* Test 19: Length method */
    std::cout << "\n[Test 19] Length method" << std::endl;
    PyDictIntInt dict_len;
    assert(dict_len.len() == 0);
    dict_len[1] = 10;
    dict_len[2] = 20;
    dict_len[3] = 30;
    assert(dict_len.len() == 3);
    std::cout << "✓ len() returns correct size as int64_t" << std::endl;

    /* Test 20: Insert operation */
    std::cout << "\n[Test 20] Insert operation" << std::endl;
    PyDictIntInt dict_insert;
    dict_insert.insert(1, 100);
    dict_insert.insert(2, 200);
    assert(dict_insert[1] == 100);
    std::cout << "✓ insert() method works" << std::endl;

    std::cout << "\n=== All tests passed! ===" << std::endl;
    return 0;
}
