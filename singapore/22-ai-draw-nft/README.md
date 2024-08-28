# AI Draw NFT

## Introduction

AI Draw NFT is a web application that lets you to create, enhance, and share your drawings with the world as well as mint your draw onto blockchain as NFT. Harnessing the power of Cloudflare R2 and Cloudflare AI to store and enhance your drawings.

## Features Planned for the Hackathon

- [x] Wallet connect
- [x] Mint NFT after draw done
- [x] Include a NFT exchange
- [x] Cross chain support to bridge into opensea(in polygon chain) to sell on opensea.
- [x] Support to create a NFT collection

## Architect

- [Nuxt](https://nuxt.com) - The Intuitive Vue Framework
- [Nuxt UI](https://github.com/nuxt/ui) - Beautiful UI library with TailwindCSS
- [Nuxt Auth Utils](https://github.com/Atinux/nuxt-auth-utils) - Simplified Authentication
- [NuxtHub](https://hub.nuxt.com) - Build & deploy to your Cloudflare account with zero configuration
  - [`hubBlob()`](https://hub.nuxt.com/docs/features/blob) to store drawing on Cloudflare R2
  - [`hubAI()`](https://hub.nuxt.com/docs/features/ai) to run Cloudflare AI on user's drawing
- [`npx nuxthub deploy`](https://github.com/nuxt-hub/cli) - To deploy the app on your Cloudflare account for free

## Team Info

* Lyman, Full Stack Developer

## Material for Demo

1. Demo Video [https://github.com/lymanlai/ai-draw-nft]
2. PPT [https://drive.google.com/file/d/1014eOfJq8yD9BSqWAt3Dhipjx0uzZgzB/view?usp=drive_link]
3. code [https://github.com/lymanlai/ai-draw-nft]