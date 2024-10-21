<img src="https://github.com/user-attachments/assets/2712f591-156c-4229-9ffe-6fc433e999fa" height="100" width="100" />

# HyperAgile: Industrial Robotic Automation on Polkadot 🤖

The first B2B Middleware-as-a-Service (MaaS) project to help industries design and develop custom API hub which connect their Robotic Process Automation (RPA) infrastructure (**ROBOTS~**) to the Polkadot ecosystem seamlessly.

> 👉👉👉 **TL;DR:** Watch our 6 minutes [video](https://www.youtube.com/watch?v=-Otl40WUKOo) to have a quick idea~ 👈👈👈

### Table of Contents
1. [Problems](#problems)
2. [Inspirations](#inspirations)
3. [Existing Solutions & Challenges](#%EF%B8%8F-existing-solutions-and-challenges)
4. [Our Solution](#-we-launch-hyperagile-focusing-on-robots-our-solution)
5. [Architecture](#concept-hyperagile-hub---architecture-overview)
6. [Potential Clients](#how-hyperagile-helps-our-industry-clients-not-limited-to)
7. [PoC](#proof-of-concept-an-implementation-prototype)
8. [Timeline](#-timeline-for-all-features-planned-completed)
9. [Deliverables](#-deliverables)
10. [Track and Bounty](#-track-and-bounty)
11. [Team Info](#team-info-%EF%B8%8F%EF%B8%8F)

## Problems

![Frame 29 (4)](https://github.com/user-attachments/assets/26216ed2-e8f1-4ed9-a70d-92a71dca5b0d)

Data centralization is one of the key issue when industries are operating their robotic process automation (RPA) in a web2-based infrastructure setup. Industries often adopt distributed manufacturing strategy which form a complex supply chain and involve various stakeholders and manufacturing units spreading in different locations. Hence, in a web2-based robotic infrastructure, each parties are actually siloed, as the data systems are disjoint, causing information asymmetry. In other words, A robot system in one factory may collect data that are not shared with robots in another factory, making it difficult to get a unified view of operations. The problems which arises will be:

#### ❌ Data is not Transparent: 

Factories and warehouses operating their robotic fleets in an isolated data systems or across various locations, will create a "visibility gap" that limits transparency and access to real-time operational data for stakeholders.
   
#### ❌ Low Efficiency + Track and Trace Challenge: 

Workflow efficiency suffers due to the complex data integration processes that slow decision-making and create operational bottlenecks. This lack of transparency also complicates essential tasks like tracking the history of production or the origin of raw materials, even among connected facilities. The underlying reason is the lack of clear auditing trials which can be easily access, and this is a classic problem in supply chain sector.
   
#### ❌ Security Concerns: 

Security concerns are heightened in Web2 environments, where mutable data is vulnerable to tampering and counterfeiting, which is considered a damage to the supply chain trust. Additionally, the risk of a single point of failure can lead to significant disruptions, cascading through the entire robotic automation operation.

## Inspirations

To address the problems, letting current industries robotic setup to transition and utilise a Polkadot-connected distributed data system is a smart move. The intuition behind is simple: Every action taken by a robot in a factory is recorded on the blockchain, making product movement, quality checks, and production steps fully transparent, traceable, verifiable, and tamper-resistant, significantly enhancing security and auditability for all supply chain stakeholders.

#### ⭐ Key Benefits: 

1. Full traceability and auditability
2. Data are immutable and highly secure
3. Full flexibility. Interoperability of robotic systems in different parachains
4. Smart Contracts for automated and secure control of robotic fleet
5. Resilient robotic network for industry
6. Vendor independence. No more traditional vendor-locked-in system
7. Reducing long term cost for Web2 infrastructure maintenance.

## ⚔️ Existing Solutions and Challenges

Existing solutions for implementing robotic process automation (RPA) in industries include a variety of software platforms (such as UiPath, Gazebo, and Automation Anywhere), industry-specific solutions (like those from ABB, KUKA, and Fanuc), and integration tools (including ROS, AWS IoT, and Microsoft Azure IoT Hub). However, challenges emerge when considering the implementation of Web3 solutions in RPA. A significant hurdle is that the Polkadot ecosystem lacks robotics-related development tools to facilitate the integration of blockchain solutions with existing legacy systems, which are often incompatible.

>  A simple example: while developing a prototype for our demo, we found that no industry-grade robotic simulators offer tools for easily interacting with Polkadot parachains to conduct simulations.

☹️ Although industries can create their own tools or middleware for Web3 integration, this approach can be costly, time-consuming, and resource-intensive. We need a solution to bridge the gap between industry robotic automation (web2 layer) and the Polkadot ecosystem (web3 layer).

Here is a concept illustration:

![Frame 40 (2)](https://github.com/user-attachments/assets/b429a7b0-577a-4499-a1f6-5d1ecfc95b76)


## 💪 We launch HyperAgile, focusing on robots (Our Solution)

We are launching the HyperAgile project as the first middleware-as-a-service (MaaS) provider, assisting industries across various sectors with industrial robotic automation by designing and developing a custom HyperAgile API Hub. This hub acts like a bridge, which connects all components in their Robotic Process Automation (RPA) setup architecture to the Polkadot ecosystem. The benefit of using a HyperAgile Hub is that all of the important layers in the Web2-based robotic automation systems such as the factory floor (physical hardwares and robotics), IoT connectivity layer, security layer and also control and management layer, able to interact with the blockchain layer component easily (which involve on-chain assets, parachains, accounts, smart contract or any on-chain tooling integration). A HyperAgile Hub will now become the common interface for industries to connect all RPA components built by different language, framework, hardware, and communication protocol into a unified Web3 system. Below is a high-level architecture overview of a HyperAgile Hub in a industry robotic setup:

### Concept: HyperAgile Hub - Architecture Overview

![Frame 25 (5)](https://github.com/user-attachments/assets/fe2d6f95-8e41-491c-bb63-c71a0020da52)

### Why custom, not a “one-size-fits-all” solution❓

Our role is crucial because industrial robotic architectures are often complex and highly customized. Each industry has unique operational needs, diverse technologies, and specific regulatory requirements, making a one-size-fits-all approach impractical. That's why we offer tailored solutions, enabling industries to integrate Web3 infrastructure efficiently, which aligns perfectly with our product-market fit. This approach not only saves significant time for indsutries but also reduces costs.

As a B2B (business-to-business) service provider, we are proud to be the first to offer this service on Polkadot. In one of our future milestone (which will be showcased during our Phase 2 business pitch), the HyperAgile project will also serve as a key driver in introducing a comprehensive ecosystem of industry-specific robotic development tools to the Polkadot community as part of our ongoing service journey.

## How HyperAgile helps our industry clients? (Not Limited To)

- **🏭 Manufacturing:** Increase data transparency for supply chain track-and-trace by manage production line robotic automation on Polkadot.

- **🚚 3PL (Third Party Logistics) and Ecommerce:** Allow real time order processing and parcel tracking by integrating warehouse robotic systems like Autonomous Mobile Robots (AMR) on Polkadot.

- **🧬 Pharmaceutical and Biotech:** Record robotic operations on Polkadot during drug operation to ensure compliance with regulatory standards (e.g., FDA).

- **🍄 Agriculture and Farming:** Creating data records of crop generated by agriculture robotics automation system for better food traceability.

## Proof of Concept: An Implementation Prototype

The implementation prototype we showcase in the demo video is built using the HyperAgile API Hub architecture concept that we proposed, which able to power a small scale ecommerce-warehouse supply chain cycle. Further proving the feasibility of the HyperAgile project. Below attached is a high-level architecture diagram of our ecommerce-warehouse demo setup, which our HyperAgile Hub being the most crucial middleware component:

![Frame 26 (3)](https://github.com/user-attachments/assets/8523eb1a-e9ba-424e-a745-2fa53ea6cf2e)

Clients can order products from our store DApp, which are processed by our storefront smart contract and passed to the warehouse smart contract. The warehouse contract assigns a robot for each operation. There are three robots in the setup: a picking robot, a packing robot, and a delivery robot, each powered by its own individual smart contract. The Moonbeam randomness precompile is used to select one robot from the fleet for each operation, a process known as load balancing. We offload this process to a serverless function to prevent excessive depletion of our randomness request deposit. Notably, all complex operations happening behind the scenes are batched using the batch precompile for smoother interactions at the client layer. Additionally, the call permit precompile is used to sponsor the client’s gas fees through a dispatcher account we’ve prepared.

With HyperAgile Hub, industries can directly plug in and play various professional simulators to test entire operations with Polkadot integration. For our demo, we designed a warehouse operation flow that includes picking, packing, and delivering. We built a simulation using Webots to simulate real-world physical robot operations and embedded it into our demo for seamless interaction with Moonbeam. For example, when a client orders a green cube, the picking order is assigned to a picking robot on Moonbeam, and the picking robot in the simulation will perform the task. After each robot completes its assigned task, it logs the action on Moonbeam, and the warehouse contract triggers the next operation.

In a Human-Robot Collaborative Environment, which requires close supervision from human operators (for example, quality checks on tasks performed by robots), post-action approvals can be facilitated using a multi-signature mechanism on Moonbeam, creating an efficient feedback loop in a checkpoint-based workflow. For example, when the packing task is completed by the packing robot, a human operator with their own EOA (Externally Owned Account) will act as the Activity Verifier and verify the action. Only when all approvals are made for every phase in the warehouse order fulfillment workflow is the cycle considered complete.

Finally, once the order is fulfilled, a lifecycle report is generated and stored on the Decentralized Object Storage Service by CESS. The lifecycle report is a JSON file that acts as a comprehensive receipt, recording every event from start to finish, along with general order information.

Our eCommerce store sells three products, which serve as the inventory items for this setup. Our team manages the inventory by tokenizing each product into an ERC-1155 collection. This is a valuable implementation for industries that want to tokenize their inventory, such as stocks, products, or raw materials, providing a digital twin representation on Polkadot. We manage stock levels using a hybrid on-off-chain approach, which allows clients to hold products in their cart, and once the order is completed, the off-chain stock level is updated on-chain. We also have the capability to replenish stock levels directly on-chain.

### 📸 Some screenshots of our demo DApp

![Frame 27 (2)](https://github.com/user-attachments/assets/58724024-6d5f-4770-afd3-88843ac8b042)

### 🔌Connecting local robotic fleet

To further validate the feasibility of our implementation, we perform testing on a physical robot, which we refer to as a local robotic fleet. The system is centered around a HyperAgile Hub, enabling industries to interact with an IoT connectivity layer (refer to above architecture overview). This layer acts as an intermediary between the robotic fleet and the HyperAgile Hub, which is integrated with the Polkadot blockchain layer. The IoT connectivity layer can incorporate various technologies such as AWS IoT Core, Microsoft Azure IoT, Oracle IoT cloud, and MQTT-based solutions like RabbitMQ or Kafka, etc. 

To simplify the demonstration, our team utilized ngrok to establish a secure communication tunnel between our physical robot—a combination of a ROS-powered CoBot and a mobile AGV (Automated Guided Vehicle), with operations built using the Elephant Robotics Python API—and initiated the order fulfillment process on our DApp. As shown in the demo video, the commands assigned from the Moonbeam blockchain are successfully captured and transmitted to the connectivity layer, where they are received and executed by the robot in real time. Once the task is completed, the operation is logged and sent back via the same route. This process mirrors what can be tested directly on our demo DApp.

We also replicated this functionality using our Webots simulation (hosted locally in Webots software) to control the robotic fleet. By creating an intermediate connectivity layer (via a Flask server) and utilizing the ngrok tunnel, we successfully recreated the same results as with the physical robot. You can see the full demonstration in the video!

![Frame 30](https://github.com/user-attachments/assets/8c109716-bc22-4f27-97d1-324b4c049fdb)


## 📅 Timeline for all features planned (completed)

##### End of July-August
- [x] idea and concept preplanning
- [x] hub architecture design
- [x] simulation design
- [x] implementation research
- [x] CoBot and AGV stl for simulation
- [x] Webot warehouse scene
- [x] Webot operations development
- [x] setup flask server as connectivity layer
- [x] simulation testing with sandbox DApp
##### September-October
- [x] design UI for implementation prototype
- [x] frontend development
- [x] smart contract and features development
- [x] integration testing with simulation
- [x] incorporate Moonbeam precompiles
- [x] incorporate DeOSS of CESS
- [x] preparing initial review materials

## 📦 Deliverables

1. [Demo Video](https://www.youtube.com/watch?v=-Otl40WUKOo)
2. [Our Demo DApp](https://hyper-agile.vercel.app/)

### Code Submission Breakdown

For the convenience of the technical judges, our team has organized the code submission by breaking down the structure and providing descriptions for each folder and important files. You can access the documentation folder [here]().

## 🏆 Track and Bounty

**Track**: Open Topic

### Applied Bounties

#### 1. Moonbeam - Bounty 1: Use a Moonbeam Precompile

HyperAgile uses three moonbeam precompile to facilitate operations in a robotic automation setup, exploring the feasibility to implement in real-world industries workflow:

1. **Moonbeam Randomness Precompile**: Using an on-chain randomness on Moonbeam for load balancing in robotic fleet is an innovative approach in the space. On-chain randomness generated on Moonbeam can be combined with more approaches (e.g., Weighted Random Assignment) for more dynamic industry environments.
 
2. **Moonbeam Batch Precompile:** In a supply chain operation (for example, our ecommerce-warehouse demo), each of the layers consist of complex operations, which means we might have lots of transactions in one certain process. Batching all transaction into one able to increase user experience, as well as easier management.
    
3. **Moonbeam Call Permit Precompile:** It is a good alternative to a paymaster implementation on Moonbeam. In our demo, we use a call permit in our client layer frontend (which is our store DApp) to sponsor the gas fee with a dispatcher EOA. Client just have to pay for their product. It is also a good idea to set up a call-and-dispatch mechanism in controlling our robotic fleet inside our warehouse setup.

#### CESS Network

Our team introduce a new innovative application of CESS Network product in the industry supply chain sector. For a complete cycle in the supply chain or production line (for example, order fulfilment in an ecommerce warehouse), HyperAgile will generate a lifecycle report JSON file which act as a comprehensive record consisting the info of each operations on the blockchain. The lifecycle report will be uploaded and stored on the DeOSS - Decentralised Object Storage Service of CESS network. Hence, industry can easily retrieve lifecycle reports from DeOSS in the future, ensuring the availability of tamper-proof records in the supply chain.

#### Blockchain for Good - Security and Transparency

HyperAgile is promoting more trustworthy and secure operations for future robotic-automated industries. Robotic operations can now be recorded on-chain to create clear audit trails, introducing **transparency** to all stakeholders participating in a supply chain operation. Additionally, we address the classic track-and-trace challenge in supply chains, as **traceability** can now be improved through HyperAgile. With the immutable and tamper-proof nature of data on Polkadot and utilizing a distributed data system to operate robotic fleet, **security** will be further strengthened, reducing cases like counterfeiting in the production line.

## Team Info 🙋‍♂️🙋‍♀️

#### Tan (Jimmy) Zhi Xuan
- Computer Science and Artificial Intelligence @ University of Nottingham Malaysia
- Final year research in supply chain technologies
- Polkadot Global Hackathon * 3 🏆
- Full stack development and blockchain integration
- Discord Handle: #lidar7032

#### Lee Shi Min
- Electrical and Electronic Engineering @ University of Nottingham Malaysia
- Test Backend Department @ NXP Semiconductors (Malaysia) - Internship
- President of IEEE University of Nottingham Malaysia Student Chapter 
- Robotics and IoT integration
- Discord Handle: #sabashinigami

## Project Info
- Created in August 2024
- Not funded by any party
