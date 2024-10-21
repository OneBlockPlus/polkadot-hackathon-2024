This project contains a Webots world simulation and a Flask server to interact with it. This guide will walk you through the steps to open the Webots world, set up a Python virtual environment, and start the Flask server.

## Prerequisites
Before proceeding, ensure you have the following installed:

- [Webots](https://cyberbotics.com/) (Version 2022a or higher)
- Python 3.7 or higher
- Flask (pip install flask)

## How to Open the Webots World

1. **Install Webots**: Download and install Webots from the official [Webots website](https://cyberbotics.com).
   
2. **Launch Webots**:
   - Open Webots.
   - Go to `File > Open World`.
   - Navigate to the project directory, find the `.wbt` file, and open it.
  
## Python Virtual Environment and Flask Server Setup

### 1. Set Up a Virtual Environment (venv)

A virtual environment is useful to isolate your project dependencies.

1. **Create a virtual environment, activate it**:

   Open a terminal/command prompt and navigate to the project directory.

   ```bash
   python3 -m venv venv

   venv\Scripts\activate

   ```

   On macOS/Linux:
   
     ```bash
     source venv/bin/activate
      ```

2. **Run the flask server**:

   ```bash
   set FLASK_APP=webots.py
   flask run
    ```

3. **Access the server**:

Open your web browser and visit http://127.0.0.1:5000/. You should see "Hello World".
   
