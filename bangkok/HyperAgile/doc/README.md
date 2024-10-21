# Code Submission Breakdown

### Project Folder Structure

Our team organise our code submission into two main root: 

1. `dapp-demo`: All the dapp related, contracts, and blockchain interaction code
2. `robot-sim`: All the robotic simulation setup and connection layer code

```bash
📦dapp-demo-root
┣ 📂public
┣ 📂src
.....┣ 📂app
..........┣ 📂api
...............┣ 📂order
....................┣ 📂local
....................┗ 📂random number
...............┗ 📂robot
..........┣ 📂home
...............┣ 📂inventory
...............┣ 📂store
...............┗ 📂track
..........┣ 📂order
...............┣ 📂approval
...............┗ 📂simulator
.....┣ 📂class
.....┣ 📂components
.....┣ 📂config
.....┣ 📂context
.....┣ 📂contracts ABI
.....┣ 📂data
.....┣ 📂hooks
.....┣ 📂services
.....┗ 📂utils

```

# Folder Descriptions
- src/: This is the main source folder where the core application logic resides.
- components/: Contains reusable React components that are used across the application. Each component is generally placed in its own file for modularity and maintainability.
- utils/: Helper functions and utilities that provide reusable functionality, such as data formatting, API response parsing, etc.
- services/: Handles communication with external APIs or databases. This is where you'll find modules for making API requests, like authentication or fetching data.
- tests/: Contains all test files for the project. Each file typically mirrors the structure of the src folder, with unit and integration tests for components and services.
- README.md: The project documentation file. This file contains an overview of the project, setup instructions, and additional resources for contributors.
