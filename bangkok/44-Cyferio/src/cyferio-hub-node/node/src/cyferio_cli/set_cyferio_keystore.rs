use sc_cli::CliConfiguration;
use sc_cli::SharedParams;

#[derive(Debug, clap::Parser)]
pub struct SetKeystoreCmd {
    #[arg(short, long)]
    pub keystore_path: std::path::PathBuf,

	#[allow(missing_docs)]
	#[clap(flatten)]
	pub shared_params: SharedParams,
}

impl CliConfiguration for SetKeystoreCmd {
	fn shared_params(&self) -> &SharedParams {
		&self.shared_params
	}
}
