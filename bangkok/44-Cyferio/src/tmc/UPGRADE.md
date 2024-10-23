# Intro

This tutorial describes the process of upgrading rollup starter to the latest SDK version.

Please take your time to read the whole tutorial first and familiarize yourself with overall picture. 

There are many small, but important details, so it is recommended to take it slow.

# Upgrading rollup starter to the new version of Sovereign SDK.

Rollup starter can be run in 2 places: locally and on a remote machine using Ansible.
Rollup starter supports 2 Data Availability layers: Mock and Celestia.
All 4 variants needs to be checked.

|          | Local          | Remote        |
| -------- | -------------- | ------------- |
| Mock DA  | SQlite         | SQLite        |
| Celestia | Docker compose | Mocha testnet |

The following order is recommended:

1. [Local MockDa](#local-mockda): Make sure project compiles, tests are passing, node is running.
2. [Local Celestia](#local-celestia): Same as previous, but it works with Celestia
3. [Remote MockDa](#remote-mockda): Checks that automation changes are applied properly.
4. [Remote Celestia](#remote-celestia): Scenario the most closes to testnet.

# Steps

After completing each step, please make sure always check for any warnings or oddities.
Each step describes what changes needs to be done. After completing all steps, please run rollup in given configuration and run some requests against it.

## Basic

- [ ] Clean up previous build data if available: `make clean`. Also clean up `~/.sov_cli_wallet` if there are problems during deployment and are no important keys there.
- [ ] Identify all changes from Sovereign SDK. In sovereign SDK repo: `git diff EXISTING_COMMIT_IN_CARGO_TOML COMMIT_UPDATE_TO -- docs/CHANGELOG.md`
 - [ ] Replace git commit hash in main `Cargo.toml` and in provers. Make sure that other 3rd party dependencies have correct versions. Helper script ` ./scripts/update_rev.sh NEW_REV` can be used 
- [ ] [`Cargo.toml`](./Cargo.toml)
  - [ ] [`risc0/guest-celestia/Cargo.toml`](crates/provers/risc0/guest-celestia/Cargo.toml)
  - [ ] [`risc0/guest-mock/Cargo.toml`](crates/provers/risc0/Cargo.toml)
- [ ] Adjust sample requests in [`test-data/requests`](./test-data/requests)
- [ ] Adjust [`constants.toml`](./constants.toml). This file is used for all configurations: local and remote
- [ ] Make sure `make lint` and `cargo test` are passing.

## If Rust toolchains has been upgraded

If a Rust native or zkVM toolchain version has changed:

- [ ] Update local [`rust-toolchain.toml`](./rust-toolchain.toml)
- [ ] Update risc0 toolchain in [`Makefile`](./Makefile) and in [deps.yaml](./automation/roles/common/tasks/deps.yaml)
- [ ] Review other dependencies in [deps.yaml](./automation/roles/common/tasks/deps.yaml) if they are ok.

## Local MockDa

- [ ] Rollup config [`rollup_config.toml`](./rollup_config.toml)
- [ ] Genesis params in folder [`test-data/genesis/mock`](./test-data/genesis/mock)

Steps to do testing described in main [README.md](./README.md)

## Local Celestia

- [ ] Rollup config [celestia_rollup_config.toml](./celestia_rollup_config.toml)
- [ ] Genesis params in folder [`test-data/genesis/celestia`](./test-data/genesis/celestia)

Steps to take testing are described in the main [README.md](./README.md#how-to-run-the-sov-rollup-starter-using-celestia-da) in the Celestia section.

## Remote MockDA

- [ ] Rollup config [rollup_config.toml.j2](./automation/roles/rollup/templates/mock/rollup_config.toml.j2)
- [ ] Genesis params in folder [`automation/roles/rollup/files/genesis`](./automation/roles/rollup/files/genesis) Which are common for all DAs and [`sequencer_registry.json.j2`](./automation/roles/rollup/templates/genesis/sequencer_registry.json.j2) which is DA-specific

Steps to take testing are described in the [README.md](./automation/README.md)

## Remote Celestia

- [ ] Rollup config [rollup_config.toml.j2](./automation/roles/rollup/templates/celestia/rollup_config.toml.j2)
- [ ] Genesis params in folder [`automation/roles/rollup/files/genesis`](./automation/roles/rollup/files/genesis) Which are common for all DAs and [`sequencer_registry.json.j2`](./automation/roles/rollup/templates/genesis/sequencer_registry.json.j2) which is DA-specific
- [ ] Celestia variables are updated for [testnet/variables.yaml](./automation/roles/data-availability/celestia/defaults/testnet/variables.yaml) and [mainnet](./automation/roles/data-availability/celestia/defaults/mainnet/variables.yaml). Important variables are:
  - `da_start_fromt`: Height from Celestia starts syncing. To make it faster, something more recent can be set
  - `da_rollup_start_from`: Height from which rollup starts. If there were some breaking changes, it is recommended to start from new height for testing.

Steps to take testing are described in the automation [README.md](./automation/README.md)

## More checks for remote deployment

- Check service is healthy: `systemctl status rollup`
- Check logs in `/mnt/logs` and system-wide: `journalctl -u rollup`. There should be no warnings and blocks should be progressing.
- SSH into host, clone SDK repo and run harness against the rollup.

# Debugging

- Some tasks in automation are used as triggers for other tasks, so their errors are silenced with these 2 parameters:
  ```yaml
  ignore_errors: yes
  failed_when: false
  ```
  If there is a need to debug, `failed_when: false` can be commented out, so actual error will be seen.
- Values can be debugged this way:
  ```yaml
  - name: get my value
    command: foo_bar
    register: initial_sync_state
    # This is way to print registered variable
  - name: debug sync-state
    debug:
      var: initial_sync_state
  ```
- If there's some issue that needs to be debugged on remotely, it is possible to shorten feedback loop: modify and recompile code on a remote machine. Then update service binary and rerun service.
