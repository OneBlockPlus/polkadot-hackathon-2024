pub use currency::*;
/// DIR, the native token, uses 18 decimals of precision.
pub mod currency {
    use crate::Balance;

    // Provide a common factor between runtimes based on a supply of 10_000_000 tokens.
    pub const SUPPLY_FACTOR: Balance = 100;

    pub const WEI: Balance = 1;
    pub const KILOWEI: Balance = 1_000;
    pub const MEGAWEI: Balance = 1_000_000;
    pub const GIGAWEI: Balance = 1_000_000_000;
    pub const MICRODIR: Balance = 1_000_000_000_000;
    pub const MILLIDIR: Balance = 1_000_000_000_000_000;
    pub const DIR: Balance = 1_000_000_000_000_000_000;
    pub const KILODIR: Balance = 1_000_000_000_000_000_000_000;

    pub const TRANSACTION_BYTE_FEE: Balance = 10 * MICRODIR * SUPPLY_FACTOR;
    pub const STORAGE_BYTE_FEE: Balance = 100 * MICRODIR * SUPPLY_FACTOR;
    pub const WEIGHT_FEE: Balance = 100 * KILOWEI * SUPPLY_FACTOR;

    pub const fn deposit(items: u32, bytes: u32) -> Balance {
        items as Balance * 100 * MILLIDIR * SUPPLY_FACTOR + (bytes as Balance) * STORAGE_BYTE_FEE
    }
}
/// Fee-related.
pub mod fee {
    use crate::Balance;
    use frame_support::weights::{
        constants::ExtrinsicBaseWeight, WeightToFeeCoefficient, WeightToFeeCoefficients,
        WeightToFeePolynomial,
    };
    use smallvec::smallvec;
    pub use sp_runtime::Perbill;

    /// Handles converting a weight scalar to a fee value, based on the scale and granularity of the
    /// node's balance type.
    ///
    /// This should typically create a mapping between the following ranges:
    ///   - `[0, MAXIMUM_BLOCK_WEIGHT]`
    ///   - `[Balance::min, Balance::max]`
    ///
    /// Yet, it can be used for any other sort of change to weight-fee. Some examples being:
    ///   - Setting it to `0` will essentially disable the weight fee.
    ///   - Setting it to `1` will cause the literal `#[weight = x]` values to be charged.
    pub struct WeightToFee;
    impl WeightToFeePolynomial for WeightToFee {
        type Balance = Balance;
        fn polynomial() -> WeightToFeeCoefficients<Self::Balance> {
            // in Rococo, extrinsic base weight (smallest non-zero weight) is mapped to 1 MILLIUNIT:
            // in our template, we map to 1/10 of that, or 1/10 MILLIUNIT
            let p = super::currency::MILLIDIR / 10;
            let q = 100 * Balance::from(ExtrinsicBaseWeight::get());
            smallvec![WeightToFeeCoefficient {
                degree: 1,
                negative: false,
                coeff_frac: Perbill::from_rational(p % q, q),
                coeff_integer: p / q,
            }]
        }
    }
}
