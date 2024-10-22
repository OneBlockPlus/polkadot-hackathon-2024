import type { ExtensionConfiguration } from "@polkadot-onboard/injected-wallets";

export const extensionConfig: ExtensionConfiguration = {
  disallowed: [],
  supported: [
    {
      id: "polkadot-js",
      title: "polkadotJS",
      description: "Basic account injection and signer",
      urls: {
        main: "https://polkadot.js.org/",
        browsers: {
          chrome:
            "https://chrome.google.com/webstore/detail/polkadot%7Bjs%7D-extension/mopnmbcafieddcagagdcbnhejhlodfdd",
          firefox:
            "https://addons.mozilla.org/en-US/firefox/addon/polkadot-js-extension/",
        },
      },
      iconUrl: "/images/polkadot-js.svg",
    },
    {
      id: "talisman",
      title: "talisman",
      description:
        "Talisman is a Polkadot wallet that unlocks a new world of multichain web3 applications in the Paraverse",
      urls: {
        main: "https://www.talisman.xyz/",
        browsers: {
          chrome:
            "https://chrome.google.com/webstore/detail/talisman-wallet/fijngjgcjhjmmpcmkeiomlglpeiijkld",
          firefox:
            "https://addons.mozilla.org/en-US/firefox/addon/talisman-wallet-extension/",
        },
      },
      iconUrl: "/images/talisman-icon.svg",
    },
    {
      id: "enkrypt",
      title: "enkrypt",
      description:
        "Enkrypt is a multichain, non-custodial, and open-source web3 wallet developed by MEW(MyEtherWallet), the same team that has made Ethereum easy and secure to use since 2015. Enkrypt allows users to manage all their crypto assets and access favorite DApps across multiple chains and ecosystems including Ethereum/EVM, Dotsama, and beyond.",
      urls: {
        main: "https://www.enkrypt.com/",
        browsers: {
          chrome:
            "https://chrome.google.com/webstore/detail/enkrypt/kkpllkodjeloidieedojogacfhpaihoh",
          firefox: "https://addons.mozilla.org/en-US/firefox/addon/enkrypt/",
          opera: "https://addons.opera.com/en/extensions/details/enkrypt/",
        },
      },
      iconUrl: "/images/enkrypt-icon.svg",
    },
    {
      id: "polkagate",
      title: "PolkaGate",
      description:
        "PolkaGate browser extension/wallet is a non-custodial wallet that allows you to securely store, manage, and interact with your Polkadot and Kusama assets. It offers a user-friendly interface and easy access to the Polkadot and Kusama ecosystems, allowing you to participate in staking, crowdloans, and other activities. With PolkaGate, you are in complete control of your assets, as your private keys are stored securely on your device, and you can easily manage multiple accounts and switch between them with ease. PolkaGate is an essential tool for anyone looking to participate in the growing Polkadot and Kusama ecosystems.",
      urls: {
        main: "https://polkagate.xyz/",
        browsers: {
          chrome:
            "https://chromewebstore.google.com/detail/polkagate-the-gateway-to/ginchbkmljhldofnbjabmeophlhdldgp",
          firefox: "https://addons.mozilla.org/en-US/firefox/addon/polkagate/",
        },
      },
      iconUrl: "/images/polkagate-icon.svg",
    },
    {
      id: "subwallet",
      title: "SubWallet",
      description:
        "Comprehensive Polkadot, Substrate & Ethereum wallet Empower the next blockchain revolution with a one-stop-shop for the multichain",
      urls: {
        main: "https://www.subwallet.app/",
        browsers: {
          chrome:
            "https://chrome.google.com/webstore/detail/subwallet-polkadot-extens/onhogfjeacnfoofkfgppdlbmlmnplgbn",
          firefox: "https://addons.mozilla.org/en-US/firefox/addon/subwallet/",
        },
      },
      iconUrl: "/images/subwallet-icon.svg",
    },
  ],
};
