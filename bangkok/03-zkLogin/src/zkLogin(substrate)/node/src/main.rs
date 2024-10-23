//! Substrate Node Template CLI library.
#![warn(missing_docs)]

use node_template::command;

fn main() -> sc_cli::Result<()> {
    command::run()
}
