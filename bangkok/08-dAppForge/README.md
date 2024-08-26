# Project dAppForge

## Introduction

The developer experience on Polkadot is the ecosystem's #1 problem. Substrate and Ink! are very powerful frameworks, but they are very difficult to learn. Because of this, Polkadot developers always struggle to build better applications. The bad developer experience also makes it harder for new developers to enter the ecosystem. Polkadot needs a better developer experience to grow the developer ecosystem and enable developers to build better applications faster. Better applications will attract more users, which is a problem Polkdot has always had. One solution to the DevEx problem is dAppForge.

dAppForge is an AI-powered plug-in for Polkadot developers that reduces development time. The AI model will be explicitly fine-tuned for substrate and ink! We received $100,000 in funding from Angel Investor to build LLM's first iteration and the alpha version of the plug-in. This served as the POC for the product. You can also download the alpha version of the plugin from the VS code extension marketplace. The Polkadot ecosystem approved a treasury proposal of $105,000 for us to build the beta verison of the product.

## Features planned for the Hackathon

- [ ] Integration of AI autocompletion for Ink! & Substrate into the VS code plug-in.
- [ ] AI Chat feature that works for both Substrate and Ink!

## Architecture

- AWS API Gateway, Websockets, Lambda, and DynamoDb for the API.
- Typescript and Svelte for the VS Code plugin.
- AI LLM hosted on AWS.

## Schedule

- Update API & VS Code plugin to use Websockets for AI requests
- Add AI chat to VS Code plugin
- Fine-tune AI model for substrate: We already had a POC where we built an AI model tailored for the substrate. We fine-tuned an existing AI model in AWS bedrock with substrate documentation and GitHub repositories.
- Implement AI model specified for ink! Development

## Team info

## Material for Demo
