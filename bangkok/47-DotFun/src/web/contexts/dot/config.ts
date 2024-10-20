import { ExtensionConfiguration } from '@polkadot-onboard/injected-wallets'

export const APP_NAME = 'Monte Carlo'

export const CHAIN_URL = 'wss://fraa-flashbox-2941-rpc.a.stagenet.tanssi.network'

export const extensionConfig: ExtensionConfiguration = {
  disallowed: [],
  supported: [
    {
      id: 'polkadot-js',
      title: 'PolkadotJS',
      description: 'Basic account injection and signer',
      urls: {
        main: '',
        browsers: {
          chrome:
            'https://chrome.google.com/webstore/detail/polkadot%7Bjs%7D-extension/mopnmbcafieddcagagdcbnhejhlodfdd',
          firefox: 'https://addons.mozilla.org/en-US/firefox/addon/polkadot-js-extension/',
        },
      },
      iconUrl:
        'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiIHN0YW5kYWxvbmU9InllcyI/PjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iTGF5ZXJfMSIgeD0iMHB4IiB5PSIwcHgiIHZpZXdCb3g9IjE1IDE1IDE0MCAxNDAiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDE3MCAxNzA7em9vbTogMTsiIHhtbDpzcGFjZT0icHJlc2VydmUiPjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI+LmJnMHtmaWxsOiNGRjhDMDB9IC5zdDB7ZmlsbDojRkZGRkZGfTwvc3R5bGU+PGc+PGNpcmNsZSBjbGFzcz0iYmcwIiBjeD0iODUiIGN5PSI4NSIgcj0iNzAiPjwvY2lyY2xlPjxnPjxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik04NSwzNC43Yy0yMC44LDAtMzcuOCwxNi45LTM3LjgsMzcuOGMwLDQuMiwwLjcsOC4zLDIsMTIuM2MwLjksMi43LDMuOSw0LjIsNi43LDMuM2MyLjctMC45LDQuMi0zLjksMy4zLTYuNyBjLTEuMS0zLjEtMS42LTYuNC0xLjUtOS43QzU4LjEsNTcuNiw2OS41LDQ2LDgzLjYsNDUuM2MxNS43LTAuOCwyOC43LDExLjcsMjguNywyNy4yYzAsMTQuNS0xMS40LDI2LjQtMjUuNywyNy4yIGMwLDAtNS4zLDAuMy03LjksMC43Yy0xLjMsMC4yLTIuMywwLjQtMywwLjVjLTAuMywwLjEtMC42LTAuMi0wLjUtMC41bDAuOS00LjRMODEsNzMuNGMwLjYtMi44LTEuMi01LjYtNC02LjIgYy0yLjgtMC42LTUuNiwxLjItNi4yLDRjMCwwLTExLjgsNTUtMTEuOSw1NS42Yy0wLjYsMi44LDEuMiw1LjYsNCw2LjJjMi44LDAuNiw1LjYtMS4yLDYuMi00YzAuMS0wLjYsMS43LTcuOSwxLjctNy45IGMxLjItNS42LDUuOC05LjcsMTEuMi0xMC40YzEuMi0wLjIsNS45LTAuNSw1LjktMC41YzE5LjUtMS41LDM0LjktMTcuOCwzNC45LTM3LjdDMTIyLjgsNTEuNiwxMDUuOCwzNC43LDg1LDM0Ljd6IE04Ny43LDEyMS43IGMtMy40LTAuNy02LjgsMS40LTcuNSw0LjljLTAuNywzLjQsMS40LDYuOCw0LjksNy41YzMuNCwwLjcsNi44LTEuNCw3LjUtNC45QzkzLjMsMTI1LjcsOTEuMiwxMjIuNCw4Ny43LDEyMS43eiI+PC9wYXRoPjwvZz48L2c+PC9zdmc+Cg==',
    },
  ],
}
