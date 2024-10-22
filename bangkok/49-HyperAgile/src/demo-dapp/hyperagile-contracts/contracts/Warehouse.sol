// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

import "./lib/Randomness.sol";
import {RandomnessConsumer} from "./lib/RandomnessConsumer.sol";

import "./interfaces/Enums.sol";

import "./interfaces/IShop.sol";
import "./interfaces/IProducts.sol";

error NotARobot();
error NotAnOwner();

contract Warehouse is RandomnessConsumer {

	Randomness public randomness = Randomness(0x0000000000000000000000000000000000000809);

    uint64 public FULFILLMENT_GAS_LIMIT = 100000;
    uint256 public MIN_FEE = FULFILLMENT_GAS_LIMIT * 150 gwei; 
    uint32 public VRF_BLOCKS_DELAY = MIN_VRF_BLOCKS_DELAY;
    bytes32 public SALT_PREFIX = "ROBOT_ID";

	address _owner;

	enum Activity {
		Picking, Packing, Delivering
	}

	IShop Shop;
	IProducts Products;

	mapping (address => bool) _robotApproval;
	mapping (uint256 => Activity) _requestToActivity;
	mapping (uint256 => string) _requestToOrder;

	event WarehouseActivity(string orderId, Enums.OrderStatus status);
	event AssingRobot(string orderId, Activity activity, uint256 robotId);
	event RequestRobotId(string orderId, uint256 requestId);
	event ActivityVerifier(string orderId, Activity activity, address indexed verifier);

	constructor(address shop, address products) RandomnessConsumer() {
		_owner = msg.sender;
		Shop = IShop(shop);
		Products = IProducts(products);
	}

	function setRobot(address robot) external {
		require(msg.sender == _owner, 'Not an Owner');
		_robotApproval[robot] = true;
	}

	function processOrder(string memory orderId) onlyOwner external {
		Shop.updateOrderStatus(orderId, Enums.OrderStatus.Processing);

		emit WarehouseActivity(orderId, Enums.OrderStatus.Processing);
	}

	function pickOrder(string memory orderId, address verifier) onlyRobot external {
		Shop.updateOrderStatus(orderId, Enums.OrderStatus.Picked);

		emit WarehouseActivity(orderId, Enums.OrderStatus.Picked);
		emit ActivityVerifier(orderId, Activity.Picking, verifier);
	} 

	function packOrder(string memory orderId, address verifier) onlyRobot external {
		Shop.updateOrderStatus(orderId, Enums.OrderStatus.Packed);

		emit WarehouseActivity(orderId, Enums.OrderStatus.Packed);
		emit ActivityVerifier(orderId, Activity.Packing, verifier);
	}

	function deliverOrder(string memory orderId, address verifier) onlyRobot external {
		Shop.updateOrderStatus(orderId, Enums.OrderStatus.Delivered);

		Products.mintProduct(Shop.getOrderProductId(orderId), Shop.getOrderCustomer(orderId));

		emit WarehouseActivity(orderId, Enums.OrderStatus.Delivered);
		emit ActivityVerifier(orderId, Activity.Delivering, verifier);
	}

	function deposit() public payable {
        require(msg.value >= randomness.requiredDeposit(), "Low amount");
    }

	function generateRobotId(string memory orderId, Activity activityType) onlyOwner external payable returns(uint256) {
		require(msg.value >= MIN_FEE, "Low amount");

        uint256 requestId = randomness.requestLocalVRFRandomWords(
            msg.sender, // Refund address
            msg.value, // Fulfillment fee
            FULFILLMENT_GAS_LIMIT, // Gas limit for the fulfillment
            SALT_PREFIX ^ bytes32(abi.encode(orderId)), // A salt to generate unique results
            1, // Number of random words
            VRF_BLOCKS_DELAY // Delay before request can be fulfilled
        );

		_requestToActivity[requestId] = activityType;
		_requestToOrder[requestId] = orderId;

		emit RequestRobotId(orderId, requestId);

		return requestId;
	}

	function fulfillRequest(uint256 requestId) onlyOwner external {
		Randomness.RequestStatus status = randomness.getRequestStatus(requestId);
		require(uint8(status) == 2, "Request is not ready");
        randomness.fulfillRequest(requestId);
    }

    function fulfillRandomWords(
        uint256 requestId,
        uint256[] memory randomWords
    ) internal override {
		uint8 robotId = 1;
		unchecked {
			robotId = uint8((randomWords[0] % 20) + 1);
		}
		emit AssingRobot(_requestToOrder[requestId], _requestToActivity[requestId], robotId);
    }

	modifier onlyOwner {
		if(msg.sender != _owner) revert NotAnOwner();
		_;
	}

	modifier onlyRobot {
		if(!_robotApproval[msg.sender]) revert NotARobot();
		_;
	}
}