use sov_rollup_interface::services::da::Fee;

#[derive(Debug, Clone, Copy, PartialEq, Hash)]
pub struct CyferioFee(u128);

impl CyferioFee {
    pub const fn new(rate: u128) -> Self {
        Self(rate)
    }

    pub const fn zero() -> Self {
        Self(0)
    }
}

impl Fee for CyferioFee {
    type FeeRate = u64;

    fn fee_rate(&self) -> Self::FeeRate {
        self.0 as u64
    }

    fn set_fee_rate(&mut self, rate: Self::FeeRate) {
        self.0 = rate as u128;
    }

    fn gas_estimate(&self) -> u64 {
        10_000_000u64
    }
}
