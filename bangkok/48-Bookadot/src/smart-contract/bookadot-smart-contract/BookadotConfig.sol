// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.4 <0.9.0;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

contract BookadotConfig is Ownable {
    uint256 public fee; // fee percentage 5% -> 500, 0.1% -> 10
    uint256 public payoutDelayTime; // payout delay time in seconds
    address public bookadotTreasury;
    address public bookadotSigner;
    mapping(address => bool) public supportedTokens;

    event UpdatedFee(uint256 oldFee, uint256 newFee);
    event UpdatedPayoutDelayTime(uint256 oldPayoutDelayTime, uint256 newPayoutDelayTime);
    event UpdatedTreasury(address oldTreasury, address newTreasury);
    event UpdatedSigner(address signer);
    event AddedSupportedToken(address token);
    event RemovedSupportedToken(address token);

    constructor(
        uint256 _fee,
        uint256 _payoutDelayTime,
        address _treasury,
        address _defaultSigner,
        address[] memory _tokens
    ) {
        fee = _fee;
        bookadotTreasury = _treasury;
        payoutDelayTime = _payoutDelayTime;
        bookadotSigner = _defaultSigner;

        for (uint256 i = 0; i < _tokens.length; i++) {
            supportedTokens[_tokens[i]] = true;
        }
    }

    function updateFee(uint256 _fee) external onlyOwner {
        require(_fee <= 2000, "Config: Fee must be between 0 and 2000");
        emit UpdatedFee(fee, _fee);
        fee = _fee;
    }

    function updatePayoutDelayTime(uint256 _payoutDelayTime) external onlyOwner {
        uint256 oldPayoutDelayTime = payoutDelayTime;
        payoutDelayTime = _payoutDelayTime;
        emit UpdatedPayoutDelayTime(oldPayoutDelayTime, _payoutDelayTime);
    }

    function addSupportedToken(address _token) external onlyOwner {
        require(_token != address(0), "Config: token is zero address");
        supportedTokens[_token] = true;
        emit AddedSupportedToken(_token);
    }

    function removeSupportedToken(address _token) external onlyOwner {
        require(_token != address(0), "Config: token is zero address");
        supportedTokens[_token] = false;
        emit RemovedSupportedToken(_token);
    }

    function updateTreasury(address _treasury) external onlyOwner {
        require(_treasury != address(0), "Config: treasury is zero address");
        address oldTreasury = bookadotTreasury;
        bookadotTreasury = _treasury;
        emit UpdatedTreasury(oldTreasury, _treasury);
    }

    function updateBookadotSigner(address _signer) external onlyOwner {
        require(_signer != address(0), "Config: signer is zero address");
        require(_signer != bookadotSigner, "Config: value unchanged");

        bookadotSigner = _signer;
        emit UpdatedSigner(_signer);
    }
}
