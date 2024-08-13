// SPDX-License-Identifier: LibMarket
pragma solidity ^0.8.20;

import "./Owner_Pausable.sol"  // 定义owner 用来暂停或者开放合约 


contract HashLock is Pausable {
    struct Lock {
        uint256 amount;
        bytes32 hashLock;
        uint256 timelock;
        address payable sender;
        address payable receiver;
        bool withdrawn;
        bool refunded;
        bytes32 preimage;
    }

    mapping(bytes32 => Lock) public locks;

    event Locked(bytes32 indexed lockId, address indexed sender, address indexed receiver, uint256 amount, bytes32 hashLock, uint256 timelock);
    event Withdrawn(bytes32 indexed lockId, bytes32 preimage);
    event Refunded(bytes32 indexed lockId);

    function lock(bytes32 _hashLock, uint256 _timelock, address payable _receiver) internal whenNotPaused returns (bytes32 lockId) {
        require(msg.value > 0, "Amount must be greater than 0");
        require(_timelock > block.timestamp, "Timelock must be in the future");

        lockId = keccak256(abi.encodePacked(msg.sender, _receiver, msg.value, _hashLock, _timelock));
        require(locks[lockId].sender == address(0), "Lock already exists");

        locks[lockId] = Lock({
            amount: msg.value,
            hashLock: _hashLock,
            timelock: _timelock,
            sender: payable(msg.sender),
            receiver: _receiver,
            withdrawn: false,
            refunded: false,
            preimage: bytes32(0)
        });

        emit Locked(lockId, msg.sender, _receiver, msg.value, _hashLock, _timelock);
    }

    function withdraw(bytes32 _lockId, bytes32 _preimage) external whenNotPaused {
        Lock storage lock = locks[_lockId];

        require(lock.amount > 0, "Lock does not exist");
        require(lock.receiver == msg.sender, "Not the receiver");
        require(!lock.withdrawn, "Already withdrawn");
        require(!lock.refunded, "Already refunded");
        require(keccak256(abi.encodePacked(_preimage)) == lock.hashLock, "Invalid preimage");

        lock.withdrawn = true;
        lock.preimage = _preimage;
        lock.receiver.transfer(lock.amount);

        emit Withdrawn(_lockId, _preimage);
    }

    function refund(bytes32 _lockId) external whenNotPaused {
        Lock storage lock = locks[_lockId];

        require(lock.amount > 0, "Lock does not exist");
        require(lock.sender == msg.sender, "Not the sender");
        require(!lock.withdrawn, "Already withdrawn");
        require(!lock.refunded, "Already refunded");
        require(block.timestamp >= lock.timelock, "Timelock not yet passed");

        lock.refunded = true;
        lock.sender.transfer(lock.amount);

        emit Refunded(_lockId);
    }
}



// 主要合约
contract C2CPlatform is HashLock {

    // 定义买卖双方的状态
    enum TradeStatus { Pending, Locked, OrderInProgress, Complete, Cancelled }

    struct Trade {
        address payable seller;
        address payable buyer;
        uint amount;
        TradeStatus status;
        bytes32 hashLock;
        uint256 timelock;
    }

    // 交易ID到交易详情的映射
    mapping(uint => Trade) public trades;
    uint public tradeCounter;

    event TradeCreated(uint tradeId, address seller, address buyer, uint amount, bytes32 hashLock, uint256 timelock);
    event TradeLocked(uint tradeId);
    event TradeConfirmed(uint tradeId);
    event TradeCancelled(uint tradeId);

    event LogPreimage(bytes32 preimage);


    // 创建新交易
    function createTrade(address payable _seller, bytes32 _hashLock, uint256 _timelock) external payable whenNotPaused {
        require(msg.value > 0, "Amount must be greater than 0");
        require(_timelock > block.timestamp, "Timelock must be in the future");

        bytes32 lockId = lock(_hashLock, _timelock, _seller);

        trades[tradeCounter] = Trade({
            seller: _seller,
            buyer: payable(msg.sender),
            amount: msg.value,
            status: TradeStatus.Pending,
            hashLock: _hashLock,
            timelock: _timelock
        });

        emit TradeCreated(tradeCounter, _seller, msg.sender, msg.value, _hashLock, _timelock);
        tradeCounter++;
    }


    // 锁定资金
    function lockFunds(uint _tradeId) external whenNotPaused {
        Trade storage trade = trades[_tradeId];
        require(msg.sender == trade.buyer, "Only buyer can lock funds");
        require(trade.status == TradeStatus.Pending, "Trade is not in pending state");

        trade.status = TradeStatus.Locked;
        emit TradeLocked(_tradeId);
    }


    // 卖家确认发货
    function confirmShipment(uint _tradeId) external whenNotPaused {
        Trade storage trade = trades[_tradeId];
        require(msg.sender == trade.seller, "Only seller can confirm shipment");
        require(trade.status == TradeStatus.Locked, "Funds are not locked");

        trade.status = TradeStatus.OrderInProgress;
        emit TradeConfirmed(_tradeId);
    }
    

    // 买家确认收货
    function confirmReceipt(uint _tradeId, bytes32 _preimage) external whenNotPaused {
        Trade storage trade = trades[_tradeId];
        require(msg.sender == trade.buyer, "Only buyer can confirm receipt");
        require(trade.status == TradeStatus.OrderInProgress, "Funds are not in order progress state");
        require(keccak256(abi.encodePacked(_preimage)) == trade.hashLock, "Invalid preimage");

        trade.status = TradeStatus.Complete;
        trade.seller.transfer(trade.amount);
        emit TradeConfirmed(_tradeId);

        emit LogPreimage(_preimage);
    }


    // 取消交易并退还资金
    function cancelTrade(uint _tradeId) external whenNotPaused {
        Trade storage trade = trades[_tradeId];
        require(msg.sender == trade.buyer, "Only buyer can cancel trade");
        require(trade.status == TradeStatus.Pending || trade.status == TradeStatus.Locked, "Cannot cancel trade in current state");

        if (trade.status == TradeStatus.Locked) {
            trade.status = TradeStatus.Cancelled;
            trade.buyer.transfer(trade.amount);
        } else if (trade.status == TradeStatus.Pending) {
            trade.status = TradeStatus.Cancelled;
        }

        emit TradeCancelled(_tradeId);
    }
}




// 用于后期更新(暂定)
contract Create2Factory {
    event Deploy(address add);

    function deploy(uint _salt) external {
        C2CPlatform _contract = new C2CPlatform{salt: bytes32(_salt)}();
        emit Deploy(address(_contract));
    }

    function getAddress(bytes memory bytecode, uint _salt) public view returns(address) {
        bytes32 hash = keccak256(abi.encodePacked(bytes1(0xff), address(this), _salt, keccak256(bytecode)));
        return address(uint160(uint(hash)));
    }

    function getBytecode(address _owner) public pure returns (bytes memory){
        bytes memory bytecode = type(C2CPlatform).creationCode;
        return abi.encodePacked(bytecode, abi.encode(_owner));
    }
}