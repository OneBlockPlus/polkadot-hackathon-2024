use crate::{
	mock::*, Deploy, DeployMetadata, Error, Event, Input, OmniverseTransaction, Output, Something,
};
use frame_support::{assert_noop, assert_ok};

#[test]
fn it_works_for_default_value() {
	new_test_ext().execute_with(|| {
		// Go past genesis block so events get deposited
		System::set_block_number(1);
		// Dispatch a signed extrinsic.
		assert_ok!(OmniverseOperation::do_something(RuntimeOrigin::signed(1), 42));
		// Read pallet storage and assert an expected result.
		assert_eq!(Something::<Test>::get(), Some(42));
		// Assert that the correct event was deposited
		System::assert_last_event(Event::SomethingStored { something: 42, who: 1 }.into());
	});
}

#[test]
fn correct_error_for_none_value() {
	new_test_ext().execute_with(|| {
		// Ensure the expected error is thrown when no value is present.
		assert_noop!(
			OmniverseOperation::cause_error(RuntimeOrigin::signed(1)),
			Error::<Test>::NoneValue
		);
	});
}

fn eip712_domain_hash() -> [u8; 32] {
	[
		146, 214, 37, 50, 153, 74, 114, 109, 0, 103, 212, 176, 115, 115, 208, 242, 147, 101, 154,
		55, 84, 225, 60, 138, 107, 31, 59, 137, 18, 120, 230, 75,
	]
}

fn get_deploy_data() -> Deploy {
	Deploy {
		metadata: DeployMetadata {
			salt: [163, 23, 134, 223, 147, 118, 191, 200],
			name: String::from("t1"),
			deployer: [
				61, 53, 250, 170, 237, 247, 80, 108, 254, 125, 109, 186, 50, 76, 195, 57, 210, 113,
				181, 172, 160, 86, 224, 147, 230, 223, 210, 161, 20, 173, 233, 59,
			],
			mint_amount: 100,
			price: 10000000000,
			total_supply: 3000000,
		},
		signature: [
			225, 126, 119, 81, 169, 135, 48, 22, 229, 179, 100, 70, 161, 67, 105, 224, 184, 88, 27,
			202, 186, 112, 98, 239, 35, 243, 173, 71, 38, 215, 129, 239, 127, 237, 104, 16, 119,
			14, 180, 10, 169, 18, 118, 253, 251, 12, 158, 3, 222, 198, 80, 124, 185, 193, 4, 159,
			187, 21, 55, 23, 81, 146, 101, 171, 27,
		],
		fee_inputs: vec![Input {
			txid: [
				0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
				0, 0, 0, 0,
			],
			index: 0,
			amount: 4200000000000000000,
			address: [
				61, 53, 250, 170, 237, 247, 80, 108, 254, 125, 109, 186, 50, 76, 195, 57, 210, 113,
				181, 172, 160, 86, 224, 147, 230, 223, 210, 161, 20, 173, 233, 59,
			],
		}],
		fee_outputs: vec![
			Output {
				address: [
					21, 61, 61, 1, 206, 228, 205, 230, 86, 172, 156, 239, 101, 194, 5, 234, 67, 90,
					33, 99, 72, 77, 122, 142, 146, 182, 11, 107, 109, 227, 95, 128,
				],
				amount: 1,
			},
			Output {
				address: [
					61, 53, 250, 170, 237, 247, 80, 108, 254, 125, 109, 186, 50, 76, 195, 57, 210,
					113, 181, 172, 160, 86, 224, 147, 230, 223, 210, 161, 20, 173, 233, 59,
				],
				amount: 4199999999999999999,
			},
		],
	}
}

#[test]
fn get_deploy_eip712() {
	let d = get_deploy_data();
	let tx = OmniverseTransaction::Deploy(d.clone());
	let hash = tx.eip712_hash(&eip712_domain_hash());
	assert_eq!(
		hash,
		[
			39, 57, 73, 171, 91, 192, 198, 128, 43, 82, 19, 181, 124, 197, 1, 253, 202, 216, 222,
			110, 212, 170, 108, 206, 227, 158, 246, 156, 41, 107, 240, 191
		]
	);
	let address = tx.verify_signature(&eip712_domain_hash()).unwrap();
	assert_eq!(d.fee_inputs[0].address, address);
}
