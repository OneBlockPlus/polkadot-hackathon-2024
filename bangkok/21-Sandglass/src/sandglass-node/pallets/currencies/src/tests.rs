//! Unit tests for the currencies module.

#![cfg(test)]

use super::*;
use frame_support::{assert_noop, assert_ok};
use mock::*;
use sp_core::U256;
use sp_runtime::traits::BadOrigin;

#[test]
fn multi_lockable_currency_should_work() {
	ExtBuilder::default().one_hundred_for_alice_n_bob().build().execute_with(|| {
		assert_ok!(Currencies::set_lock(ID_1, X_TOKEN_ID, &ALICE, 50));
		assert_eq!(Tokens::locks(&ALICE, X_TOKEN_ID).len(), 1);
		assert_ok!(Currencies::set_lock(ID_1, NATIVE_CURRENCY_ID, &ALICE, 50));
		assert_eq!(Balances::locks(&ALICE).len(), 1);
	});
}

#[test]
fn multi_reservable_currency_should_work() {
	ExtBuilder::default().one_hundred_for_alice_n_bob().build().execute_with(|| {
		assert_eq!(Currencies::total_issuance(NATIVE_CURRENCY_ID), 200);
		assert_eq!(Currencies::total_issuance(X_TOKEN_ID), 200);
		assert_eq!(Currencies::free_balance(X_TOKEN_ID, &ALICE), 100);
		assert_eq!(NativeCurrency::free_balance(&ALICE), 100);

		assert_ok!(Currencies::reserve(X_TOKEN_ID, &ALICE, 30));
		assert_ok!(Currencies::reserve(NATIVE_CURRENCY_ID, &ALICE, 40));
		assert_eq!(Currencies::reserved_balance(X_TOKEN_ID, &ALICE), 30);
		assert_eq!(Currencies::reserved_balance(NATIVE_CURRENCY_ID, &ALICE), 40);
	});
}

#[test]
fn native_currency_lockable_should_work() {
	ExtBuilder::default().one_hundred_for_alice_n_bob().build().execute_with(|| {
		assert_ok!(NativeCurrency::set_lock(ID_1, &ALICE, 10));
		assert_eq!(Balances::locks(&ALICE).len(), 1);
		assert_ok!(NativeCurrency::remove_lock(ID_1, &ALICE));
		assert_eq!(Balances::locks(&ALICE).len(), 0);
	});
}

#[test]
fn native_currency_reservable_should_work() {
	ExtBuilder::default().one_hundred_for_alice_n_bob().build().execute_with(|| {
		assert_ok!(NativeCurrency::reserve(&ALICE, 50));
		assert_eq!(NativeCurrency::reserved_balance(&ALICE), 50);
	});
}

#[test]
fn basic_currency_adapting_pallet_balances_lockable() {
	ExtBuilder::default().one_hundred_for_alice_n_bob().build().execute_with(|| {
		assert_ok!(AdaptedBasicCurrency::set_lock(ID_1, &ALICE, 10));
		assert_eq!(Balances::locks(&ALICE).len(), 1);
		assert_ok!(AdaptedBasicCurrency::remove_lock(ID_1, &ALICE));
		assert_eq!(Balances::locks(&ALICE).len(), 0);
	});
}

#[test]
fn basic_currency_adapting_pallet_balances_reservable() {
	ExtBuilder::default().one_hundred_for_alice_n_bob().build().execute_with(|| {
		assert_ok!(AdaptedBasicCurrency::reserve(&ALICE, 50));
		assert_eq!(AdaptedBasicCurrency::reserved_balance(&ALICE), 50);
	});
}

#[test]
fn multi_currency_should_work() {
	ExtBuilder::default().one_hundred_for_alice_n_bob().build().execute_with(|| {
		assert_ok!(Currencies::transfer(Some(ALICE).into(), BOB, X_TOKEN_ID, 50));
		assert_eq!(Currencies::free_balance(X_TOKEN_ID, &ALICE), 50);
		assert_eq!(Currencies::free_balance(X_TOKEN_ID, &BOB), 150);
	});
}

#[test]
fn multi_currency_extended_should_work() {
	ExtBuilder::default().one_hundred_for_alice_n_bob().build().execute_with(|| {
		assert_ok!(<Currencies as MultiCurrencyExtended<AccountId>>::update_balance(
			X_TOKEN_ID, &ALICE, 50
		));
		assert_eq!(Currencies::free_balance(X_TOKEN_ID, &ALICE), 150);
	});
}

#[test]
fn native_currency_should_work() {
	ExtBuilder::default().one_hundred_for_alice_n_bob().build().execute_with(|| {
		assert_ok!(Currencies::transfer_native_currency(Some(ALICE).into(), BOB, 50));
		assert_eq!(NativeCurrency::free_balance(&ALICE), 50);
		assert_eq!(NativeCurrency::free_balance(&BOB), 150);

		assert_ok!(NativeCurrency::transfer(&ALICE, &BOB, 10));
		assert_eq!(NativeCurrency::free_balance(&ALICE), 40);
		assert_eq!(NativeCurrency::free_balance(&BOB), 160);

		assert_eq!(Currencies::slash(NATIVE_CURRENCY_ID, &ALICE, 10), 0);
		assert_eq!(NativeCurrency::free_balance(&ALICE), 30);
		assert_eq!(NativeCurrency::total_issuance(), 190);
	});
}

#[test]
fn native_currency_extended_should_work() {
	ExtBuilder::default().one_hundred_for_alice_n_bob().build().execute_with(|| {
		assert_ok!(NativeCurrency::update_balance(&ALICE, 10));
		assert_eq!(NativeCurrency::free_balance(&ALICE), 110);

		assert_ok!(<Currencies as MultiCurrencyExtended<AccountId>>::update_balance(
			NATIVE_CURRENCY_ID,
			&ALICE,
			10
		));
		assert_eq!(NativeCurrency::free_balance(&ALICE), 120);
	});
}

#[test]
fn basic_currency_adapting_pallet_balances_transfer() {
	ExtBuilder::default().one_hundred_for_alice_n_bob().build().execute_with(|| {
		assert_ok!(AdaptedBasicCurrency::transfer(&ALICE, &BOB, 50));
		assert_eq!(Balances::total_balance(&ALICE), 50);
		assert_eq!(Balances::total_balance(&BOB), 150);

		// creation fee
		assert_ok!(AdaptedBasicCurrency::transfer(&ALICE, &EVA, 10));
		assert_eq!(Balances::total_balance(&ALICE), 40);
		assert_eq!(Balances::total_balance(&EVA), 10);
	});
}

#[test]
fn basic_currency_adapting_pallet_balances_deposit() {
	ExtBuilder::default().one_hundred_for_alice_n_bob().build().execute_with(|| {
		assert_ok!(AdaptedBasicCurrency::deposit(&EVA, 50));
		assert_eq!(Balances::total_balance(&EVA), 50);
		assert_eq!(Balances::total_issuance(), 250);
	});
}

#[test]
fn basic_currency_adapting_pallet_balances_deposit_throw_error_when_actual_deposit_is_not_expected()
{
	ExtBuilder::default().one_hundred_for_alice_n_bob().build().execute_with(|| {
		assert_eq!(Balances::total_balance(&EVA), 0);
		assert_eq!(Balances::total_issuance(), 200);
		assert_noop!(AdaptedBasicCurrency::deposit(&EVA, 1), Error::<Test>::DepositFailed);
		assert_eq!(Balances::total_balance(&EVA), 0);
		assert_eq!(Balances::total_issuance(), 200);
		assert_ok!(AdaptedBasicCurrency::deposit(&EVA, 2));
		assert_eq!(Balances::total_balance(&EVA), 2);
		assert_eq!(Balances::total_issuance(), 202);
	});
}

#[test]
fn basic_currency_adapting_pallet_balances_withdraw() {
	ExtBuilder::default().one_hundred_for_alice_n_bob().build().execute_with(|| {
		assert_ok!(AdaptedBasicCurrency::withdraw(&ALICE, 100));
		assert_eq!(Balances::total_balance(&ALICE), 0);
		assert_eq!(Balances::total_issuance(), 100);
	});
}

#[test]
fn basic_currency_adapting_pallet_balances_slash() {
	ExtBuilder::default().one_hundred_for_alice_n_bob().build().execute_with(|| {
		assert_eq!(AdaptedBasicCurrency::slash(&ALICE, 101), 1);
		assert_eq!(Balances::total_balance(&ALICE), 0);
		assert_eq!(Balances::total_issuance(), 100);
	});
}

#[test]
fn basic_currency_adapting_pallet_balances_update_balance() {
	ExtBuilder::default().one_hundred_for_alice_n_bob().build().execute_with(|| {
		assert_ok!(AdaptedBasicCurrency::update_balance(&ALICE, -10));
		assert_eq!(Balances::total_balance(&ALICE), 90);
		assert_eq!(Balances::total_issuance(), 190);
	});
}

#[test]
fn update_balance_call_should_work() {
	ExtBuilder::default().one_hundred_for_alice_n_bob().build().execute_with(|| {
		assert_ok!(Currencies::update_balance(
			RuntimeOrigin::root(),
			ALICE,
			NATIVE_CURRENCY_ID,
			-10
		));
		assert_eq!(NativeCurrency::free_balance(&ALICE), 90);
		assert_eq!(Currencies::free_balance(X_TOKEN_ID, &ALICE), 100);
		assert_ok!(Currencies::update_balance(RuntimeOrigin::root(), ALICE, X_TOKEN_ID, 10));
		assert_eq!(Currencies::free_balance(X_TOKEN_ID, &ALICE), 110);
	});
}

#[test]
fn update_balance_call_fails_if_not_root_origin() {
	ExtBuilder::default().build().execute_with(|| {
		assert_noop!(
			Currencies::update_balance(Some(ALICE).into(), ALICE, X_TOKEN_ID, 100),
			BadOrigin
		);
	});
}

#[test]
fn call_event_should_work() {
	ExtBuilder::default().one_hundred_for_alice_n_bob().build().execute_with(|| {
		System::set_block_number(1);

		assert_ok!(Currencies::transfer(Some(ALICE).into(), BOB, X_TOKEN_ID, 50));
		assert_eq!(Currencies::free_balance(X_TOKEN_ID, &ALICE), 50);
		assert_eq!(Currencies::free_balance(X_TOKEN_ID, &BOB), 150);
		System::assert_last_event(RuntimeEvent::Tokens(orml_tokens::Event::Transfer {
			currency_id: X_TOKEN_ID,
			from: ALICE,
			to: BOB,
			amount: 50,
		}));

		assert_ok!(<Currencies as MultiCurrency<AccountId>>::transfer(
			X_TOKEN_ID, &ALICE, &BOB, 10
		));
		assert_eq!(Currencies::free_balance(X_TOKEN_ID, &ALICE), 40);
		assert_eq!(Currencies::free_balance(X_TOKEN_ID, &BOB), 160);
		System::assert_last_event(RuntimeEvent::Tokens(orml_tokens::Event::Transfer {
			currency_id: X_TOKEN_ID,
			from: ALICE,
			to: BOB,
			amount: 10,
		}));

		assert_ok!(<Currencies as MultiCurrency<AccountId>>::deposit(X_TOKEN_ID, &ALICE, 100));
		assert_eq!(Currencies::free_balance(X_TOKEN_ID, &ALICE), 140);
		System::assert_last_event(RuntimeEvent::Tokens(orml_tokens::Event::Deposited {
			currency_id: X_TOKEN_ID,
			who: ALICE,
			amount: 100,
		}));

		assert_ok!(<Currencies as MultiCurrency<AccountId>>::withdraw(X_TOKEN_ID, &ALICE, 20));
		assert_eq!(Currencies::free_balance(X_TOKEN_ID, &ALICE), 120);
		System::assert_last_event(RuntimeEvent::Tokens(orml_tokens::Event::Withdrawn {
			currency_id: X_TOKEN_ID,
			who: ALICE,
			amount: 20,
		}));
	});
}

#[test]
fn erc20_transfer_should_work() {
	ExtBuilder::default()
		.balances(vec![
			(ALICE, NATIVE_CURRENCY_ID, 100_000_000_000),
			(BOB, NATIVE_CURRENCY_ID, 100000),
		])
		.build()
		.execute_with(|| {
			assert_noop!(
				Currencies::transfer(
					RuntimeOrigin::signed(ALICE),
					BOB,
					CurrencyId::Erc20(erc20_address()),
					100
				),
				pallet_erc20::Error::<Test>::InvalidReturnValue,
			);

			deploy_contracts();

			assert_ok!(Currencies::transfer(
				RuntimeOrigin::signed(ALICE),
				BOB,
				CurrencyId::Erc20(erc20_address()),
				100
			));

			assert_eq!(Currencies::free_balance(CurrencyId::Erc20(erc20_address()), &BOB,), 100);
		});
}

#[test]
fn erc1155_transfer_should_work() {
	ExtBuilder::default()
		.balances(vec![
			(ALICE, NATIVE_CURRENCY_ID, 100_000_000_000),
			(BOB, NATIVE_CURRENCY_ID, 100000),
		])
		.build()
		.execute_with(|| {
			assert_noop!(
				Currencies::transfer(
					RuntimeOrigin::signed(ALICE),
					BOB,
					CurrencyId::Erc1155(erc1155_address(), U256::from(0)),
					100
				),
				Error::<Test>::BalanceTooLow
			);

			deploy_erc1155_contracts();

			assert_eq!(
				Currencies::free_balance(
					CurrencyId::Erc1155(erc1155_address(), U256::from(0)),
					&BOB,
				),
				0
			);

			assert_noop!(
				Currencies::transfer(
					RuntimeOrigin::signed(BOB),
					CHARLIE,
					CurrencyId::Erc1155(erc1155_address(), U256::from(0)),
					100
				),
				Error::<Test>::BalanceTooLow
			);

			assert_ok!(Currencies::transfer(
				RuntimeOrigin::signed(ALICE),
				BOB,
				CurrencyId::Erc1155(erc1155_address(), U256::from(0)),
				100
			));

			assert_eq!(
				Currencies::free_balance(
					CurrencyId::Erc1155(erc1155_address(), U256::from(0)),
					&BOB,
				),
				100
			);
		});
}

#[test]
fn local_asset_transfer_should_work() {
	ExtBuilder::default().one_hundred_for_alice_n_bob().build().execute_with(|| {
		assert_ok!(Currencies::transfer(
			RuntimeOrigin::signed(ALICE),
			CHARLIE,
			CurrencyId::LocalAsset(999),
			100
		));

		assert_eq!(Currencies::free_balance(CurrencyId::LocalAsset(999), &CHARLIE,), 100);
	});
}
