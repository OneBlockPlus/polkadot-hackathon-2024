<div align="center">

# Polkattest Parachain

<img height="70px" alt="Polkadot SDK Logo" src="https://github.com/paritytech/polkadot-sdk/raw/master/docs/images/Polkadot_Logo_Horizontal_Pink_White.png#gh-dark-mode-only"/>
<img height="70px" alt="Polkadot SDK Logo" src="https://github.com/paritytech/polkadot-sdk/raw/master/docs/images/Polkadot_Logo_Horizontal_Pink_Black.png#gh-light-mode-only"/>
<br /><br />
<a href="https://www.psylabs.io/"><img src="https://www.psylabs.io/assets/PsylabsLogo-BTz7r7n-.png" alt="PsyLabs Logo"/></a>

[PsyLabs](https://www.psylabs.io/)

> This node was created based on the [Pop CLI](https://github.com/r0gue-io/pop-cli) contracts parachain template.

> Which is based on the [Polkadot SDK](https://github.com/paritytech/polkadot-sdk) and is updated by [R0GUE](r0gue.io) after releases in the main [Polkadot SDK monorepo](https://github.com/paritytech/polkadot-sdk).

</div>

* ⏫ This parachain provides the infrastructure necessary to implement the attestations architecture.

* 🔧 Its [runtime](./runtime) is configured to support WebAssembly smart contracts.

---

## 🚀 Getting Started

To set up and run the Polkattest Parachain, follow these instructions.

### Prerequisites

Ensure you have the [POP CLI](https://github.com/r0gue-io/pop-cli) installed. If not, use the following command:

### 1. Install POP CLI

```bash
pop install
```
### 2. Compile the Parachain
Once the POP CLI is installed, compile the parachain by running the following command:

```bash
pop build --release
```
### 3. Run the Parachain
After compiling the parachain, you can bring it up using the network configuration:

```bash
pop up parachain -f ./network.toml
```

## Contact
For any questions or additional information, feel free to reach out at [hello@psylabs.io](mailto:hello@psylabs.io)
