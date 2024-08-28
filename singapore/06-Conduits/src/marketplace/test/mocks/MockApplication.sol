// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.24;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {ERC721EnumerableUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {MockProductFactory} from "./MockProductFactory.sol";
import {MockProduct} from "./MockProduct.sol";
import {IApplication} from "../../contracts/interfaces/IApplication.sol";

contract MockApplication is Initializable, ERC721EnumerableUpgradeable, IApplication {
    error NotProductDeviceOwner();
    error AlreadyAuthorized();

    MockProductFactory public PRODUCT_FACTORY;
    uint256 private _accessIdCount;
    mapping(address => uint256[]) internal _accessesByDevice;
    mapping(uint256 => address) internal _deviceByAuthorizationId;

    constructor() {
        _disableInitializers();
    }

    modifier onlyProductDeviceOwner(address device) {
        (address product, uint256 tokenId) = getDeviceBinding(device);
        if (MockProduct(product).ownerOf(tokenId) != msg.sender) {
            revert NotProductDeviceOwner();
        }
        _;
    }

    /**
     * @inheritdoc IApplication
     */
    function initialize(
        address productFactory,
        string memory name,
        string memory symbol
    ) external initializer {
        PRODUCT_FACTORY = MockProductFactory(productFactory);
        __ERC721_init(name, symbol);
        _accessIdCount = 1;
    }

    /**
     * @inheritdoc IApplication
     */
    function getAccessesByDevice(address device) public view returns (uint256[] memory) {
        return _accessesByDevice[device];
    }

    /**
     * @inheritdoc IApplication
     */
    function getDeviceByAccessId(uint256 accessId) public view returns (address) {
        return _deviceByAuthorizationId[accessId];
    }

    /**
     * @inheritdoc IApplication
     */
    function getDeviceBinding(
        address device
    ) public view returns (address product, uint256 tokenId) {
        MockProductFactory.DeviceBinding memory deviceBinding = PRODUCT_FACTORY
            .getDeviceBinding(device);
        return (deviceBinding.product, deviceBinding.tokenId);
    }

    /**
     * @inheritdoc IApplication
     */
    function isAccessible(
        address device,
        address user
    ) external view returns (bool) {
        for(uint256 i = 0; i < _accessesByDevice[device].length; ++i) {
            if(_ownerOf(_accessesByDevice[device][i]) == user) {
                return true;
            }
        }
        return false;
    }

    /**
     * @inheritdoc IApplication
     */
    function mint(
        address to,
        address device
    ) external onlyProductDeviceOwner(device) returns (uint256) {
        uint256 balance = balanceOf(to);
        for(uint256 i = 0; i < balance; ++i) {
            if(_deviceByAuthorizationId[tokenByIndex(i)] == device) {
                revert AlreadyAuthorized();
            }
        }
        uint256 accessId = _accessIdCount++;
        _mint(to, accessId);
        _accessesByDevice[device].push(accessId);
        _deviceByAuthorizationId[accessId] = device;
        return accessId;
    }

    /**
     * @inheritdoc IApplication
     */
    function burn(address device, uint256 accessId) external onlyProductDeviceOwner(device) {
        _burn(accessId);
        uint256[] storage authorizations = _accessesByDevice[device];
        for(uint256 i = 0; i < authorizations.length; ++i) {
            if(authorizations[i] == accessId) {
                authorizations[i] = authorizations[authorizations.length - 1];
                authorizations.pop();
                break;
            }
        }
        delete _deviceByAuthorizationId[accessId];  
    }

    /**
     * @inheritdoc IERC165
     */
    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(ERC721EnumerableUpgradeable, IERC165) returns (bool) {
        return
            interfaceId == type(IApplication).interfaceId ||
            super.supportsInterface(interfaceId);
    }
}
