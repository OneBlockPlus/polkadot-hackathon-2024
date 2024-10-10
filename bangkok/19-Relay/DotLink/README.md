# DoTLink: Bridging IoT with Polkadot 🌉🦾

![DoTLink Banner](https://github.com/user-attachments/assets/74b8c212-5d1e-4135-a6c9-96e5212f34f5)

## 🚀 Welcome to DoTLink

DoTLink is an ambitious IoT SDK designed to seamlessly connect the world of Internet of Things (IoT) with the Polkadot ecosystem. Our mission? To empower IoT devices to interact effortlessly with Polkadot's relay chain and parachains, opening up a new realm of possibilities for decentralized IoT applications.

## 🌟 Features

- 🔌 Easy integration with IoT devices
- 🌐 Interact with Polkadot relay chain and parachains
- 🛠 Modular design for various programming languages and platforms
- 🔒 Secure communication protocols
- 🎛 Customizable for different IoT use cases

## 🏗 Current Status

**Version:** 0.1.0-alpha

We're currently in the exciting early stages, focusing on laying a solid foundation:

- ✅ ESP32 MicroPython implementation (in progress)
- ✅ Alpha phase workflow implementation
- 🔜 Core functionalities for Polkadot interaction
- 🔜 Basic examples and documentation

### Alpha Phase Workflow

![Workflow](https://github.com/user-attachments/assets/6aeabc09-3584-491d-91b4-11dae9afd4e3)

In our alpha phase, we've implemented a secure and user-friendly workflow:

1. **User Registration**: When a user registers, we generate a 12-word mnemonic.
2. **Mnemonic Split**: 
   - The first 3 words are stored securely in our database.
   - The remaining 9 words are burned into the user's RFID pin.
3. **Merchant Setup**: Merchant public addresses are burned into the ESP32 firmware.
4. **Payment Process**:
   - Customer flashes their RFID pin to the ESP32 device.
   - ESP32 sends the following to our API endpoint:
     - Mnemonic parts stored in the pin
     - Transaction amount
     - Merchant's public address
   - Our server reconstructs the full mnemonic and sends the transaction.

## 🗺 Roadmap

Our journey to connect the IoT world with Polkadot is just beginning. Here's what's on the horizon:

1. 🏁 Complete ESP32 MicroPython implementation
2. 🔀 Expand to other languages and platforms:
   - Lua
   - Rust
   - C++
   - Arduino
3. 🔗 Implement advanced Polkadot features (e.g., cross-chain messaging)
4. 📚 Comprehensive documentation and tutorials
5. 🧪 Real-world IoT use case demonstrations
6. 🤝 Community building and partnership development

### Beta Phase Plans

As we move towards the beta phase, we plan to:

- Gradually phase out the relay API server
- Enable devices to send transactions directly
- Enhance security and decentralization of the system

## 🚦 Getting Started

### Prerequisites

- ESP32 device
- MicroPython firmware installed
- Basic understanding of Polkadot and IoT concepts

### Quick Start

1. Clone the repository:
   ```
   git clone https://github.com/your-username/dotlink.git
   ```
2. Navigate to the ESP32 MicroPython directory:
   ```
   cd dotlink/esp32-micropython
   ```
3. Copy the necessary files to your ESP32 device (detailed instructions in our docs)

### Basic Usage

```python
from dotlink import connect_wifi, create_transaction, send_transaction

# Connect to WiFi
connect_wifi("your_ssid", "your_password")

# Create and send a transaction
tx = create_transaction("sender_address", "recipient_address", amount)
result = send_transaction(tx)
print("Transaction result:", result)
```

## 🤝 Contributing

We're excited to welcome contributors to the DoTLink project! Whether you're into coding, documentation, or testing, there's a place for you. Check out our [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to get started.

## 📜 License

DoTLink is released under the MIT License. See the [LICENSE](LICENSE) file for more details.

## 🌐 Connect with Us

[Insert your GitHub IDs and other contact information here]

## 🙏 Acknowledgments

- The Polkadot team for their groundbreaking work in blockchain interoperability
- The vibrant IoT and MicroPython communities
- All our contributors and supporters

---

DoTLink is currently in alpha. While we're working hard to make it awesome, please use it with caution in production environments. We're excited to see what you'll build with DoTLink!
