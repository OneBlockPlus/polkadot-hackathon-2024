# Description

o post transactions to the DA layer, a sequencer requires keys for that specific DA layer.

This document explains how to set up keys for Celestia.

There are several options:

1. Generate a new key. Use
   the [Mocha testnet faucet](https://docs.celestia.org/nodes/mocha-testnet#mocha-testnet-faucet) to obtain funds for
   new keys.
2. Import an existing key.

(!) This setup is suitable only for testing and should not be used in production under any circumstances

## Key generation

* This is a one-time process to generate a celestia keypair for the sequencer to post blobs to the Celestia DA layer
* Ensure go (version 1.22) is installed locally
* Ensure [dependencies are installed](https://docs.celestia.org/nodes/environment#install-dependencies) for Celestia as
  it described in Celestia tutorial.
* Checkout `celestia-node`

```
git clone https://github.com/celestiaorg/celestia-node.git
```

* Checkout the correct version `tags/v0.14.1`

```
git checkout tags/v0.14.1
```

* Build the celestia keygen tool

```
make cel-key
```

* Create the key with given `<key_name>` that the sequencer would be using to post blobs to the DA layer (we're
  using `mocha` as the p2p network because we're generating keys for the mocha testnet)

```
./cel-key add <key_name> --node.type light --p2p.network mocha
```

* Save the seed phrase
* Save the celestia address

Now new the key is available in the key storage:

`./cel-key --p2p.network mocha --node.type light list`

And you can check files
`ls -lahtr ~/.celestia-light-mocha-4/keys/keyring-test`

## Import Key

If you already posses mnemonic seed it can be added to keystore, just replace `<key_name>` with chosen name:

```
./cel-key --p2p.network mocha --node.type light add <key_name> --recover
```

## Configure

After the key is available in storage, we can continue configuration.

* Update data availability [testnet/variables.yaml](roles/data-availability/celestia/defaults/testnet/variables.yaml)
  with the key information:
    * `key_name` should be the same as the one you create the key with.
    * `key_address_filename` should be the corresponding `.address` file name.
      The filename is not the same as human-readable address.
      It might be complicated to identify which `.address` file belongs to which `.info` file, timestamp can be used to
      match.
    * Both the above should be visible in `ls -lahtr ~/.celestia-light-mocha-4/keys/keyring-test`
    * `da_rollup_address` should be corresponding `celestia1**` that has been generated.
* (Optional) In case of more custom setup, adjust
  rollup [testnet/variables.yaml](roles/rollup/defaults/testnet/variables.yaml) with the celestia address:
    * `sequencer_genesis_da_address` can be set to the different address if needed.
* Create `.keys` folder at the root of the repository. You can double check the
  info: `ls -lahtr ~/.celestia-light-mocha-4/keys/keyring-test`

```bash
pwd
# **/automation
mkdir -p ../.keys/<key_name>
cp ~/.celestia-light-mocha-4/keys/keyring-test/<key_name>.info ../.keys/<key_name>/
cp ~/.celestia-light-mocha-4/keys/keyring-test/<key_address>.address ../.keys/<key_name>/
```

* If the files are moved to the above location, nothing else needs to be changed in data
  availability [testnet/variables.yaml](roles/data-availability/celestia/defaults/testnet/variables.yaml)
* At the end of this process both the `.info` and `.address` files should be present inside following
  folder `../.keys/<keyname>`
