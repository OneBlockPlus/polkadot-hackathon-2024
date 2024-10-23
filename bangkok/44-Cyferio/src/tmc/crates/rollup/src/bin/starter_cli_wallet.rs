//! This binary defines a cli wallet for interacting
//! with the rollup.

use sov_modules_api::cli::{FileNameArg, JsonStringArg};
use sov_modules_rollup_blueprint::WalletBlueprint;
#[cfg(all(feature = "mock_da", not(feature = "cyferio_da")))]
use sov_rollup_starter::mock_rollup::MockRollup as StarterRollup;
#[cfg(all(feature = "cyferio_da", not(feature = "mock_da")))]
use sov_rollup_starter::cyferio_rollup::CyferioRollup as StarterRollup;

use stf_starter::runtime::RuntimeSubcommand;

#[tokio::main]
async fn main() -> Result<(), anyhow::Error> {
    StarterRollup::run_wallet::<
        RuntimeSubcommand<FileNameArg, _, _>,
        RuntimeSubcommand<JsonStringArg, _, _>,
    >()
    .await
}
