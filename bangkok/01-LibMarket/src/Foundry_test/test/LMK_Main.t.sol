// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {Counter} from "../src/LMK_Main.sol";

contract C2CPlatformTest is Test {
    C2CPlatform public c2cPlatform;

    function setUp() public {
        c2cPlatform = new C2CPlatform();
    }

    function testLockFunds() public {
        bytes32 hashLock = 0x948e39092107b1a48fb768814361f1ebad2143573f95f336bb78d28c1a9e0be3;
        uint timelock = block.timestamp + 3600;

        //c2cPlatform.lock{value: 1 ether}(hashLock, timelock, address(this));
        
        //assert.equal(uint(c2cPlatform.trades(0).status), uint(C2CPlatform.TradeStatus.Locked), "2");
    }

    function testConfirmReceipt() public {
        bytes32 preimage = 0xc23d89d4ba0f8b56a459710de4b44820d73e93736cfc0667f35cdd5142b70f0d;

        c2cPlatform.confirmReceipt(0, preimage);


        //assert.equal(uint(c2cPlatform.trades(0).status), uint(C2CPlatform.TradeStatus.Complete), "3");
    }
}

