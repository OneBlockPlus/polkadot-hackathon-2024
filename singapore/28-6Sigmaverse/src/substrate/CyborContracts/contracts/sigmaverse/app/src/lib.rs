#![no_std]

use sigmaverse_gamestate as gamestate;
use sails_rs::{cell::RefCell, prelude::*};

// mod counter;
mod enemy;
mod ping;
mod references;
mod cybor_nft;


static mut BATTLE_DATA: Option<RefCell<gamestate::SigmaverseGameData>> = None;

static mut CYBOR_STATE: Option<RefCell<cybor_nft::CyborState>> = None;

static mut REF_DATA: u8 = 42;

pub const SIGMAVERSE_PUB1:&str = "qsh9ryierxipcfi84lnigg4qpwaumwa0x36g8docxih31wlmpbpvxnd73xlo53bp";
pub const SIGMAVERSE_PUB2:&str = "epp0n7ujb2vyfp8n0r7hnzttun2htvv0mf72mn65vse3cr8l7j634ylythuaivew";
pub const SIGMAVERSE_PUB3:&str = "j7ddask5n7padhkoe03q25z0omc7v90u0oaftec3j2gpabyeqtdvsxu2o2nbq6vq";
pub const SIGMAVERSE_PUB4:&str = "j0oa5873d78mqou0kzhms37eb5x00xvonyz6c86tclxfppza926qwbd2e81nehed";
pub const SIGMAVERSE_PUB5:&str = "gl607wtyvp9kedezpgrxgk1smvanuqtge48nzmmzga94xosclwfe1dl887kq8fyq";
pub const SIGMAVERSE_PUB6:&str = "c8wgcl0i3f1w4jvlsp2v9azh07zmeqhu5onsc9t2hoo3zarngoojehd3j8fg84yx";
pub const SIGMAVERSE_PUB7:&str = "clw91sbfjufctkik04t3nfjconxuc9bko4yoro0ht8ifzvo91todfgzfuqa7tz71";


fn battle_data() -> &'static RefCell<gamestate::SigmaverseGameData> {
    unsafe {
        BATTLE_DATA
            .as_ref()
            .unwrap_or_else(|| panic!("`Battle` data should be initialized first"))
    }
}

fn cybor_state() -> &'static RefCell<cybor_nft::CyborState> {
    unsafe {
        CYBOR_STATE
            .as_ref()
            .unwrap_or_else(|| panic!("`CYBOR_STATE` should be initialized first"))
    }
}

pub struct SigmaverseProgram {
    // Counter data has the same lifetime as the program itself, i.e. it will
    // live as long as the program is available on the network.
    // counter_data: RefCell<counter::CounterData>,
}

#[program]
impl SigmaverseProgram {
    #[allow(clippy::should_implement_trait)]
    // Program constructor (called once at the very beginning of the program lifetime)
    pub fn default() -> Self {
        unsafe {
            BATTLE_DATA = Some(RefCell::new(gamestate::SigmaverseGameData::new(
                Default::default(),
                Default::default(),
            )));

            CYBOR_STATE = Some(RefCell::new(cybor_nft::CyborState::new(String::from("CYBOR-NFT"), String::from("CYBOR"), )))
        }
        // Self {
        //     counter_data: RefCell::new(counter::CounterData::new(Default::default())),
        // }
        Self{}
    }

    // Another program constructor (called once at the very beginning of the program lifetime)
    // pub fn new(counter: Option<u32>, enemy_position: Option<(i32, i32)>) -> Self {
    //     // cybor_nft::CyborNFTService::init(name, symbol, decimals);

    //     unsafe {
    //         let enemy_position = enemy_position.unwrap_or_default();
    //         BATTLE_DATA = Some(RefCell::new(gamestate::SigmaverseGameData::new(
    //             enemy_position.0,
    //             enemy_position.1,
    //         )));
    //     }
    //     Self {
    //         counter_data: RefCell::new(counter::CounterData::new(counter.unwrap_or_default())),
    //     }
    // }

    // Exposing service with overriden route
    #[route("ping_pong")]
    pub fn ping(&self) -> ping::PingService {
        ping::PingService::default()
    }

    // Exposing another service
    // pub fn counter(&self) -> counter::CounterService {
    //     counter::CounterService::new(&self.counter_data)
    // }

    /// TODO ///
    pub fn enemy(&self) -> enemy::EnemyService {
        enemy::EnemyService::new(gamestate::BattleService::new(battle_data()))
    }

    pub fn cybor_nft(&self) -> cybor_nft::CyborNFTService {
        cybor_nft::CyborNFTService::init(cybor_state())
    }

    pub fn references(&self) -> references::ReferenceService {
        #[allow(static_mut_refs)]
        unsafe {
            references::ReferenceService::new(&mut REF_DATA, "sigmaverse")
        }
    }
}
