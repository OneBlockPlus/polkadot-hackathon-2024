use crate::mock::*;
use frame_support::assert_ok;
use sp_core::ConstU32;
use sp_runtime::BoundedVec;

#[test]
fn it_works_for_default_value() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        System::set_block_number(1);
        // Dispatch a signed extrinsic.
        assert_ok!(FheVote::initiate_vote(
            RuntimeOrigin::signed(1),
            <BoundedVec<u8, ConstU32<1000000>>>::try_from(vec![0u8; 5]).unwrap(),
        ));

        // Vote Yes two times
        assert_ok!(FheVote::vote(RuntimeOrigin::signed(1), 0, crate::Vote::Yes));
        assert_ok!(FheVote::vote(RuntimeOrigin::signed(1), 0, crate::Vote::Yes));

        // Vote No one time
        assert_ok!(FheVote::vote(RuntimeOrigin::signed(1), 0, crate::Vote::No));

        // Finalize the vote
        assert_ok!(FheVote::finalize_vote(RuntimeOrigin::signed(1), 0,));
    });
}
