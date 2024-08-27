# Anchor Pallet, On-chain Linked List

* Anchor is an On-chain Linked List pallet for [substrate](https://github.com/paritytech/substrate), it is based on substrate transfer extension.

* You can storage data on chain by anchor, as this way, it is a On-chain Key-value Storage.

* Anchor is also can be treaded as Name Service, you can own special anchor name by initializing it. 

## Overview

### Terminology

* Anchor: The name saved in AnchorOwner storage. You can treaded it as the domain on anchor chain.

* Protocol: Custom protocol, 256 bytes max.

* Raw: Any data you want to storage on chain.

### Unit Test

The unit test follow the substrate standard. Just change directory to frame/anchor, then run unit test as follow command.

```SHELL
    cargo clean
    cargo test
    cargo test --package pallet-anchor --features runtime-benchmarks

    cargo run --release --features runtime-benchmarks -- benchmark pallet --chain dev --steps 50 --repeat 20 --pallet pallet_anchor --extrinsic "*" --execution=wasm --wasm-execution=compiled --output ./pallets/pallet-anchor/src/weights.rs

```

Hard link the files to `polkadot-sdk` target folder `substrate/frame/anchor`.

```SHELL
  cd ./polkadot-sdk/substrate/frame/anchor
  ln /Users/fuzhongqiang/Desktop/www/iNFT/pallet/Cargo.toml Cargo.toml
  cd src
  ln /Users/fuzhongqiang/Desktop/www/iNFT/pallet/src/lib.rs lib.rs
  ln /Users/fuzhongqiang/Desktop/www/iNFT/pallet/src/tests.rs tests.rs
  ln /Users/fuzhongqiang/Desktop/www/iNFT/pallet/src/weights.rs weights.rs
  ln /Users/fuzhongqiang/Desktop/www/iNFT/pallet/src/benchmarking.rs benchmarking.rs
```

### Intergration

* Document: [https://docs.substrate.io/tutorials/build-application-logic/add-a-pallet/](https://docs.substrate.io/tutorials/build-application-logic/add-a-pallet/), this is out of time.

* open `Cargo.toml` file and add `pallet-anchor = { path = "substrate/frame/anchor", default-features = false }` after `pallet-alliance`.

* open `umbrella/Cargo.toml` to add `Anchor pallet`.

* open `umbrella/src/lib.rs` to add `Anchor pallet`.

* Open `substrate/bin/node/runtime/src/lib.rs` file.

* Add pallet anchor to `mod runtime`, Search `#[frame_support::runtime]` then add the following code.

  ```Rust
  #[runtime::pallet_index(80)]
  pub type Anchor = pallet_anchor:Pallet<Runtime>;
  ```

* Add the config, add the following code.
  
  ```Rust
  impl pallet_anchor::Config for Runtime {
    type RuntimeEvent = RuntimeEvent;
    type Currency = Balances;
    type WeightInfo = pallet_anchor::weights::SubstrateWeight<Runtime>;
  }
  ```

* Rust issue, need the proper version of Rust.
  
  ```BASH
    rustup override set 1.78
    rustup override unset

    rustup update 1.78

    rustup default stable
    rustup default nightly
    
    rustup default nightly-2020-10-06
  ```

### Benchmark

* Open `substrate/bin/node/runtime/src/lib.rs` file and locate to `polkadot_sdk::frame_benchmarking::define_benchmarks!`

## Exposed Methods

### set_anchor

Set anchor data function. There are two conditions. If the target anchor exsists, will check the ownership, then update the data. Otherwise, will initialize a new anchor.

```RUST
    pub fn set_anchor(
      origin: OriginFor<T>,   //default
      key: Vec<u8>,           //Anchor name
      raw: Vec<u8>,           //raw data to storage
      protocol: Vec<u8>,      //data protocol, used to decide how to decode raw data
      pre:T::BlockNumber      //the previous block number which storage anchor data
    ) -> DispatchResult {
      // code here.
      Ok(())
    }
```

### sell_anchor

Set the anchor on selling, two ways can be supported.

1. sell anchor freely
2. sell anchor to target account

```RUST
    pub fn sell_anchor(
      origin: OriginFor<T>,   //default
      key: Vec<u8>,           //Anchor name
      cost: u32,              //unit accuracy
      target:<T::Lookup as StaticLookup>::Source  //target buyer SS58 address. If the same as owner, can be sold to anyone.
    ) -> DispatchResult {
      // code here.
      Ok(())
    }
```

### unsell_anchor

Revoke the selling status.

```RUST
    pub fn unsell_anchor(
      origin: OriginFor<T>,   //default
      key: Vec<u8>,           //Anchor name
    ) -> DispatchResult {
      // code here.
      Ok(())
    }
```

### buy_anchor

Buy the selling anchor.

```RUST
    pub fn buy_anchor(
        origin: OriginFor<T>,    //default
      key: Vec<u8>,            //Anchor name
    ) -> DispatchResult {
      // code here.
      Ok(())
    }
```

## Storages

### AnchorOwner

  ```RUST
    // (T::AccountId,T::BlockNumber)
    //  T::AccountId, the anchor owner ss58 address
    //  T::BlockNumber, last block number when updated data successfully.
    pub(super) type AnchorOwner<T: Config> = StorageMap < 
        _, 
        Twox64Concat,
        Vec<u8>,                        //anchor name
        (T::AccountId,T::BlockNumber)   //check the head lines
    >;
  ```

### SellList

  ```RUST
    // (T::AccountId, u32,T::AccountId)
    // T::AccountId, the anchor owner ss58 address
    // u32, the sell price for the anchor
    // T::AccountId, the target buyer. If the same as owner, it is free to buy.
    pub(super) type SellList<T: Config> = StorageMap<
        _,
        Twox64Concat,
        Vec<u8>,                            //anchor name
        (T::AccountId,u32,T::AccountId)     //check the head lines
    >;
  ```

## Events

### AnchorToSell

When an anchor is set to selling status, will trigger this event.

  ```RUST
    #[pallet::event]
    #[pallet::generate_deposit(pub(super) fn deposit_event)]
    pub enum Event<T: Config> {
      AnchorToSell(T::AccountId,u32,T::AccountId),  //(owner, price , target)
    }
  ```
