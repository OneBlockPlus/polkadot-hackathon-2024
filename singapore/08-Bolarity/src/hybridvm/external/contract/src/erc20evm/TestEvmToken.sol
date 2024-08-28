// Modified by 2024 HybridVM

// Copyright (C) 2021 Cycan Technologies
// SPDX-License-Identifier: Apache-2.0

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// 	http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Modified by Alex Wang

pragma solidity <=0.8.22;

import  "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TestEvmToken is ERC20 {

    constructor () ERC20("TestEvmToken", "TET") public {
        _mint(msg.sender, 1000000000000*1e18);
    }
	
	function _callHybridVM(string memory input) internal returns (string memory) {
		uint inputLen = bytes(input).length + 32;  //First 32bytes is string len prefix
		bytes memory outbytes = new bytes(1024);
		uint gasdata = gasleft();
		assembly {
			if iszero(delegatecall(gasdata, 0x64, input, inputLen, outbytes, 1024)) {
				revert(0,0)
			}
		}
		return string(outbytes);
	}
	
	function evmCallWasm(bytes20 bob, uint256 value, bytes20 contractid) public returns (string memory) {
		
		bytes memory input1 = bytes('{"VM":"wasm", "Account":"0x');
		input1 = _bytesConcat(input1, bytes(_bytes20tohex(contractid)));
		input1 = _bytesConcat(input1, bytes('", "Fun": "transfer", "InputType": ["accountid","u128"], "InputValue": ["0x'));
		input1 = _bytesConcat(input1, bytes(_bytes20tohex(bob)));
		input1 = _bytesConcat(input1, bytes('","'));
		input1 = _bytesConcat(input1, bytes(_uint2str10(value)));
		input1 = _bytesConcat(input1, bytes('"], "OutputType":[["enum"],["2"],["0","3"],["enum"],["5"],["0","0","6"],["string"]]}'));
		
		//string input = '{"VM":"wasm", "Account":"0x' + _bytes32tohex(contractid) + '", "Fun": "transfer", "InputType": ["accountid","u128"], 
		//"InputValue": ["0x' + _bytes32tohex(bob) + '","'+ _uint2str10(value) + '",], "OutputType":[["enum"],["0","2"],["0"]]}';
		
		return _callHybridVM(string(input1));
	}
	
	function evmCallWasmBalance(bytes20 bob, bytes20 contractid) public returns (uint) {
		
		bytes memory input1 = bytes('{"VM":"wasm", "Account":"0x');
		input1 = _bytesConcat(input1, bytes(_bytes20tohex(contractid)));
		input1 = _bytesConcat(input1, bytes('", "Fun": "balance_of", "InputType": ["accountid"], "InputValue": ["0x'));
		input1 = _bytesConcat(input1, bytes(_bytes20tohex(bob)));
		input1 = _bytesConcat(input1, bytes('"], "OutputType":[["u128"]]}'));
		
		//string input = '{"VM":"wasm", "Account":"0x' + _bytes32tohex(contractid) + '", "Fun": "balance_of", "InputType": ["accountid"], 
		//"InputValue": ["0x' + _bytes32tohex(bob)], "OutputType":[["u128"]]}';
		
		string memory result = _callHybridVM(string(input1));
		return getResultBalance(result);
	}
	
	function evmCallWasmProxy(string memory callData) public returns (string memory) {
		return _callHybridVM(callData);
	}
	
	function echo(string memory p,  uint[] memory u) public returns (string memory, uint[] memory) {
		return (p, u);
	}

	function _bytes20tohex(bytes20 b) internal pure returns (string memory) {
		bytes memory bytesString = new bytes(40);
		for (uint i = 0; i < 20; i++) {
			bytesString[i*2] = _byte2hex(uint8(b[i]) / 16);
			bytesString[i*2 + 1] = _byte2hex(uint8(b[i]) % 16);
		}
		return string(bytesString);
	}
	
	function _bytes32tohex(bytes32 b) internal pure returns (string memory) {
		bytes memory bytesString = new bytes(64);
		for (uint i = 0; i< b.length; i++) {
			bytesString[i*2] = _byte2hex(uint8(b[i]) / 16);
			bytesString[i*2 + 1] = _byte2hex(uint8(b[i]) % 16);
		}
		return string(bytesString);
	}
	
	function _byte2hex(uint8 b) internal pure returns (bytes1) {
		require(b < 16, "byte2hex -- b must < 16");
		if(b < 10){
			return  bytes1(b + 0x30);
		}
		else {
			return bytes1(b - 9 + 0x60 );
		}
	}
	
	function _uint2str10(uint v) internal pure returns (string memory) {
		if( v == 0) return "0";
		uint v1 = v;
        uint strlen = 0;
        while(v1 != 0) {
			v1 /= 10;
			strlen++;
		}
		bytes memory str = new bytes(strlen);
	    while(v != 0 && strlen > 0) {
		    strlen--;
			str[strlen] = bytes1(uint8(v%10) + 0x30);
			v /= 10;
		}
		
		return string(str);
	}
	
	 function _bytesConcat(bytes memory _a, bytes memory _b) internal pure returns (bytes memory){
		 bytes memory ret = new bytes(_a.length + _b.length);
		 for(uint i=0; i<_a.length; i++) ret[i] = _a[i];
		 for(uint i=0; i< _b.length; i++) ret[i+_a.length] = _b[i];
		 
		 return ret;
	 }
	
	function searchSubString(string memory _m, string memory _sub) internal pure returns (uint) {   // 0: not fund 
		bytes memory a = bytes(_m);
		bytes memory b = bytes(_sub);
		for(uint i = 0; i < a.length; i ++){
			if(b.length > a.length - i) return 0;
			for(uint j=0; j<b.length; j++) {
				if(b[j] != a[j+i]) break;
				if(j == b.length - 1) return i+1;
			}
		}
		return 0;
	}
	
	function getResultBalance(string memory _result) internal pure returns (uint) {
		uint st = searchSubString(_result, '"ReturnValue":["');		// {"Result":0,"Message":"","ReturnValue":["123456"]}
		require(st>0, "Call Result error!");
		bytes memory a = bytes(_result);
		uint result = 0;
		uint8 b = 0;
		for(uint i = st-1+16; i < a.length-3; i ++){
			b = uint8(a[i]);
			require( b >= 48 && b <= 57, "Result balance include no number string!");
			result = result*10 + (b - 48);
		}
		return result;
	}
}
