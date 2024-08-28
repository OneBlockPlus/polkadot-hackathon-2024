# Relaycode: Rethinking Extrinsics in Polkadot


<div align="center">
<img src="docs/relaycode.png"/>
</div>

## Key Features:

1. **A New Extrinsic Builder**: Our state-of-the-art builder allows users to construct extrinsics with ease, providing real-time encoding and decoding for immediate visual feedback.

2. **Dual-Pane Interface**: Relaycode lets you see the best of both worlds with our split-view design. Build extrinsics using human-readable inputs on one side, while simultaneously viewing the corresponding encoded data on the other.

3. **Bi-Directional Editing**: Seamlessly switch between editing human-readable values and raw encoded data. Changes in one pane are instantly reflected in the other, offering unparalleled flexibility.

4. **Wallet Integration**: Connect your Polkadot wallet directly within Relaycode to sign and submit extrinsics, eliminating the need for external tools or interfaces.

5. **Customizable Snippets**: Create, save, and share reusable extrinsic templates. Streamline complex processes by chaining multiple calls into a single, user-friendly form.

6. **Educational Tools**: Built-in guides and tooltips help users understand the intricacies of extrinsics, making Relaycode an excellent learning platform for Polkadot users.


## Problem to be Solved
Relaycode addresses the complexity of building and understanding extrinsics in the Polkadot ecosystem. Many developers and users find it challenging to interact with pallets and construct extrinsics, leading to a steep learning curve and potential errors in blockchain interactions.

## Project Overview
Relaycode is an intuitive extrinsics builder designed to transform the way developers and users interact with extrinsics in the Polkadot ecosystem. By bridging the gap between complex pallet operations and user-friendly interfaces, Relaycode gives both regular users and developers the ability to harness the full potential of extrinsics the Polkadot ecosystem.

## Project Demonstration
[Demo Video](docs/demo.mp4)

## Technical Architecture
- Frontend: Next.js 15 with App Router, React, TypeScript
- Styling: Tailwind CSS, shadcn/ui components
- State Management: React Hooks, Context API
- Blockchain Interaction: Polkadot JS & useInkathon libraries
- Theming: next-themes for dark/light mode support

## Project Logo
<img src="docs/logo.png"/>

## Team Information
- Team Name: Relaycode
- Team Members:
  1. Yogesh Kumar - Full Stack Developer

## Selected Bounty
Category 1:(Infrastructure) Polkadot ecological developer tools

## Planned Code Deliverables during the Hackathon
1. Blockchain Side:
   - Integration with PolkadotJS API & useInkathon for Polkadot ecosystem interaction
   - Extrinsic building and encoding logic

2. Web Side:
   - Responsive web application using Next.js 15
   - Home page with project overview
   - Extrinsic builder interface
   - Real-time extrinsic encoding and decoding display

3. User Features:
   - Wallet connection functionality
   - Shareable extrinsic snippets feature (backend + frontend)

4. Additional Components:
   - Theme toggle (dark/light mode)
   - Documentation page for user guide

## Project Completed During the Hackathon
[x] Implemented core extrinsic builder functionality
[x] Developed responsive UI with theme support
[ ] Integrated wallet connection feature
[ ] Created shareable snippets system
[ ] Deployed MVP for testing and demonstration