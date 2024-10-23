// This file is part of Substrate.

// Copyright (C) Parity Technologies (UK) Ltd.
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

//! Tests for pallet-anchor.

use crate::*;
use frame_support::{
	assert_ok, derive_impl,assert_noop,
};
use sp_core::H256;

// The testing primitives are very useful for avoiding having to work with signatures
// or public keys. `u64` is used as the `AccountId` and no `Signature`s are required.
use sp_runtime::{
	traits::{BlakeTwo256, IdentityLookup},
	BuildStorage,
};
// Reexport crate as its pallet name for construct_runtime.
use crate as pallet_anchor;

type Block = frame_system::mocking::MockBlock<Test>;

// For testing the pallet, we construct a mock runtime.
frame_support::construct_runtime!(
	pub enum Test
	{
		System: frame_system,
		Balances: pallet_balances,
		Anchor: pallet_anchor,
	}
);

#[derive_impl(frame_system::config_preludes::TestDefaultConfig)]
impl frame_system::Config for Test {
	type BaseCallFilter = frame_support::traits::Everything;
	type BlockWeights = ();
	type BlockLength = ();
	type DbWeight = ();
	type RuntimeOrigin = RuntimeOrigin;
	type Nonce = u64;
	type Hash = H256;
	type RuntimeCall = RuntimeCall;
	type Hashing = BlakeTwo256;
	type AccountId = u64;
	type Lookup = IdentityLookup<Self::AccountId>;
	type Block = Block;
	type RuntimeEvent = RuntimeEvent;
	type Version = ();
	type PalletInfo = PalletInfo;
	type AccountData = pallet_balances::AccountData<u64>;
	type OnNewAccount = ();
	type OnKilledAccount = ();
	type SystemWeightInfo = ();
	type SS58Prefix = ();
	type OnSetCode = ();
	type MaxConsumers = frame_support::traits::ConstU32<16>;
}

#[derive_impl(pallet_balances::config_preludes::TestDefaultConfig)]
impl pallet_balances::Config for Test {
	type AccountStore = System;
}

impl Config for Test {
	type RuntimeEvent = RuntimeEvent;
	type WeightInfo = ();
	type Currency = Balances;
}

// This function basically just builds a genesis storage key/value store according to
// our desired mockup.
pub fn new_test_ext() -> sp_io::TestExternalities {
	let mut t = frame_system::GenesisConfig::<Test>::default().build_storage().unwrap();
	pallet_balances::GenesisConfig::<Test> {
		balances: vec![
			(11, 1999000000000000),
			(22, 2999000000000000),
			(33, 3999000000000000),
			(44, 199000000000000),
		],
	}
	.assimilate_storage(&mut t)
	.unwrap();

	t.into()
}

#[test]
fn set_anchor() {
    new_test_ext().execute_with(|| {
		//Basic params
		// set start block to start_block
		let start_block = 100;		//set the start block number
		let step = 20;				//the step for the block number
		System::set_block_number(start_block); 	//need to start

		// set_anchor data.
		let key:Vec<u8> = b"hello".iter().cloned().collect();
		let raw:Vec<u8> = b"Test...".iter().cloned().collect();
		let protocol:Vec<u8> = b"Nothing".iter().cloned().collect();

		let (id_a,id_b)=(11,22);
		let account_a=RuntimeOrigin::signed(id_a);	//test account A
		let account_b=RuntimeOrigin::signed(id_b);	//test account B
		
		//Logical part of set_anchor
		//1.set a new anchor
		assert_ok!(
			Anchor::set_anchor(account_a.clone(),key.clone(),raw.clone(),protocol.clone(),0)
		);
		assert_eq!(Anchor::owner(&key), Some((id_a,start_block)));
		System::set_block_number(System::block_number() + step);		//inc block number

		//2.set anchor with wrong pre block
		assert_noop!(
			Anchor::set_anchor( account_a.clone(),key.clone(),raw.clone(),protocol.clone(),0),
			Error::<Test>::PreAnchorFailed,
		);
		assert_eq!(Anchor::owner(&key), Some((id_a,start_block)));

		//3.set anchor with right previous block number
		System::set_block_number(System::block_number() + step);		//inc block number
		assert_ok!(
			Anchor::set_anchor(account_a.clone(),key.clone(),raw.clone(),protocol.clone(),start_block),
		);
		assert_eq!(Anchor::owner(&key), Some((id_a,start_block+step+step)));

		//4.set anchor by another account who do not own the anchor
		assert_noop!(
			Anchor::set_anchor(account_b.clone(),key.clone(),raw.clone(),protocol.clone(),start_block),
			Error::<Test>::AnchorNotBelogToAccount,
		);
		System::set_block_number(System::block_number() + step);
    });
}

#[test]
fn sell_anchor() {
    new_test_ext().execute_with(|| {
		//Basic params
		// set start block to start_block
		let start_block = 100;		//set the start block number
		let step = 20;				//the step for the block number
		System::set_block_number(start_block); 	//need to start

		// set_anchor data.
		let key:Vec<u8> = b"selling_anchor".iter().cloned().collect();
		let raw:Vec<u8> = b"Test more...".iter().cloned().collect();
		let protocol:Vec<u8> = b"Protocol".iter().cloned().collect();

		let (id_a,id_b,id_c)=(11,22,33);
		let account_a=RuntimeOrigin::signed(id_a);	//test account A
		let account_b=RuntimeOrigin::signed(id_b);	//test account B
		let price=499;

		//Logical part of sell_anchor
		//1.set a new anchor
		assert_ok!(
			Anchor::set_anchor(account_a.clone(),key.clone(),raw.clone(),protocol.clone(),0)
		);
		assert_eq!(Anchor::owner(&key), Some((id_a,start_block)));

		//2. sell it by another account
		assert_noop!(
			Anchor::sell_anchor(account_b.clone(),key.clone(),price,id_b),
			Error::<Test>::AnchorNotBelogToAccount,
		);
		assert_noop!(
			Anchor::sell_anchor(account_b.clone(),key.clone(),price,id_c),
			Error::<Test>::AnchorNotBelogToAccount,
		);
		assert_eq!(Anchor::owner(&key), Some((id_a,start_block)));

		//3. sell it freely
		assert_ok!(
			Anchor::sell_anchor(account_a.clone(),key.clone(),price,id_a),
		);
		assert_eq!(Anchor::selling(&key), Some((id_a,price,id_a)));
		assert_eq!(Anchor::owner(&key), Some((id_a,start_block)));

		//4. sell it to target account and change price
		System::set_block_number(System::block_number() + step);
		assert_ok!(
			Anchor::sell_anchor(account_a.clone(),key.clone(),price+300,id_c),
		);
		assert_eq!(Anchor::selling(&key), Some((id_a,price+300,id_c)));
		assert_eq!(Anchor::owner(&key), Some((id_a,start_block)));
	});
}

#[test]
fn unsell_anchor() {
    new_test_ext().execute_with(|| {	
		//Basic params
		// set start block to start_block
		let start_block = 100;		//set the start block number
		let step = 20;				//the step for the block number
		System::set_block_number(start_block); 	//need to start

		// set_anchor data.
		let key:Vec<u8> = b"selling_anchor".iter().cloned().collect();
		let raw:Vec<u8> = b"Test more...".iter().cloned().collect();
		let protocol:Vec<u8> = b"Protocol".iter().cloned().collect();

		let (id_a,id_b)=(11,22);
		let account_a=RuntimeOrigin::signed(id_a);	//test account A
		let account_b=RuntimeOrigin::signed(id_b);	//test account B
		let price=399;

		//Logical part of unsell_anchor

		//1.set a new anchor
		assert_ok!(
			Anchor::set_anchor(account_a.clone(),key.clone(),raw.clone(),protocol.clone(),0)
		);
		assert_eq!(Anchor::owner(&key), Some((id_a,start_block)));

		//2.unsell the normal anchor
		assert_noop!(
			Anchor::unsell_anchor(account_a.clone(),key.clone()),
			Error::<Test>::AnchorNotInSellList,
		);
		assert_eq!(Anchor::selling(&key), None);
		assert_eq!(Anchor::owner(&key), Some((id_a,start_block)));

		//3.set the anchor to selling status
		assert_ok!(
			Anchor::sell_anchor(account_a.clone(),key.clone(),price,id_a)
		);
		assert_eq!(Anchor::selling(&key), Some((id_a,price,id_a)));
		assert_eq!(Anchor::owner(&key), Some((id_a,start_block)));

		//4.unsell the anchor by another account
		assert_noop!(
			Anchor::unsell_anchor(account_b.clone(),key.clone()),
			Error::<Test>::AnchorNotBelogToAccount,
		);
		assert_eq!(Anchor::selling(&key), Some((id_a,price,id_a)));
		assert_eq!(Anchor::owner(&key), Some((id_a,start_block)));

		//5.unsell the anchor by owner
		System::set_block_number(System::block_number() + step);
		assert_ok!(
			Anchor::unsell_anchor(account_a.clone(),key.clone())
		);
		assert_eq!(Anchor::selling(&key), None);
		assert_eq!(Anchor::owner(&key), Some((id_a,start_block)));
	});
}

#[test]
fn buy_anchor() {
    new_test_ext().execute_with(|| {
		//Basic params
		// set start block to start_block
		let start_block = 100;		//set the start block number
		let step = 20;				//the step for the block number
		System::set_block_number(start_block); 	//need to start

		// set_anchor data.
		let key:Vec<u8> = b"selling_anchor".iter().cloned().collect();
		let raw:Vec<u8> = b"Test more...".iter().cloned().collect();
		let protocol:Vec<u8> = b"Protocol".iter().cloned().collect();

		let (id_a,id_b,id_c,id_d)=(11,22,33,44);
		let account_a=RuntimeOrigin::signed(id_a);	//test account A
		let account_b=RuntimeOrigin::signed(id_b);	//test account B
		let account_c=RuntimeOrigin::signed(id_c);	//test account C
		let account_d=RuntimeOrigin::signed(id_d);	//test account D
		let price=299;

		//1.set a new anchor
		assert_ok!(
			Anchor::set_anchor(account_a.clone(),key.clone(),raw.clone(),protocol.clone(),0)
		);
		assert_eq!(Anchor::owner(&key), Some((id_a,start_block)));

		//2.buy a unselling anchor
		assert_eq!(Anchor::selling(&key), None);
		assert_noop!(
			Anchor::buy_anchor(account_b.clone(),key.clone()),
			Error::<Test>::AnchorNotInSellList,
		);
		
		//3. sell it freely
		System::set_block_number(System::block_number() + step);
		assert_ok!(
			Anchor::sell_anchor(account_a.clone(),key.clone(),price,id_a),
		);
		assert_eq!(Anchor::selling(&key), Some((id_a,price,id_a)));
		assert_eq!(Anchor::owner(&key), Some((id_a,start_block)));

		//4. buy anchor without enought balance
		assert_eq!(Balances::free_balance(id_d), 199000000000000);
		assert_noop!(
			Anchor::buy_anchor(account_d.clone(),key.clone()),
			Error::<Test>::InsufficientBalance,
		);
		assert_eq!(Anchor::selling(&key), Some((id_a,price,id_a)));
		assert_eq!(Anchor::owner(&key), Some((id_a,start_block)));

		//5. buy the anchor yourself
		assert_noop!(
			Anchor::buy_anchor(account_a.clone(),key.clone()),
			Error::<Test>::CanNotBuyYourOwnAnchor,
		);

		//6. buy by a free account
		assert_eq!(Balances::free_balance(id_c), 3999000000000000);
		assert_ok!(
			Anchor::buy_anchor(account_c.clone(),key.clone())
		);
		assert_eq!(Balances::free_balance(id_c), 3700000000000000);
		assert_eq!(Anchor::selling(&key), None);
		assert_eq!(Anchor::owner(&key), Some((id_c,start_block)));

		//7. buy a target anchor
		assert_ok!(
			Anchor::sell_anchor(account_c.clone(),key.clone(),price,id_b),
		);
		assert_eq!(Anchor::selling(&key), Some((id_c,price,id_b)));
		assert_eq!(Anchor::owner(&key), Some((id_c,start_block)));

		//8. try to buy targeted anchor
		assert_noop!(
			Anchor::buy_anchor(account_a.clone(),key.clone()),
			Error::<Test>::OnlySellToTargetBuyer,
		);
		assert_eq!(Anchor::selling(&key), Some((id_c,price,id_b)));
		assert_eq!(Anchor::owner(&key), Some((id_c,start_block)));

		//9. done!
		assert_ok!(
			Anchor::buy_anchor(account_b.clone(),key.clone())
		);
		assert_eq!(Anchor::selling(&key), None);
		assert_eq!(Anchor::owner(&key), Some((id_b,start_block)));
	});
}

#[test]
fn divert_anchor() {
	new_test_ext().execute_with(|| {
		// set start block to start_block
		let start_block = 100;		//set the start block number
		let step = 20;				//the step for the block number
		System::set_block_number(start_block); 	//need to start

		// set_anchor data.
		let key:Vec<u8> = b"divert_anchor".iter().cloned().collect();
		let raw:Vec<u8> = b"Test more...".iter().cloned().collect();
		let protocol:Vec<u8> = b"Protocol".iter().cloned().collect();

		let (id_a,id_b)=(11,22);
		let account_a=RuntimeOrigin::signed(id_a);	//test account A
		//let account_b=RuntimeOrigin::signed(id_b);	//test account B

		//1.set a new anchor
		assert_ok!(
			Anchor::set_anchor(account_a.clone(),key.clone(),raw.clone(),protocol.clone(),0)
		);
		assert_eq!(Anchor::owner(&key), Some((id_a,start_block)));
		System::set_block_number(System::block_number() + step);

		//2.divert a unselling anchor
		assert_ok!(
			Anchor::divert_anchor(account_a.clone(),key.clone(),id_b),
		);
		assert_eq!(Anchor::owner(&key), Some((id_b,start_block)));
	});
}

#[test]
fn drop_anchor() {
	new_test_ext().execute_with(|| {
		// set start block to start_block
		let start_block = 100;		//set the start block number
		let step = 20;				//the step for the block number
		System::set_block_number(start_block); 	//need to start

		// set_anchor data.
		let key:Vec<u8> = b"divert_anchor".iter().cloned().collect();
		let raw:Vec<u8> = b"Test more...".iter().cloned().collect();
		let protocol:Vec<u8> = b"Protocol".iter().cloned().collect();

		let message:Vec<u8> = b"Last words".iter().cloned().collect();

		let id_a=11;
		let account_a=RuntimeOrigin::signed(id_a);	//test account A

		//1.set a new anchor
		assert_ok!(
			Anchor::set_anchor(account_a.clone(),key.clone(),raw.clone(),protocol.clone(),0)
		);
		assert_eq!(Anchor::owner(&key), Some((id_a,start_block)));
		System::set_block_number(System::block_number() + step);

		//2.try to drop an anchor
		assert_ok!(
			Anchor::drop_anchor(account_a.clone(),key.clone(),message.clone())
		);

		//FIXME, how to get the invalid account
		assert_eq!(Anchor::owner(&key), Some((id_a,start_block)));
	});
}