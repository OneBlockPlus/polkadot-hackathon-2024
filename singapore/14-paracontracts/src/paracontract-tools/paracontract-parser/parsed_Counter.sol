// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ICrossChainBridge {
    function readValues(
        address currentContractAddress,
        address[] calldata contractAddresses,
        string[] calldata rpcUrls,
        string calldata variableName,
        string calldata functionName
    ) external;
}


contract SimpleCounter {
    function addNewParallelContract(address contractAddress, string memory rpcUrl) public {
        contractAddresses.push(contractAddress);
        rpcUrls.push(rpcUrl);
    }
    

function increment() public {
    ICrossChainBridge crossChainBridge = ICrossChainBridge(crossChainBridgeAddress);
    crossChainBridge.readValues(
        address(this),
        contractAddresses,
        rpcUrls,
        "count",
        "increment1"
    );
}


function increment1(
    uint256[] calldata counts,
    uint32[] calldata countVersions
) public {
    require(counts.length == countVersions.length, "Arrays must be of the same length");

    uint256 maxIndex = 0;
    uint256 currentcount = counts[maxIndex];
    uint32 currentcountVersion = countVersions[maxIndex];
    for (uint256 i = 1; i < countVersions.length; i++) {
        if (countVersions[i] > countVersions[maxIndex]) {
            maxIndex = i;
            currentcount = counts[maxIndex];
            currentcountVersion = countVersions[maxIndex];
        }
    }
    if (countVersion > countVersions[maxIndex]) {
        currentcount = count;
        currentcountVersion = countVersion;
    }

    count = currentcount + 1;
    countVersion = currentcountVersion + 1;
}

    constructor(address _crossChainBridgeAddress) {
        count = 0;
        countVersion = 0;
        crossChainBridgeAddress = _crossChainBridgeAddress;
    }

    address public crossChainBridgeAddress;

    address[] public contractAddresses;
    string[] public rpcUrls;
    
    uint256 public count;
    uint32 public countVersion;

    function getCurrentcount() public {
        ICrossChainBridge crossChainBridge = ICrossChainBridge(crossChainBridgeAddress);
        crossChainBridge.readValues(
            address(this),
            contractAddresses,
            rpcUrls,
            "count",
            "getCurrentcount1"
        );
    }

    event Getcount(uint256 count);

    function getCurrentcount1(
        uint256[] calldata counts,
        uint32[] calldata countVersions
    ) public {
        require(counts.length == countVersions.length, "Arrays must be of the same length");

        uint256 maxIndex = 0;
        uint256 currentcount = counts[maxIndex];
        uint32 currentcountVersion = countVersions[maxIndex];
        for (uint256 i = 1; i < countVersions.length; i++) {
            if (countVersions[i] > countVersions[maxIndex]) {
                maxIndex = i;
                currentcount = counts[maxIndex];
                currentcountVersion = countVersions[maxIndex];
            }
        }
        if (countVersion > countVersions[maxIndex]) {
            currentcount = count;
            currentcountVersion = countVersion;
        }

        emit Getcount(currentcount);
    }
    

    // Increment the counter
    
}