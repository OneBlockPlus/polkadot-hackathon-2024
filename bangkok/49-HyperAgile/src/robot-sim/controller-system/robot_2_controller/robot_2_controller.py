"""robot_2_controller controller."""

# Import necessary classes from the controller module.
from controller import Supervisor, Motor, PositionSensor, Field
import requests
import logging

# Create the Supervisor instance, which extends the Robot class and provides additional functionalities.
robot = Supervisor()

# Get the time step of the current world.
timestep = int(robot.getBasicTimeStep())

# Enable sensors for the robot's wheels
rl_sensor = robot.getDevice("rl_sensor")
rl_sensor.enable(timestep)
fl_sensor = robot.getDevice("fl_sensor")
fl_sensor.enable(timestep)
rr_sensor = robot.getDevice("rr_sensor")
rr_sensor.enable(timestep)
fr_sensor = robot.getDevice("fr_sensor")
fr_sensor.enable(timestep)

# Initialize the wheels of the robot and set their initial velocities and positions.
wheel_names = ["fr", "rr", "fl", "rl"] 
wheels = []
for i in range(len(wheel_names)):
    wheels.append(robot.getDevice(wheel_names[i]))
    wheels[i].setVelocity(0)  # Set motor speed to 0 initially
    wheels[i].setPosition(float('+inf'))  # Set motor position to infinite (continuous rotation)

# Initialize the robot's arm motors
arm_motor_names = ["shoulder_pan_joint", "shoulder_lift_joint", "elbow_joint", "wrist_1_joint", "wrist_2_joint"]
motors = []  # Array to store motor instances

# Initialize the gripper motors
gripper = []
gripper_motor_names = ["ROBOTIQ 2F-140 Gripper::left finger joint", "ROBOTIQ 2F-140 Gripper::right finger joint"]
for i in range(len(gripper_motor_names)):
    gripper.append(robot.getDevice(gripper_motor_names[i]))
    gripper[i].setVelocity(0.3)  # Set gripper motor speed

# Initialize motor array for the robot's arm and set velocities
for i in range(len(arm_motor_names)):
    motors.append(robot.getDevice(arm_motor_names[i]))
    motors[i].setVelocity(0.4)  # Set motor speeds for the arm joints

# Function to call an external robot API
def call_robot_api(order_id, robot_id):
    url = "https://hyper-agile.vercel.app/api/robot" #"http://127.0.0.1:5000/api/robot"# URL for the API
    payload = {
        "orderId": order_id,
        "robotId": robot_id
    }
    try:
        # Send a POST request to the API
        response = requests.post(url, json=payload)
        response.raise_for_status()
        logging.info(f"Robot API called successfully with orderId={order_id} and robotId={robot_id}")
        return response.json(), 200
    except requests.exceptions.RequestException as e:
        logging.error(f"Failed to call Robot API: {str(e)}")
        return {"error": str(e)}, 500

# Function to open the gripper
def open_gripper():
    # Set gripper position to open
    gripper[0].setPosition(0)
    gripper[1].setPosition(0)
    robot.step(500)  # Small delay for the gripper to open

# Function to close the gripper
def close_gripper():
    # Set gripper position to close
    gripper[0].setPosition(0.4)
    gripper[1].setPosition(0.4)
    robot.step(2000)  # Delay to ensure gripper is fully closed

# Function to convert degrees to radians
def FromDegreeToRadiant(degree):
    return degree / 180 * 3.141

# Function to move the arm using direct kinematics
def move_direct_kinematics(list):
    motors[0].setPosition(FromDegreeToRadiant(list[0]))
    motors[1].setPosition(FromDegreeToRadiant(list[1]))
    motors[2].setPosition(FromDegreeToRadiant(list[2]))
    motors[3].setPosition(FromDegreeToRadiant(list[3]))
    motors[4].setPosition(FromDegreeToRadiant(list[4]))

# Functions to control robot movement in different directions
def move(fr, rr, fl, rl):
    wheels[0].setVelocity(fr)    
    wheels[1].setVelocity(rr)  
    wheels[2].setVelocity(fl)
    wheels[3].setVelocity(rl)

def straf_left():
    move(-5, 5, 5, -5)

def straf_right():
    move(5, -5, -5, 5)   

def turn_left():
    move(-5, -5, 5, 5)   

def turn_right():
    move(5, 5, -5, -5)  

def forward():
    move(-5, -5, -5, -5)   

def reverse():
    move(5, 5, 5, 5)

def stop():
    move(0, 0, 0, 0)  # Stop all wheels

# Function to move the robot forward for a specific distance
def travel_forwad(dis):
    prev_count = -(rl_sensor.getValue() + fl_sensor.getValue() + rr_sensor.getValue() + fr_sensor.getValue()) / 4
    current_count = -(rl_sensor.getValue() + fl_sensor.getValue() + rr_sensor.getValue() + fr_sensor.getValue()) / 4
    traveled_dist = (current_count - prev_count) * 0.037
    
    while traveled_dist < dis:
        forward()
        current_count = -(rl_sensor.getValue() + fl_sensor.getValue() + rr_sensor.getValue() + fr_sensor.getValue()) / 4
        traveled_dist = (current_count - prev_count) * 0.037
        
        robot.step(1)
    stop()

# Function to strafe right for a specific distance
def travel_sr(dis):
    prev_count = -(fl_sensor.getValue() + rr_sensor.getValue()) / 2
    current_count = -(fl_sensor.getValue() + rr_sensor.getValue()) / 2
    traveled_dist = (current_count - prev_count) * 0.037
    
    while traveled_dist < dis:
        straf_right()
        current_count = -(fl_sensor.getValue() + rr_sensor.getValue()) / 2
        traveled_dist = (current_count - prev_count) * 0.037
        
        robot.step(1)
    stop()

# Function to strafe left for a specific distance
def travel_sl(dis):
    prev_count = -(rl_sensor.getValue() + fr_sensor.getValue()) / 2
    current_count = -(rl_sensor.getValue() + fr_sensor.getValue()) / 2
    traveled_dist = (current_count - prev_count) * 0.037
    
    while traveled_dist < dis:
        straf_left()
        current_count = -(rl_sensor.getValue() + fr_sensor.getValue()) / 2
        traveled_dist = (current_count - prev_count) * 0.037
        
        robot.step(1)
    stop()

# Function to turn right for a specific distance
def travel_right(dis):
    prev_count = -(rl_sensor.getValue() + fl_sensor.getValue()) / 2
    current_count = -(rl_sensor.getValue() + fl_sensor.getValue()) / 2
    traveled_dist = (current_count - prev_count) * 0.037
    
    while traveled_dist < dis:
        turn_right()
        current_count = -(rl_sensor.getValue() + fl_sensor.getValue()) / 2
        traveled_dist = (current_count - prev_count) * 0.037
    
        robot.step(1)
    stop()

# Function to turn left for a specific distance
def travel_left(dis):
    prev_count = -(rr_sensor.getValue() + fr_sensor.getValue()) / 2
    current_count = -(rr_sensor.getValue() + fr_sensor.getValue()) / 2
    traveled_dist = (current_count - prev_count) * 0.037
    
    while traveled_dist < dis:
        turn_left()
        current_count = -(rr_sensor.getValue() + fr_sensor.getValue()) / 2
        traveled_dist = (current_count - prev_count) * 0.037
    
        robot.step(1)
    stop()

# Define some predefined poses for the robot's arm
home_pose = [90, -90, 0, 0, 0, 0]
pickup_pose = [90, 0, 0, -90, 0, 0]
keep_pose = [90, 0, 90, -90, 0, 0]
pose_4 = [180, 0, 0, 0, 0, 0]

# Move the robot's arm to the home position
move_direct_kinematics(home_pose)
with open('state.txt', 'w') as file:
    file.write("1")
robot.step(1000)

# Main task function based on color detection
def task(color):
    travel_right(0.011)
    travel_forwad(1.655)
    travel_left(0.011)
    move_direct_kinematics(pickup_pose)
    robot.step(4000)
    close_gripper()
    
    move_direct_kinematics(home_pose)
    robot.step(1000)
    travel_left(0.59)
    travel_forwad(3.37)
    travel_left(0.02)
    move_direct_kinematics(pickup_pose)
    robot.step(5000)
    open_gripper()

    # Change the color of an object in the simulation
    root = robot.getRoot()
    field = root.getField("children")
    box = field.getMFNode(color)
    box_shape = box.getField("children")
    box_shape_1 = box_shape.getMFNode(0)
    appearance_node = box_shape_1.getField("appearance")
    color = appearance_node.getSFNode()  # Get the color node
    color.getField("baseColor").setSFColor([0.7, 0.5, 0.0])  # Change color to a new RGB value
    
    move_direct_kinematics(home_pose)
    robot.step(2000)
    
    # Read order ID and call the robot API
    order = "12345"
    with open('../order.txt', 'r') as file:
        order = file.read()
    robot.step(10)
    call_robot_api(order, "2")
    
    # Continue moving the robot after the task
    travel_left(0.57)
    travel_forwad(1.666)
    travel_left(0.023)

# Main loop to check for state changes and perform tasks
state = 1
color = 0
while robot.step(timestep) != -1:
    with open('state.txt', 'r') as file:
        state = int(file.read())
    robot.step(10)
    
    if state == 2:
        # If state is 2, read color and perform the task
        with open('../color.txt', 'r') as file:
            color = int(file.read())
        robot.step(10)

        # Move an object in the simulation based on its color
        root = robot.getRoot()
        field = root.getField("children")
        ball = field.getMFNode(color)
        target = ball.getField("translation").setSFVec3f([-0.18472047078779225, -2.079, 0.3199989280867958])
        
        task(color)
        with open('state.txt', 'w') as file:
            file.write("0")
        robot.step(10)
        break
    pass

# Enter here exit cleanup code.
