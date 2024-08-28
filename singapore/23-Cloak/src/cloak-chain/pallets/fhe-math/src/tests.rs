use crate::mock::*;
use frame_support::assert_ok;

#[test]
fn it_works_for_default_value() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        System::set_block_number(1);
        // Dispatch a signed extrinsic.
        assert_ok!(FheMath::encrypt_numbers(RuntimeOrigin::signed(1), 10, 20));

        // Add two numbers
        assert_ok!(FheMath::decrypt_result(
            RuntimeOrigin::signed(1),
            0,
            crate::Operation::Add
        ));

        // Subtract two numbers
        assert_ok!(FheMath::decrypt_result(
            RuntimeOrigin::signed(1),
            0,
            crate::Operation::Sub
        ));

        // Multiply two numbers
        assert_ok!(FheMath::decrypt_result(
            RuntimeOrigin::signed(1),
            0,
            crate::Operation::Mul
        ));
    });
}
