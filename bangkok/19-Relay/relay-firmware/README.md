# DoTLink: Bridging IoT with Polkadot 🌉🦾

![DoTLink Banner](https://github.com/user-attachments/assets/74b8c212-5d1e-4135-a6c9-96e5212f34f5)

## 🚀 Welcome to DoTLink

DoTLink is an ambitious IoT SDK designed to seamlessly connect the world of Internet of Things (IoT) with the Polkadot ecosystem. Our mission? To empower IoT devices to interact effortlessly with Polkadot's relay chain and parachains, opening up a new realm of possibilities for decentralized IoT applications.

## 🌟 Features

- 🔌 Easy integration with Raspberry Pi and IoT devices
- 🌐 Interact with Polkadot relay chain and parachains
- 🛠 JavaScript SDK with intuitive API
- 🎯 User-friendly firmware UI
- 🔒 Secure communication protocols
- 🎛 Customizable for different IoT use cases

## 🏗 Current Status

**Version:** 0.1.0-alpha

We've successfully implemented our first phase:

- ✅ Raspberry Pi JavaScript SDK
- ✅ Custom firmware UI
- ✅ Alpha phase workflow implementation
- ✅ Core functionalities for Polkadot interaction
- ✅ Basic documentation and examples

### Alpha Phase Workflow

![Workflow](https://github.com/user-attachments/assets/6aeabc09-3584-491d-91b4-11dae9afd4e3)

Our current implementation includes a secure and user-friendly workflow:

1. **User Registration**: When a user registers, we generate a 12-word mnemonic.
2. **Mnemonic Split**: 
   - The first 3 words are stored securely in our database.
   - The remaining 9 words are burned into the user's RFID pin.
3. **Merchant Setup**: Merchant public addresses are configured in the Raspberry Pi firmware.
4. **Payment Process**:
   - Customer flashes their RFID pin to the Raspberry Pi device.
   - The device sends the following to our API endpoint:
     - Mnemonic parts stored in the pin
     - Transaction amount
     - Merchant's public address
   - Our server reconstructs the full mnemonic and sends the transaction.

## 🗺 Roadmap

Our journey to connect the IoT world with Polkadot continues to evolve. Here's what's next:

1. 🔜 ESP32 MicroPython implementation
2. 🔜 Rust implementation for embedded devices
3. 🔀 Expand to other platforms:
   - Arduino
   - Other SBCs (Single Board Computers)
4. 🔗 Implement advanced Polkadot features
5. 📚 Expand documentation and tutorials
6. 🧪 Real-world IoT use case demonstrations

### Beta Phase Plans

As we move towards the beta phase, we plan to:

- Gradually phase out the relay API server
- Enable devices to send transactions directly
- Enhance security and decentralization of the system

## 🚦 Getting Started

### Prerequisites

- Raspberry Pi (3 or newer recommended)
- Node.js 14+
- npm or yarn
- Basic understanding of Polkadot and IoT concepts

## 🤝 Contributing

We're excited to welcome contributors to the DoTLink project! Whether you're into coding, documentation, or testing, there's a place for you. Check out our [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to get started.

## 📜 License

DoTLink is released under the MIT License. See the [LICENSE](LICENSE) file for more details.

## 🌐 Connect with Us

[Insert your GitHub IDs and other contact information here]

## 🙏 Acknowledgments

- The Polkadot team for their groundbreaking work in blockchain interoperability
- The Raspberry Pi and JavaScript communities
- All our contributors and supporters

---

DoTLink is currently in alpha. While we're working hard to make it awesome, please use it with caution in production environments. We're excited to see what you'll build with DoTLink!