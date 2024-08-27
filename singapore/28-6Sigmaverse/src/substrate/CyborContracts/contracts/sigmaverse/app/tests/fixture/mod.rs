use core::cell::OnceCell;
use sigmaverse_client::{
    cybor_nft, CyborNft, SigmaverseFactory
};
// use gtest::Program;
use sails_rs::{events::Listener, gtest::calls::*, prelude::*};

const DEMO_WASM_PATH: &str = "../../../target/wasm32-unknown-unknown/debug/demo.opt.wasm";

pub(crate) const ADMIN_ID: u64 = 10;

pub(crate) struct Fixture {
    admin_id: u64,
    program_space: GTestRemoting,
    demo_program_code_id: OnceCell<CodeId>,
}

impl Fixture {

    pub(crate) fn new(admin_id: u64) -> Self {
        let program_space = GTestRemoting::new(admin_id.into());
        program_space.system().init_logger();
        Self {
            admin_id,
            program_space,
            demo_program_code_id: OnceCell::new(),
        }
    }

    pub(crate) fn sigmaverse_code_id(&self) -> CodeId {
        let demo_code_id = self
            .demo_program_code_id
            .get_or_init(|| self.program_space.system().submit_code_file(DEMO_WASM_PATH));
        *demo_code_id
    }

    pub(crate) fn sigmaverse_factory(&self) -> SigmaverseFactory<GTestRemoting> {
        SigmaverseFactory::new(self.program_space.clone())
    }

    // pub(crate) fn sigmaverse_program(&self, program_id: ActorId) -> Program<'_> {
    //     self.program_space
    //         .system()
    //         .get_program(program_id.as_ref())
    //         .unwrap()
    // }


    pub(crate) fn cybor_client(&self) -> CyborNft<GTestRemoting> {
        CyborNft::new(self.program_space.clone())
    }

    pub(crate) fn cybor_listener(&self) -> impl Listener<cybor_nft::events::CyborNftEvents> {
        cybor_nft::events::listener(self.program_space.clone())
    }

    // pub(crate) fn references_client(&self) -> References<GTestRemoting> {
    //     References::new(self.program_space.clone())
    // }
}
