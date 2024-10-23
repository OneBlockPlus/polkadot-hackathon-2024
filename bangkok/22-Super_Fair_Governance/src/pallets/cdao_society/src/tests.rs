use super::*;
use crate::{mock::*, Error, Event};
use frame_support::{assert_noop, assert_ok, debug};
use frame_system::Config;
use frame_system::EventRecord;

#[test]
fn it_works_for__kitties_default_value() {
    new_test_ext().execute_with(|| {
        run_to_block(1);
        run_to_block(2);
    });
}

//#[should_panic(expected = "caller should signed!")]
//测试溢出，测试panic……
#[test]
fn it_works_for_kitties_create_failed() {
    new_test_ext().execute_with(|| {
        run_to_block(1);
        let _alice: u64 = 22;
        // let caller = <<Test as Config>::RuntimeOrigin>::none();
        // let alice_account_id = system::RawOrigin::<u64>::from(alice).into();
        //  let res = Kitties::create(caller);
        // assert!(res.is_err());
        //    assert_ok!(pallet_kitties::call::create
        //    我们预期这个调用会返回一个错误
        //    Kitties::create(caller);
    });

    // assert_ok!(Kitties::create(caller2));
}
