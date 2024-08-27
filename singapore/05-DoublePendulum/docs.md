# Documentation

## Overview

### animation
Program visualises deterministic chaos of double pendulum system.
Depending on initial conditions and other parameters (such as mass or length) the program calculates trajectory of n
double pendulums which at the beginning starts at the position differing by only a small fraction of radian.
Hamilton canonical equations of motion are solved numerically by runge-kutta classical method (RK4), 
which I also programed myself.
Visualisation and animation is created using matplotlib package. 

After creating an animation, user can save it and check if it's pretty enough for them to mint it.
Saving the animation as .mp4 is done by ffmpeg.

### making it public
I used flask UI to create a python server. The web page is created mainly in index.html and styles.css.
Everything is deployed to DigitalOcean. I also needed to use Dockerfile to install ffmpeg.
All secret details are hidden in .env file.

### NFTs
Goal was to mint NFTs on Polkadot Asset Hub (system parachain). After NFT is minted, video is posted to IPFS 
using Apillon api and after getting cid, metadata are created and also posted to IPFS. 
Connectiong to wallet is done using polkadot.js/extension and minting with polkadot.js/api. 
Posting to IPFS is done in python in api.py. And setting metadata is also in python (set_metadata.py) with py-substrate-interface, 
because of using .env file for some secret details.


## Initialization

# doublependulum.py

### Constants and Parameters
- `n_pendulums`: Number of pendulums in the simulation.
- `d_diff`: Small degree difference between initial angles of pendulums.
- `g`: Gravitational acceleration (constant).
- `m1`, `m2`: Masses of the pendulums.
- `L1`, `L2`: Lengths of the pendulum rods.
- `theta1`, `theta2`: Initial deflection angles of the pendulums.
- `p1_n`, `p2_n`: Initial momenta of the pendulums.
- `dt`: Time step for the simulation.
- `t_max`: Total simulation time.
- `n_steps`: Number of simulation steps.
- `colormap`: colormap for pendulums colors
- `background`: background color

### Initial Conditions
- Initialize arrays for storing angles (`theta1_arr`, `theta2_arr`) and time (`t_arr`).
- Initialize momenta (`p1`, `p2`) and apply small differences to initial angles for each pendulum.

## Hamiltonian Equations of Motion

### Functions for Equations of Motion
- `theta1_dot(p1, p2, theta1, theta2, L1, L2)`: Computes the rate of change of `theta1`.
- `theta2_dot(p1, p2, theta1, theta2, L1, L2)`: Computes the rate of change of `theta2`.
- `p1_dot(p1, p2, theta1, theta2, L1, L2)`: Computes the rate of change of `p1`.
- `p2_dot(p1, p2, theta1, theta2, L1, L2)`: Computes the rate of change of `p2`.

## Numerical Integration

### Runge-Kutta Method
- `runge_kutta(n_steps, dt, t_arr, theta1_arr, theta2_arr, p1, p2, L1, L2, n_pendulums)`:
Solves the equations of motion using the classical Runge-Kutta (RK4) method.
  - Iterates through each time step and computes new values of angles and momenta.
  - Saves the computed results in the respective arrays.

## Conversion to Cartesian Coordinates

### Coordinate Transformation
- `back_to_cartesian(theta1_arr, theta2_arr, L1, L2, n_steps, n_pendulums)`: Converts angular results to Cartesian coordinates.
  - Returns arrays of x and y coordinates for both masses of each pendulum.

## Animation

### Visualization
- `animace(x1, y1, x2, y2, n_steps, dt, n_pendulums)`: Animates the motion of the double pendulums.
  - Sets up the figure and axes for the animation.
  - Uses a colormap to differentiate pendulums.
  - Updates the positions of the pendulum rods and masses in each frame.
  - Optionally saves the animation as an MP4 file.

## Execution
- Execute the simulation by running the Runge-Kutta method to solve the equations of motion.
- Convert the results to Cartesian coordinates.
- Animate the motion of the pendulums to visualize their trajectories.

This simulation demonstrates the complex and chaotic behavior of double pendulums,
highlighting the sensitivity to initial conditions.
The visualization provides an engaging way to observe the dynamic motion of the system.

# api.py

### Environment Variables
The script uses environment variables to configure the bucket and authentication token.

BUCKETUUID: This is the UUID of the bucket you are uploading to.
AUTHENTICATION: This is your authentication token for the Apillon API.
These variables are set in .env file.

## Functions

### post_ipfs()
This function uploads a video file (double_pendulum_animation.mp4) to IPFS via the Apillon API and returns its CID.

Steps:

Prepares the video file for upload.
Sends a POST request to start the upload process and retrieve the upload URL.
Sends a PUT request to upload the video file.
Sends a POST request to finalize the upload session.
Retrieves the CID of the uploaded video file through repeated GET requests.
Returns: The CID of the uploaded video file.

### post_json_ipfs(cid_video, n_pendulums, d_diff, t_max, g, m1, m2, L1, L2, theta1, theta2)
This function uploads metadata in JSON format to IPFS via the Apillon API and returns its CID. 
The metadata describes a double pendulum simulation and includes various simulation parameters.

Arguments:

- `cid_video`: The CID of the associated video file uploaded earlier.
- `n_pendulums`: Number of pendulums in the simulation.
- `d_diff`: Difference value.
- `t_max`: Maximum simulation time.
- `g`: Gravitational acceleration.
- `m1`: Mass of the first pendulum.
- `m2`: Mass of the second pendulum.
- `L1`: Length of the first pendulum arm.
- `L2`: Length of the second pendulum arm.
- `theta1`: Initial angle of the first pendulum.
- `theta2`: Initial angle of the second pendulum.

Steps:

Creates JSON metadata with the provided parameters and the CID of the video file.
Sends a POST request to initiate the metadata upload process.
Sends a PUT request to upload the metadata JSON.
Sends a POST request to finalize the upload session.
Retrieves the CID of the uploaded metadata JSON through repeated GET requests.
Returns: The CID of the uploaded JSON metadata.


# app.py

Flask UI

### Environment Variables
The application requires the following environment variables to be set:

WSENDPOINT: WebSocket endpoint used in the UI.
COLLECTIONID: The ID of the NFT collection.
These variables are set in .env file.

## Application Routes
### GET /
Renders the main index.html.

Template Variables:
cid: Default is None.
video: Boolean indicating whether video content is available, default is False.
wsendpoint: WebSocket endpoint for the UI.
collectionid: NFT collection ID.
Simulation parameters: n_pendulums, d_diff, t_max, g, m1, m2, L1, L2, theta1, theta2 (all default to False).

### POST /mint_nft
Mints an NFT based on the simulation parameters and uploads the related files to IPFS.

Request Payload (JSON):

n_pendulums: Number of pendulums in the simulation.
d_diff: Differential value.
t_max: Maximum simulation time.
g: Gravitational acceleration.
m1: Mass of the first pendulum.
m2: Mass of the second pendulum.
L1: Length of the first pendulum arm.
L2: Length of the second pendulum arm.
theta1: Initial angle of the first pendulum.
theta2: Initial angle of the second pendulum.
Response:

The CID (Content Identifier) of the minted NFT.

### POST /set_nft_metadata
Sets the metadata for an existing NFT using the provided CID.

Request Payload (JSON):

itemId: The ID of the NFT item.
cid: The CID of the metadata.
Response:

"baf" (placeholder response).

### POST /export
Runs the double pendulum simulation with the provided parameters and generates the video content.

Request Payload (Form Data):

n_pendulums: Number of pendulums in the simulation.
d_diff: Differential value.
t_max: Maximum simulation time.
g: Gravitational acceleration.
m1: Mass of the first pendulum.
m2: Mass of the second pendulum.
L1: Length of the first pendulum arm.
L2: Length of the second pendulum arm.
theta1: Initial angle of the first pendulum.
theta2: Initial angle of the second pendulum.
colormap: Colormap used for the simulation visualization.
background: Background color used for the simulation visualization.
Response:

Renders the index.html page with updated simulation parameters and video status update.

### POST /save
Allows the user to download the generated double_pendulum_animation.mp4 video.

Response:
Sends the video file as an attachment for download.