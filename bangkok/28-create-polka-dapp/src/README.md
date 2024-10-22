# create-polka-dapp <a href="https://www.npmjs.com/package/create-polka-dapp"><img src="https://img.shields.io/npm/v/create-polka-dapp" alt="npm package"></a>

## Make Starting Up your Polkadot / Substrate dApp Easy and Convenient

> **Compatibility Note:**
> All templates use Vite which requires [Node.js](https://nodejs.org/en/) version 18+, 20+. However, some templates require a higher Node.js version to work, please upgrade if your package manager warns about it.

With NPM:

```bash
$ npm create polka-dapp@latest
```

With Yarn:

```bash
$ yarn create polka-dapp
```

With PNPM:

```bash
$ pnpm create polka-dapp
```

With Bun:

```bash
$ bun create polka-dapp
```

Then follow the prompts!

Currently supported template presets include:

- FRONTEND

  - `next - app router + ts + @polkadot-onboard`
  - `next - pages router + ts + @polkadot-onboard`
  - `react + ts + @polkadot-onboard`
  - `svelte + ts + @polkadot-onboard` 🚧 Work In Progress
  - `VARA + next + ts + @polkadot-onboard` 🚧 Work In Progress

- CONTRACT

  - `!ink + development lifecycle utilities`

- FRONTEND + CONTRACT

## New CLI Features

We've added new utility features to the CLI to enhance your Polkadot dApp development experience:

1. **Contract Development Tools**: Easily scaffold and manage your smart contracts.
2. **Network Configuration**: Streamlined setup for connecting to different Polkadot networks.
3. **Testing Utilities**: Integrated tools for unit and integration testing of your dApp.
4. **New Frontend Frameworks**: Added new frontend frameworks to the templates.
5. **Removed Support for JS frontend templates**: Decided to keep only TS templates as developers should use Typescript when interacting with the polkadot api library.

## Future Additions

Here are some exciting features on `create-polka-dapp` roadmap:

1. **Standalone Contract Development Library**: We're extracting our contract development utility to create a tool on its own making it a separate library for more flexibility and easier maintenance.

2. **Modular Wallet Connection Component**: The wallet connection functionality will be available as a standalone, customizable component library, so developers can decide to use the component if they

3. **Enhanced CLI Capabilities**: More commands and options to further streamline your development workflow.

4. **Additional Framework Support**: We're planning to add support for more frontend frameworks and build tools.

Stay tuned for these updates, and feel free to contribute or suggest features on our GitHub repository!

## Happy Building on Polkadot!!
