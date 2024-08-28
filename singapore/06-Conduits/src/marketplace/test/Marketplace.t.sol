// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.24;

import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";
import {IMarketplaceStructs} from "../contracts/interfaces/IMarketplaceStructs.sol";
import {Marketplace} from "../contracts/Marketplace.sol";
import {MockProduct} from "./mocks/MockProduct.sol";
import {MockProductFactory} from "./mocks/MockProductFactory.sol";
import {MockApplication} from "./mocks/MockApplication.sol";
import "forge-std/src/Test.sol";

contract MarketplaceTest is Test {
    MockProductFactory productFactory;
    MockProduct product;

    address device;
    uint256 tokenId; // device => {product, tokenId}
    address deviceOwner;

    Marketplace marketplace;
    MockApplication application;

    address tenant;

    address treasury;
    uint256 feePoints = 100;

    function setUp() public {
        treasury = makeAddr("treasury");
        device = makeAddr("device");
        deviceOwner = makeAddr("deviceOwner");
        tenant = makeAddr("tenant");
        vm.deal(tenant, 1000 ether);

        productFactory = new MockProductFactory();
        product = MockProduct(productFactory.createProduct());
        tokenId = productFactory.createActivatedDevice(
            address(product),
            device,
            deviceOwner
        );

        MockApplication applicationImpl = new MockApplication();
        application = MockApplication(Clones.clone(address(applicationImpl)));
        application.initialize(address(productFactory), "Marketplace", "MKP");

        marketplace = new Marketplace(
            address(this),
            address(application),
            new address[](0),
            payable(treasury),
            feePoints
        );
    }

    function testList() public {
        // Check that the token is listed
        IMarketplaceStructs.ListingInfo memory listing = _list();
        assertEq(listing.owner, deviceOwner);
        assertEq(listing.minRentalDays, 1);
        assertEq(listing.maxRentalDays, 30);
        assertEq(listing.rentCurrency, address(0));
        assertEq(listing.dailyRent, 1 ether);
        assertEq(
            uint256(listing.status),
            uint256(IMarketplaceStructs.ListingStatus.Listing)
        );
    }

    function testDelist() public {
        _list();

        vm.prank(deviceOwner);
        marketplace.delist(device);

        // Check that the token is delisted
        IMarketplaceStructs.ListingInfo memory listing = marketplace
            .getListingInfo(device);
        assertEq(
            uint256(listing.status),
            uint256(IMarketplaceStructs.ListingStatus.Delisted)
        );
    }

    function testRent() public {
        _list();
        IMarketplaceStructs.RentalInfo memory rental = _rent(5, 5 ether);

        assertEq(rental.accessId, 1);
        assertEq(rental.startTime, block.timestamp);
        assertEq(rental.endTime, block.timestamp + 5 days);
        assertEq(rental.rentalDays, 5);
        assertEq(rental.dailyRent, 1 ether);
        assertEq(
            uint256(rental.status),
            uint256(IMarketplaceStructs.RentalStatus.Renting)
        );
    }

    function testRentWhenListingDelisted() public {
        _list();

        vm.prank(deviceOwner);
        marketplace.delist(device);

        vm.expectRevert("not listing");
        _rent(5, 5 ether);
    }

    function testPayRent() public {
        _list();
        IMarketplaceStructs.RentalInfo memory rental = _rent(8, 5 ether);

        assertEq(rental.startTime, block.timestamp);
        assertEq(rental.endTime, block.timestamp + 8 days); // 5 initial days + 3 additional days
        assertEq(rental.rentalDays, 8);
        assertEq(rental.dailyRent, 1 ether);
        assertEq(rental.totalPaidRent, 5 ether);
        assertEq(
            uint256(rental.status),
            uint256(IMarketplaceStructs.RentalStatus.Renting)
        );

        vm.prank(tenant);
        marketplace.payRent{value: 3 ether}(device, 3 ether);

        // Check that the total paid rent is increment
        rental = marketplace.getRentalInfo(device);
        assertEq(rental.totalPaidRent, 8 ether);
    }

    function testEndLease() public {
        _list();
        _rent(5, 5 ether);

        // Advance time to end the rental period
        vm.warp(block.timestamp + 6 days);

        marketplace.endLease(device);

        // Check that the lease is ended
        IMarketplaceStructs.RentalInfo memory rental = marketplace
            .getRentalInfo(device);
        assertEq(
            uint256(rental.status),
            uint256(IMarketplaceStructs.RentalStatus.EndedOrNotExist)
        );
    }

    function testWithdraw() public {
        _list();

        vm.prank(deviceOwner);
        marketplace.withdraw(device);

        // Check that the token is withdrawn
        IMarketplaceStructs.ListingInfo memory listing = marketplace
            .getListingInfo(
                device
            );
        assertEq(
            uint256(listing.status),
            uint256(IMarketplaceStructs.ListingStatus.WithdrawnOrNotExist)
        );
    }

    function _list() internal returns (IMarketplaceStructs.ListingInfo memory) {
        uint256 minRentalDays = 1;
        uint256 maxRentalDays = 30;
        address rentCurrency = address(0);
        uint256 dailyRent = 1 ether;
        address payable rentRecipient = payable(deviceOwner);

        vm.startPrank(deviceOwner);
        product.approve(address(marketplace), tokenId);
        marketplace.list(
            device,
            minRentalDays,
            maxRentalDays,
            rentCurrency,
            dailyRent,
            rentRecipient
        );
        vm.stopPrank();

        return marketplace.getListingInfo(device);
    }

    function _rent(uint256 rentalDays, uint256 prepaidRent) internal returns (IMarketplaceStructs.RentalInfo memory) {
        vm.prank(tenant);
        marketplace.rent{value: prepaidRent}(
            device,
            tenant,
            rentalDays,
            prepaidRent
        );

        return marketplace.getRentalInfo(device);
    }
}
