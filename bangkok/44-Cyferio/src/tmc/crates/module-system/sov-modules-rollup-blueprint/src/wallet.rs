use async_trait::async_trait;
use borsh::{BorshDeserialize, BorshSerialize};
use serde::de::DeserializeOwned;
use serde::Serialize;
use sov_cli::wallet_state::WalletState;
use sov_cli::workflows::keys::KeyWorkflow;
use sov_cli::workflows::rpc::RpcWorkflows;
use sov_cli::workflows::transactions::TransactionWorkflow;
use sov_cli::{clap, wallet_dir};
use sov_modules_api::clap::Parser;
use sov_modules_api::cli::{CliFrontEnd, CliTxImportArg, JsonStringArg};
use sov_modules_api::execution_mode::ExecutionMode;
use sov_modules_api::{CliWallet, DispatchCall, Spec};
use sov_rollup_interface::zk::{ZkvmGuest, ZkvmHost};

use crate::{FullNodeBlueprint, RollupBlueprint};

#[derive(clap::Subcommand)]
#[command(author, version, about, long_about = None)]
enum Workflows<File: clap::Subcommand, Json: clap::Subcommand, S: Spec> {
    #[clap(subcommand)]
    Transactions(TransactionWorkflow<File, Json>),
    #[clap(subcommand)]
    Keys(KeyWorkflow<S>),
    #[clap(subcommand)]
    Rpc(RpcWorkflows<S>),
}

#[derive(clap::Parser)]
#[command(author, version, about = None, long_about = None)]
struct CliApp<File: clap::Subcommand, Json: clap::Subcommand, S: Spec> {
    #[clap(subcommand)]
    workflow: Workflows<File, Json, S>,
}

/// Generic wallet for any type that implements FullNodeBlueprint.
#[async_trait]
pub trait WalletBlueprint<M: ExecutionMode>: FullNodeBlueprint<M>
where
    // The types here a quite complicated but they are never exposed to the user
    // as the WalletTemplate is implemented for any types that implements FullNodeBlueprint.
    <Self::InnerZkvmHost as ZkvmHost>::Guest: ZkvmGuest<Verifier = <Self::Spec as Spec>::InnerZkvm>,
    <Self::OuterZkvmHost as ZkvmHost>::Guest: ZkvmGuest<Verifier = <Self::Spec as Spec>::OuterZkvm>,
    Self::Spec: serde::Serialize + serde::de::DeserializeOwned + Send + Sync,

    <Self as RollupBlueprint<M>>::Runtime: CliWallet,

    <Self as RollupBlueprint<M>>::DaSpec: serde::Serialize + serde::de::DeserializeOwned,

    <<Self as RollupBlueprint<M>>::Runtime as DispatchCall>::Decodable:
        serde::Serialize + serde::de::DeserializeOwned + BorshSerialize + Send + Sync,

    <<Self as RollupBlueprint<M>>::Runtime as CliWallet>::CliStringRepr<JsonStringArg>: TryInto<
        <<Self as RollupBlueprint<M>>::Runtime as DispatchCall>::Decodable,
        Error = serde_json::Error,
    >,
{
    /// Generates wallet cli for the runtime.
    async fn run_wallet<File: clap::Subcommand, Json: clap::Subcommand>(
    ) -> Result<(), anyhow::Error>
    where
        <<Self as RollupBlueprint<M>>::Runtime as DispatchCall>::Decodable:
            BorshSerialize + BorshDeserialize + Serialize + DeserializeOwned,
        File: CliFrontEnd<<Self as RollupBlueprint<M>>::Runtime> + CliTxImportArg + Send + Sync,
        Json: CliFrontEnd<<Self as RollupBlueprint<M>>::Runtime> + CliTxImportArg + Send + Sync,

        File: TryInto<
            <<Self as RollupBlueprint<M>>::Runtime as CliWallet>::CliStringRepr<JsonStringArg>,
            Error = std::io::Error,
        >,
        Json: TryInto<
            <<Self as RollupBlueprint<M>>::Runtime as CliWallet>::CliStringRepr<JsonStringArg>,
            Error = std::convert::Infallible,
        >,
    {
        let app_dir = wallet_dir()?;

        std::fs::create_dir_all(app_dir.as_ref())?;
        let wallet_state_path = app_dir.as_ref().join("wallet_state.json");

        let mut wallet_state: WalletState<
            <<Self as RollupBlueprint<M>>::Runtime as DispatchCall>::Decodable,
            Self::Spec,
        > = WalletState::load(&wallet_state_path)?;

        let invocation = CliApp::<File, Json, Self::Spec>::parse();

        match invocation.workflow {
            Workflows::Transactions(tx) => tx
                .run::<<Self as RollupBlueprint<M>>::Runtime, Self::Spec, JsonStringArg, _, _, _>(
                    &mut wallet_state,
                    app_dir,
                    std::io::stdout(),
                )?,
            Workflows::Keys(inner) => inner.run(&mut wallet_state, app_dir)?,
            Workflows::Rpc(inner) => {
                inner.run(&mut wallet_state, app_dir).await?;
            }
        }

        wallet_state.save(wallet_state_path)
    }
}
