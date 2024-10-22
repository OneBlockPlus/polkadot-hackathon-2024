"""robot_1_controller controller."""

# You may need to import some classes of the controller module. Ex:
#  from controller import Robot, Motor, DistanceSensor
from controller import Supervisor, Motor, PositionSensor
import requests
import logging
# create the Robot instance.
robot = Supervisor()

# get the time step of the current world.
timestep = int(robot.getBasicTimeStep())

rl_sensor = robot.getDevice("rl_sensor")
rl_sensor.enable(timestep)
fl_sensor = robot.getDevice("fl_sensor")
fl_sensor.enable(timestep)
rr_sensor = robot.getDevice("rr_sensor")
rr_sensor.enable(timestep)
fr_sensor = robot.getDevice("fr_sensor")
fr_sensor.enable(timestep)

wheel_names = ["fr","rr","fl","rl"] 
wheels = []
for i in range(len(wheel_names)):
    wheels.append(robot.getDevice(wheel_names[i]))
    wheels[i].setVelocity(0)##Setting motor speeds
    wheels[i].setPosition(float('+inf'))##Setting motor speeds
    
arm_motor_names = ["shoulder_pan_joint","shoulder_lift_joint","elbow_joint","wrist_1_joint","wrist_2_joint"]
motors = [] ### The motor array

gripper = []
gripper_motor_names = ["ROBOTIQ 2F-140 Gripper::left finger joint","ROBOTIQ 2F-140 Gripper::right finger joint"]
for i in range(len(gripper_motor_names)):
    gripper.append(robot.getDevice(gripper_motor_names[i]))
    gripper[i].setVelocity(0.3) 
##Initialization motor array
for i in range(len(arm_motor_names)):
    motors.append(robot.getDevice(arm_motor_names[i]))
    motors[i].setVelocity(0.4)##Setting motor speeds

def call_robot_api(order_id, robot_id):
    url = "https://hyper-agile.vercel.app/api/robot" #"http://127.0.0.1:5000/api/robot"
    payload = {
        "orderId": order_id,
        "robotId": robot_id
    }
    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()
        logging.info(f"Robot API called successfully with orderId={order_id} and robotId={robot_id}")
        return response.json(), 200
    except requests.exceptions.RequestException as e:
        logging.error(f"Failed to call Robot API: {str(e)}")
        return {"error": str(e)}, 500
        
def open_gripper():##Function to open gripper
    ##Setting linear motor position
    gripper[0].setPosition(0)
    gripper[1].setPosition(0)

    robot.step(500)#Small delay 
    
def close_gripper():##Function to close gripper

    gripper[0].setPosition(0.4)
    gripper[1].setPosition(0.4)

    robot.step(2000)
    
def FromDegreeToRadiant(degree):##Function to convert degrees to radians
    return degree/180*3.141
    
def move_direct_kinematics(list):## Giving motor positions to motors to move the arm 
    motors[0].setPosition(FromDegreeToRadiant(list[0]))
    motors[1].setPosition(FromDegreeToRadiant(list[1]))
    motors[2].setPosition(FromDegreeToRadiant(list[2]))
    motors[3].setPosition(FromDegreeToRadiant(list[3]))
    motors[4].setPosition(FromDegreeToRadiant(list[4]))
   
def move(fr,rr,fl,rl):
    wheels[0].setVelocity(fr)    
    wheels[1].setVelocity(rr)  
    wheels[2].setVelocity(fl)
    wheels[3].setVelocity(rl)

def straf_left():
    move(-5,5,5,-5)
    
def straf_right():
    move(5,-5,-5,5)   
    
def turn_left():
    move(-5,-5,5,5)   
    
def turn_right():
    move(5,5,-5,-5)  
    
def forward():
    move(-5,-5,-5,-5)   
    
def reverse():
    move(5,5,5,5)
    
def stop():
    move(0,0,0,0)  

def travel_forwad(dis):
    prev_count = -(rl_sensor.getValue() + fl_sensor.getValue()+ rr_sensor.getValue() + fr_sensor.getValue()) / 4
    current_count = -(rl_sensor.getValue() + fl_sensor.getValue()+ rr_sensor.getValue() + fr_sensor.getValue()) / 4
    traveled_dist = (current_count - prev_count)*0.037
    
    while(traveled_dist < dis):
        forward()
        current_count = -(rl_sensor.getValue() + fl_sensor.getValue()+ rr_sensor.getValue() + fr_sensor.getValue()) / 4
        traveled_dist = (current_count - prev_count)*0.037
        
        robot.step(1)
    stop()

def travel_sr(dis):
    prev_count = -( fl_sensor.getValue()+ rr_sensor.getValue() ) / 2
    current_count = -(fl_sensor.getValue()+ rr_sensor.getValue() ) / 2
    traveled_dist = (current_count - prev_count)*0.037
    
    while(traveled_dist < dis):
        straf_right()
        current_count = -( fl_sensor.getValue()+ rr_sensor.getValue() ) / 2
        traveled_dist = (current_count - prev_count)*0.037
        
        robot.step(1)
    stop()  

def travel_sl(dis):
    prev_count = -( rl_sensor.getValue()+ fr_sensor.getValue() ) / 2
    current_count = -(rl_sensor.getValue()+ fr_sensor.getValue() ) / 2
    traveled_dist = (current_count - prev_count)*0.037
    
    while(traveled_dist < dis):
        straf_left()
        current_count = -( rl_sensor.getValue()+ fr_sensor.getValue() ) / 2
        traveled_dist = (current_count - prev_count)*0.037
        
        robot.step(1)
    stop() 
            
def travel_right(dis):
    prev_count = -(rl_sensor.getValue() + fl_sensor.getValue()) / 2
    current_count = -(rl_sensor.getValue() + fl_sensor.getValue()) / 2
    traveled_dist = (current_count - prev_count)*0.037
    
    while(traveled_dist < dis):
        turn_right()
        current_count = -(rl_sensor.getValue() + fl_sensor.getValue()) / 2
        traveled_dist = (current_count - prev_count)*0.037
    
        robot.step(1)
    stop()  

def travel_left(dis):
    prev_count = -(rr_sensor.getValue() + fr_sensor.getValue()) / 2
    current_count = -(rr_sensor.getValue() + fr_sensor.getValue()) / 2
    traveled_dist = (current_count - prev_count)*0.037
    
    while(traveled_dist < dis):
        turn_left()
        current_count = -(rr_sensor.getValue() + fr_sensor.getValue()) / 2
        traveled_dist = (current_count - prev_count)*0.037
    
        robot.step(1)
    stop() 
           
home_pose = [90,-90,0,0,0,0]
pickup_pose = [90,0,0,-90,0,0]
keep_pose = [90,0,90,-90,0,0]
pose_4 = [180,0,0,0,0,0]

move_direct_kinematics(home_pose)
with open('state.txt', 'w') as file:
    file.write("1")
robot.step(1000)

def task():
    travel_left(0.15)
    travel_forwad(2.44)
    travel_left(0.15)
    travel_forwad(1.61)
    travel_right(0.31)
    move_direct_kinematics(pickup_pose)
    robot.step(5000)
    close_gripper()
    move_direct_kinematics(home_pose)
    robot.step(1000)
    travel_right(0.31)
    travel_forwad(3.33)
    travel_right(0.3)
    travel_forwad(3.33)
    move_direct_kinematics(keep_pose)
    robot.step(5000)
    open_gripper()
    move_direct_kinematics(home_pose)
    robot.step(2000)
    order = "12345"
    with open('../order.txt', 'r') as file:
        order = file.read()
    robot.step(10)
    call_robot_api(order, "3")
    travel_right(0.62)
    travel_forwad(1.666)
    
    robot.worldReload()

state = 1
color = 0
while robot.step(timestep) != -1:
    with open('state.txt', 'r') as file:
        state = int(file.read())
    robot.step(10)
    if state == 2:
        with open('../color.txt', 'r') as file:
            color = int(file.read())
        robot.step(10)
        root = robot.getRoot()
        field = root.getField("children")
        ball = field.getMFNode(color)
        target = ball.getField("translation").setSFVec3f([0.200162599578642, 2.0998855740530864, 0.3199989262253745])
        task()
        with open('state.txt', 'w') as file:
            file.write("0")
        robot.step(10)
        
        break
    pass
# Enter here exit cleanup code.