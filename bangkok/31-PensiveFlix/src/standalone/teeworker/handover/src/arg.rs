use clap::Parser;

#[derive(Parser, Debug)]
#[command(
    about = "xxx",
    version,
    author
)]
pub struct Args {
    #[arg(
        long,
        help = "The backup path of the each version of pflix",
        default_value = "/opt/pflix/backups"
    )]
    pub previous_version_pflix_path: String,

    #[arg(
        long,
        help = "The backup path of the current version of pflix",
        default_value = "/opt/pflix/releases/current"
    )]
    pub current_version_pflix_path: String,

    #[arg(
        long,
        help = "pflix home",
        default_value = "/opt/pflix/data"
    )]
    pub pflix_data_path: String,

    #[arg(
        long,
        help = "Pflix log path for detect the status of previous pflix",
        default_value = "/tmp/pre_pflix.log"
    )]
    pub previous_pflix_log_path: String,

    #[arg(
        long,
        help = "Pflix log path for detect the status of new pflix",
        default_value = "/tmp/new_pflix.log"
    )]
    pub new_pflix_log_path: String,

    #[arg(
        long,
        help = "The relative path where each version of pflix stores protected files",
        default_value = "data/protected_files"
    )]
    pub pflix_protected_files_path: String,

    #[arg(
        long,
        help = "the relative path where each version of pflix stores checkpoint file",
        default_value = "data/storage_files"
    )]
    pub pflix_storage_files_path: String,

    #[arg(
        long,
        help = "old pflix start on this port",
        default_value = "1888"
    )]
    pub previous_pflix_port: u64,

    #[arg(
        long,
        help = "remote attestation type",
    )]
    pub ra_type: String,
}