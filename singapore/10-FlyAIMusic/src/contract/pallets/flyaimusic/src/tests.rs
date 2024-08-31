use crate::{mock::*, Error, Event, MusicList};
use frame_support::{assert_noop, assert_ok};

#[test]
fn it_works_for_default_value() {
	new_test_ext().execute_with(|| {
		// Go past genesis block so events get deposited
		System::set_block_number(1);
		// Dispatch a signed extrinsic.
		// assert_ok!(FlyAiMusicModule::upload_music(RuntimeOrigin::signed(1), String::from("qwer.123.mp3")));
		
	});
}

