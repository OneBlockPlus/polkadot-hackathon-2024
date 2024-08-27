use sigmaverse_gamestate::BattleService;
use sails_rs::prelude::*;

#[derive(Encode, TypeInfo)]
#[codec(crate = sails_rs::scale_codec)]
#[scale_info(crate = sails_rs::scale_info)]
enum EnemyEvents {
    Attack,
}

pub struct EnemyService {
    battle: BattleService,
}

impl EnemyService {
    pub fn new(battle: BattleService) -> Self {
        Self {
            battle,
        }
    }
}

impl AsRef<BattleService> for EnemyService {
    fn as_ref(&self) -> &BattleService {
        &self.battle
    }
}

#[service(extends = [BattleService], events = EnemyEvents)]
impl EnemyService {
    pub fn make_hit(&mut self) -> &'static str {
        self.notify_on(EnemyEvents::Attack).unwrap();
        "TODO!"
    }
}
