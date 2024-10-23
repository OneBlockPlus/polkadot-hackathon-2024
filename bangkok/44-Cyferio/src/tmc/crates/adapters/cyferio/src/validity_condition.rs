use core::convert::Infallible;
use core::marker::PhantomData;

use anyhow::Error;
use borsh::{BorshDeserialize, BorshSerialize};
use serde::{Deserialize, Serialize};
use sha2::Digest;
use sov_rollup_interface::zk::{ValidityCondition, ValidityConditionChecker};

#[derive(
    Debug, BorshDeserialize, BorshSerialize, Serialize, Deserialize, PartialEq, Clone, Copy, Eq,
)]
pub struct CyferioValidityCond {
    pub is_valid: bool,
}

impl Default for CyferioValidityCond {
    fn default() -> Self {
        Self { is_valid: true }
    }
}

impl ValidityCondition for CyferioValidityCond {
    type Error = Infallible;

    fn combine<H: Digest>(&self, rhs: Self) -> Result<Self, Self::Error> {
        Ok(CyferioValidityCond {
            is_valid: self.is_valid && rhs.is_valid,
        })
    }
}

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Debug)]
pub struct CyferioValidityCondChecker<Cond: ValidityCondition> {
    phantom: PhantomData<Cond>,
}

impl ValidityConditionChecker<CyferioValidityCond> for CyferioValidityCondChecker<CyferioValidityCond> {
    type Error = Error;

    fn check(&mut self, condition: &CyferioValidityCond) -> Result<(), Self::Error> {
        if condition.is_valid {
            Ok(())
        } else {
            Err(anyhow::format_err!("Invalid Cyferio validity condition"))
        }
    }
}

impl<Cond: ValidityCondition> CyferioValidityCondChecker<Cond> {
    pub fn new() -> Self {
        Self {
            phantom: Default::default(),
        }
    }
}

impl<Cond: ValidityCondition> Default for CyferioValidityCondChecker<Cond> {
    fn default() -> Self {
        Self::new()
    }
}