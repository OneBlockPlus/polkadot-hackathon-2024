<div align="center">

# Assets Parachain Template

<img height="70px" alt="Polkadot SDK Logo" src="https://github.com/paritytech/polkadot-sdk/raw/master/docs/images/Polkadot_Logo_Horizontal_Pink_White.png#gh-dark-mode-only"/>
<img height="70px" alt="Polkadot SDK Logo" src="https://github.com/paritytech/polkadot-sdk/raw/master/docs/images/Polkadot_Logo_Horizontal_Pink_Black.png#gh-light-mode-only"/>
<br /><br />
<a href="r0gue.io"><img src="https://github.com/user-attachments/assets/96830651-c3db-412a-9cb4-6fcd8ea6231b" alt="R0GUE Logo" /></a>

[![Twitter URL](https://img.shields.io/twitter/follow/Pop?style=social)](https://x.com/onpopio/)
[![Twitter URL](https://img.shields.io/twitter/follow/R0GUE?style=social)](https://twitter.com/gor0gue)
[![Telegram](https://img.shields.io/badge/Telegram-gray?logo=telegram)](https://t.me/onpopio)

> This is the [Pop CLI](https://github.com/r0gue-io/pop-cli) assets parachain template.

> It is based on the [Polkadot SDK](https://github.com/paritytech/polkadot-sdk) and is updated by [R0GUE](r0gue.io) after releases in the main [Polkadot SDK monorepo](https://github.com/paritytech/polkadot-sdk).

</div>

* ⏫ This template provides a starting point to build an assets [parachain](https://wiki.polkadot.network/docs/learn-parachains).

* ☁️ It is based on the
[Cumulus](https://paritytech.github.io/polkadot-sdk/master/polkadot_sdk_docs/polkadot_sdk/cumulus/index.html) framework.

* 🔧 Its [runtime](./runtime) is configured with fungible and non-fungilble asset functionalities, including asset fractionalization.

## Template Structure

A Polkadot SDK based project such as this one consists of:

* 💿 [Node](./node/README.md) - the binary application.
* 🧮 [Runtime](./runtime/README.md) - the core logic of the parachain.

## Getting Started

#### Install [Pop CLI](https://github.com/r0gue-io/pop-cli) - the all-in-one Polkadot development tool:
> Detailed installation instructions can be found [here](https://learn.onpop.io/v/cli/installing-pop-cli).
```
cargo install --force --locked pop-cli
```

#### Start a new parachain project with this template:
```
pop new parachain
```
> When prompted, select 'Pop' as the template provider and 'Assets' as the type of parachain.
>
> More info can be found [here](https://learn.onpop.io/v/appchains/guides/create-a-new-parachain/create-an-assets-parachain).

#### Learn how to run your parachain using the `pop up` command:
```sh
pop up parachain -f ./network.toml
```
> 👉 https://learn.onpop.io/v/appchains/guides/running-your-parachain

### Learning Resources

* 🧑‍🏫 To learn about Polkadot in general, [Polkadot.network](https://polkadot.network/) website is a good starting point.

  * ⭕ Learn more about parachains [here](https://wiki.polkadot.network/docs/learn-parachains).

* 🧑‍🔧 For technical introduction, [here](https://github.com/paritytech/polkadot-sdk#-documentation) are
the Polkadot SDK documentation resources.

* 📖 To learn how to develop parachains with Pop CLI, read the [guides](https://learn.onpop.io/v/appchains).

### Support

* 💡 Be part of our passionate community of Web3 pioneers. [Join our Telegram](https://t.me/onpopio)!

* 👥 Additionally, there are [GitHub issues](https://github.com/r0gue-io/base-parachain/issues) and
[Polkadot Stack Exchange](https://polkadot.stackexchange.com/).

