// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.24;

import {AccessIdentities} from "../../contracts/AccessIdentities.sol";
import "forge-std/src/Script.sol";

contract AddIdentity is Script {
    uint256 operatorPrivateKey;
    AccessIdentities accessIdentities;

    // add identity params
    string prefix;
    string digest;

    function setUp() public {
        operatorPrivateKey = vm.envUint("PRIVATE_KEY");
        accessIdentities = AccessIdentities(0x4Cd640e4177a5d86B06BDB147E7efECFf3E478b3);

        prefix = "ECDSA";
        digest = "sadasdsadsadsa";
    }

    function run() public {
        vm.startBroadcast(operatorPrivateKey);
        accessIdentities.addIdentity(prefix, digest);
        vm.stopBroadcast();
    }
}
