// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "./Types.sol";

library EnumerableUTXOMap {
    using EnumerableSet for EnumerableSet.Bytes32Set;
    using Types for Types.UTXO;
    using Types for Types.Token;

    /**
     * @dev Query for a nonexistent map key.
     */
    error EnumerableMapNonexistentKey(bytes32 key);

    struct Bytes32ToUTXOMap {
        EnumerableSet.Bytes32Set _keys;
        mapping(bytes32 key => Types.UTXO) _values;
    }

    /**
     * @dev Adds a key-value pair to a map, or updates the value for an existing
     * key. O(1).
     *
     * Returns true if the key was added to the map, that is if it was not
     * already present.
     */
    function set(
        Bytes32ToUTXOMap storage map,
        bytes32 key,
        Types.UTXO memory value
    ) internal returns (bool) {
        map._values[key] = value;
        return map._keys.add(key);
    }

    /**
     * @dev Removes a key-value pair from a map. O(1).
     *
     * Returns true and value if the key was removed from the map, that is if it was present.
     */
    function remove(
        Bytes32ToUTXOMap storage map,
        bytes32 key
    ) internal returns (bool, Types.UTXO memory) {
        Types.UTXO memory value = map._values[key];
        delete map._values[key];
        return (map._keys.remove(key), value);
    }

    /**
     * @dev Returns true if the key is in the map. O(1).
     */
    function contains(
        Bytes32ToUTXOMap storage map,
        bytes32 key
    ) internal view returns (bool) {
        return map._keys.contains(key);
    }

    /**
     * @dev Returns the number of key-value pairs in the map. O(1).
     */
    function length(
        Bytes32ToUTXOMap storage map
    ) internal view returns (uint256) {
        return map._keys.length();
    }

    /**
     * @dev Returns the key-value pair stored at position `index` in the map. O(1).
     *
     * Note that there are no guarantees on the ordering of entries inside the
     * array, and it may change when more entries are added or removed.
     *
     * Requirements:
     *
     * - `index` must be strictly less than {length}.
     */
    function at(
        Bytes32ToUTXOMap storage map,
        uint256 index
    ) internal view returns (bytes32, Types.UTXO memory) {
        bytes32 key = map._keys.at(index);
        return (key, map._values[key]);
    }

    /**
     * @dev Tries to returns the value associated with `key`. O(1).
     * Does not revert if `key` is not in the map.
     */
    function tryGet(
        Bytes32ToUTXOMap storage map,
        bytes32 key
    ) internal view returns (bool, Types.UTXO memory) {
        Types.UTXO memory value = map._values[key];
        if (value.amount == 0) {
            return (
                contains(map, key),
                Types.UTXO(bytes32(0), bytes32(0), bytes32(0), 0, 0)
            );
        } else {
            return (true, value);
        }
    }

    /**
     * @dev Returns the value associated with `key`. O(1).
     *
     * Requirements:
     *
     * - `key` must be in the map.
     */
    function get(
        Bytes32ToUTXOMap storage map,
        bytes32 key
    ) internal view returns (Types.UTXO memory) {
        Types.UTXO memory value = map._values[key];
        if (value.amount == 0 && !contains(map, key)) {
            revert EnumerableMapNonexistentKey(key);
        }
        return value;
    }

    struct Bytes32ToTokenMap {
        EnumerableSet.Bytes32Set _keys;
        mapping(bytes32 key => Types.Token) _values;
    }

    /**
     * @dev Adds a key-value pair to a map, or updates the value for an existing
     * key. O(1).
     *
     * Returns true if the key was added to the map, that is if it was not
     * already present.
     */
    function set(
        Bytes32ToTokenMap storage map,
        bytes32 key,
        Types.Token memory value
    ) internal returns (bool) {
        map._values[key] = value;
        return map._keys.add(key);
    }

    /**
     * @dev Removes a key-value pair from a map. O(1).
     *
     * Returns true if the key was removed from the map, that is if it was present.
     */
    function remove(
        Bytes32ToTokenMap storage map,
        bytes32 key
    ) internal returns (bool) {
        delete map._values[key];
        return map._keys.remove(key);
    }

    /**
     * @dev Returns true if the key is in the map. O(1).
     */
    function contains(
        Bytes32ToTokenMap storage map,
        bytes32 key
    ) internal view returns (bool) {
        return map._keys.contains(key);
    }

    /**
     * @dev Returns the number of key-value pairs in the map. O(1).
     */
    function length(
        Bytes32ToTokenMap storage map
    ) internal view returns (uint256) {
        return map._keys.length();
    }

    /**
     * @dev Returns the key-value pair stored at position `index` in the map. O(1).
     *
     * Note that there are no guarantees on the ordering of entries inside the
     * array, and it may change when more entries are added or removed.
     *
     * Requirements:
     *
     * - `index` must be strictly less than {length}.
     */
    function at(
        Bytes32ToTokenMap storage map,
        uint256 index
    ) internal view returns (bytes32, Types.Token memory) {
        bytes32 key = map._keys.at(index);
        return (key, map._values[key]);
    }

    /**
     * @dev Tries to returns the value associated with `key`. O(1).
     * Does not revert if `key` is not in the map.
     */
    function tryGet(
        Bytes32ToTokenMap storage map,
        bytes32 key
    ) internal view returns (bool, Types.Token memory) {
        Types.Token memory value = map._values[key];
        if (value.metadata.totalSupply == 0) {
            return (
                contains(map, key),
                Types.Token(
                    Types.Metadata(bytes8(0), "", bytes32(0), 0, 0, 0),
                    0
                )
            );
        } else {
            return (true, value);
        }
    }

    /**
     * @dev Returns the value associated with `key`. O(1).
     *
     * Requirements:
     *
     * - `key` must be in the map.
     */
    function get(
        Bytes32ToTokenMap storage map,
        bytes32 key
    ) internal view returns (Types.Token memory) {
        Types.Token memory value = map._values[key];
        if (value.metadata.totalSupply == 0 && !contains(map, key)) {
            revert EnumerableMapNonexistentKey(key);
        }
        return value;
    }
}
