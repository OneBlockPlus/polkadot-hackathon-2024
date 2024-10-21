# Device ids pallet

A pallet for dealing with non-fungible-like device id. it's forked form `pallet-nft`

## Overview

The Device Ids pallet provides functionality for device id' management, including:

* Project Creation
* Device Minting
* Device Transfers
* Attributes Management
* Device Burning

### Terminology

* **Product creation:** The creation of a new collection.
* **Device minting:** The action of creating a new device of a product.
* **Device transfer:** The action of sending a device from one account to another.
* **Device burning:** The destruction of a device.
* **Non-fungible token (NFT) like:** Product acts as NFT's collection, and devices are items.

### Goals

The DeviceId pallet in Substrate is designed to make the following possible:

* Allow accounts to permissionlessly create products.
* Allow a named (permissioned) account to mint and burn unique items within a collection.
* Move items between accounts permissionlessly.
* Allow a named (permissioned) account to freeze and unfreeze items within a collection or the entire collection.
* Allow the owner of an item to delegate the ability to transfer the item to some named third-party.
* Allow third-parties to store information in an NFT _without_ owning it (Eg. save game state).

## Interface

### Permissionless dispatchables

* `create_product`: Create a new product by placing a deposit.
* `transfer_device`: Send an device to a new owner.
* `approve_device_attributes`: Name a delegate who may change device's attributes within a namespace.
* `cancel_device_attributes_approval`: Revert the effects of a previous `approve_device_attributes`.

### Permissioned dispatchables

* `mint_device`: Mint a new device of product (only the issuer can mint new device).
* `burn_device`: Destroy a device of product.
* `lock_device_transfer`: Prevent an individual device from being transferred.
* `unlock_device_transfer`: Revert the effects of a previous `lock_device_transfer`.
* `destroy_product`: Destroy a product. This destroys all the devices of the product and refunds the deposit.
* `lock_product`: Prevent all devices of a products from being transferred (making them all `soul bound`).
* `lock_device_properties`: Lock device's metadata or attributes.
* `transfer_product_ownership`: Alter the owner of a product, moving all associated deposits. (Ownership of individual devices
  will not be affected.)
* `set_product_team`: Alter the permissioned accounts of a product.
* `set_product_max_supply`: Change the max supply of a product.
* `update_product_mint_settings`: Update the minting settings for product.

### Metadata (permissioned) dispatchables

* `set_attribute`: Set a metadata attribute of a device or product.
* `clear_attribute`: Remove a metadata attribute of a device or product.
* `set_device_metadata`: Set general metadata of a device (E.g. an IPFS address of an image url).
* `clear_device_metadata`: Remove general metadata of a device.
* `set_product_metadata`: Set general metadata of a product.
* `clear_product_metadata`: Remove general metadata of a product.

### Force (i.e. governance) dispatchables

* `force_create_product`: Create a new product (the product id can not be chosen).
* `force_set_product_owner`: Change product's owner.
* `force_set_product_config`: Change product's config.
* `force_set_attribute`: Set an attribute.
* `force_mint_device`: Mint a new device of a product.

### TODO

* `activate_device`: activate a device with proof data
* `set_product_traits`: set verifiable traits to a product
