// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IApplication} from "./interfaces/IApplication.sol";
import {IMarketplace} from "./interfaces/IMarketplace.sol";

contract Marketplace is IMarketplace, Ownable {
    using SafeERC20 for IERC20;

    IApplication public immutable APPLICATION;

    address public constant NATIVE_TOKEN = address(0);

    uint256 public constant MAX_POINTS = 10000;

    address payable internal _treasury;

    uint256 internal _feePoints;

    /**
     * @notice rent currency => is supported
     */
    mapping(address => bool) public supportedRentCurrencies;

    /**
     * @notice device => listing info
     */
    mapping(address => ListingInfo) internal _listings;

    /**
     * @notice device => rent info
     */
    mapping(address => RentalInfo) internal _rentals;

    constructor(
        address initialOwner,
        address application,
        address[] memory rentCurrencies,
        address payable treasury,
        uint256 feePoints
    ) Ownable(initialOwner) {
        APPLICATION = IApplication(application);
        for (uint256 i = 0; i < rentCurrencies.length; i++) {
            supportedRentCurrencies[rentCurrencies[i]] = true;
        }
        _treasury = treasury;
        _feePoints = feePoints;
    }

    /**
     * @inheritdoc IMarketplace
     */
    function getListingInfo(
        address device
    ) external view returns (ListingInfo memory) {
        return _listings[device];
    }

    /**
     * @inheritdoc IMarketplace
     */
    function getRentalInfo(
        address device
    ) external view returns (RentalInfo memory) {
        return _rentals[device];
    }

    /**
     * @inheritdoc IMarketplace
     */
    function setFeePoints(uint256 feePoints) external onlyOwner {
        _feePoints = feePoints;
    }

    /**
     * @inheritdoc IMarketplace
     */
    function setTreasury(address payable treasury) external onlyOwner {
        _treasury = treasury;
    }

    /**
     * @inheritdoc IMarketplace
     */
    function addRentCurrencies(
        address[] memory rentCurrencies
    ) external onlyOwner {
        for (uint i = 0; i < rentCurrencies.length; i++) {
            supportedRentCurrencies[rentCurrencies[i]] = true;
        }
    }

    /**
     * @inheritdoc IMarketplace
     */
    function removeRentCurrencies(
        address[] memory rentCurrencies
    ) external onlyOwner {
        for (uint i = 0; i < rentCurrencies.length; i++) {
            supportedRentCurrencies[rentCurrencies[i]] = false;
        }
    }

    /**
     * @inheritdoc IMarketplace
     */
    function list(
        address device,
        uint256 minRentalDays,
        uint256 maxRentalDays,
        address rentCurrency,
        uint256 dailyRent,
        address rentRecipient
    ) public {
        require(
            _listings[device].status == ListingStatus.WithdrawnOrNotExist, // Never listed or withdrawn
            "token already listed"
        );
        require(minRentalDays > 0, "invalid minimum rental days");
        require(maxRentalDays >= minRentalDays, "invalid maximum rental days");
        require(
            rentCurrency == NATIVE_TOKEN ||
                supportedRentCurrencies[rentCurrency],
            "unsupported rent currency"
        );

        _listings[device] = ListingInfo({
            owner: msg.sender,
            minRentalDays: minRentalDays,
            maxRentalDays: maxRentalDays,
            rentCurrency: rentCurrency,
            dailyRent: dailyRent,
            rentRecipient: payable(rentRecipient),
            status: ListingStatus.Listing
        });

        _transferDevice(device, msg.sender, address(this));

        emit List(
            msg.sender,
            device,
            minRentalDays,
            maxRentalDays,
            rentCurrency,
            dailyRent,
            rentRecipient
        );
    }

    /**
     * @inheritdoc IMarketplace
     */
    function delist(address device) public {
        ListingInfo storage listing = _listings[device];
        require(listing.owner == msg.sender, "not listing owner");
        listing.status = ListingStatus.Delisted;

        emit Delist(msg.sender, device);
    }

    /**
     * @inheritdoc IMarketplace
     */
    function relist(
        address device,
        uint256 minRentalDays,
        uint256 maxRentalDays,
        address rentCurrency,
        uint256 dailyRent,
        address rentRecipient
    ) public {
        ListingInfo storage listing = _listings[device];
        require(listing.owner == msg.sender, "not listing owner");
        require(minRentalDays > 0, "invalid minimum rental days");
        require(maxRentalDays >= minRentalDays, "invalid maximum rental days");
        require(
            rentCurrency == NATIVE_TOKEN ||
                supportedRentCurrencies[rentCurrency],
            "unsupported rent currency"
        );

        listing.minRentalDays = minRentalDays;
        listing.maxRentalDays = maxRentalDays;
        listing.rentCurrency = rentCurrency;
        listing.dailyRent = dailyRent;
        listing.rentRecipient = payable(rentRecipient);
        listing.status = ListingStatus.Listing;

        emit Relist(
            msg.sender,
            device,
            minRentalDays,
            maxRentalDays,
            rentCurrency,
            dailyRent,
            rentRecipient
        );
    }

    /**
     * @inheritdoc IMarketplace
     */
    function rent(
        address device,
        address tenant,
        uint256 rentalDays,
        uint256 prepaidRent
    ) public payable {
        require(
            _rentals[device].status == RentalStatus.EndedOrNotExist,
            "existing rental"
        );

        ListingInfo memory listing = _listings[device];
        require(listing.status == ListingStatus.Listing, "not listing");
        require(
            listing.minRentalDays <= rentalDays &&
                rentalDays <= listing.maxRentalDays,
            "invalid rental days"
        );
        require(
            prepaidRent >= listing.minRentalDays * listing.dailyRent,
            "insufficient prepaid rent"
        );

        // Mint app device to tenant
        uint256 accessId = APPLICATION.mint(tenant, device);

        uint256 startTime = block.timestamp;
        uint256 endTime = block.timestamp + rentalDays * 1 days;
        _rentals[device] = RentalInfo({
            accessId: accessId,
            startTime: startTime,
            endTime: endTime,
            rentalDays: rentalDays,
            rentCurrency: listing.rentCurrency,
            dailyRent: listing.dailyRent,
            totalPaidRent: 0,
            status: RentalStatus.Renting
        });

        // Pay rent
        _payRent(listing, _rentals[device], prepaidRent);

        emit Rent(device, accessId, tenant, startTime, endTime, rentalDays, prepaidRent);
    }

    /**
     * @inheritdoc IMarketplace
     */
    function payRent(
        address device,
        uint256 rent_
    ) public payable {
        ListingInfo memory listing = _listings[device];
        RentalInfo storage rental = _rentals[device];
        require(
            rental.totalPaidRent + rent_ <=
                rental.rentalDays * rental.dailyRent,
            "too much rent"
        );

        // Pay rent
        _payRent(listing, rental, rent_);

        emit PayRent(device, rent_);
    }

    /**
     * @inheritdoc IMarketplace
     */
    function endLease(address device) public {
        RentalInfo storage rental = _rentals[device];
        // The lease can be ended only if the term is over or the rent is insufficient
        uint256 rentNeeded = ((block.timestamp - rental.startTime) *
            rental.dailyRent) / 1 days;
        require(
            rental.endTime < block.timestamp ||
                rental.totalPaidRent < rentNeeded,
            "cannot end lease"
        );

        // Burn tenant's app device
        APPLICATION.burn(device, rental.accessId);
        rental.status = RentalStatus.EndedOrNotExist;

        emit EndLease(device, msg.sender);
    }

    /**
     * @inheritdoc IMarketplace
     */
    function withdraw(address device) public {
        ListingInfo storage listing = _listings[device];
        RentalInfo storage rental = _rentals[device];
        require(listing.owner == msg.sender, "not listing owner");
        require(
            rental.status == RentalStatus.EndedOrNotExist,
            "device has tenant"
        );
        listing.status = ListingStatus.WithdrawnOrNotExist;

        _transferDevice(device, address(this), listing.owner);

        emit Withdraw(msg.sender, device);
    }

    function _payRent(
        ListingInfo memory listing,
        RentalInfo storage rental,
        uint256 rent_
    ) internal {
        uint256 fee;
        uint256 rentToOwner;

        bool feeOn = _feePoints != 0;
        if (feeOn) {
            fee = (rent_ * _feePoints) / MAX_POINTS;
            rentToOwner = rent_ - fee;
        } else {
            rentToOwner = rent_;
        }

        if (rental.rentCurrency == NATIVE_TOKEN) {
            require(msg.value == rent_, "invalid prepaid rent");
            listing.rentRecipient.transfer(rentToOwner);
            if (feeOn) {
                _treasury.transfer(fee);
            }
        } else {
            IERC20(rental.rentCurrency).safeTransferFrom(
                msg.sender,
                listing.rentRecipient,
                rentToOwner
            );
            if (feeOn) {
                IERC20(rental.rentCurrency).safeTransferFrom(
                    msg.sender,
                    _treasury,
                    fee
                );
            }
        }

        rental.totalPaidRent += rent_;
    }

    function _transferDevice(
        address device,
        address from,
        address to
    ) internal {
        (address product, uint256 tokenId) = APPLICATION.getDeviceBinding(
            device
        );
        IERC721(product).transferFrom(from, to, tokenId);
    }
}
