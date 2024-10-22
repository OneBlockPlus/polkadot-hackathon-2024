from flask import Flask, render_template, request, jsonify

# Create a new Flask application instance
app = Flask(__name__)

# Define the route for the home page
@app.route('/')
def hello_word():
    # Render the 'home.html' template when the home page is accessed
    return render_template('home.html')

# Define a POST route for the API endpoint /api/scenario1
@app.route('/api/scenario1', methods=['POST'])
def scenario1():
    try:
        # Retrieve JSON data from the incoming request
        data = request.json
        order_id = data.get('orderId')
        box_colour = data.get('boxColour')

        # Open the state file for reading and writing
        with open('robot_1_controller/state.txt', 'r+') as state_file:
            state_content = state_file.read()
            
            # Check if the state is "1"
            if state_content == "1":
                # Example logic to write different values to a file based on box_colour
                with open('color.txt', 'w') as color_file:
                    if box_colour == 'purple':
                        color_file.write("15")
                    elif box_colour == 'green':
                        color_file.write("13")
                    elif box_colour == 'blue':
                        color_file.write("14")
                    else:
                        # Return an error if the boxColour is invalid
                        return jsonify({"error": "Invalid boxColour"}), 500
                
                # Update the state file to "2"
                state_file.seek(0)
                state_file.write("2")
                state_file.truncate()  # Ensure the file size is truncated to the new size
                
                # Write the order_id to a separate file
                with open('order.txt', 'w') as file:
                    file.write(order_id)
                
                # Return a success response
                return jsonify({"state": "Success"}), 200
            else:
                # Return an error if the state is not "1"
                return jsonify({"error": "Webots down"}), 500

    except Exception as e:
        # Handle any exceptions that occur during the process
        return jsonify({"error": str(e)}), 500

# Define a POST route for the API endpoint /api/scenario2
@app.route('/api/scenario2', methods=['POST'])
def scenario2():
    try:
        # Retrieve JSON data from the incoming request
        data = request.json
        order_id = data.get('orderId')
        
        # Open the state file for robot 2
        with open('robot_2_controller/state.txt', 'r+') as state_file:
            state_content = state_file.read()
            
            # Check if the state is "1"
            if state_content == "1":
                # Update the state file to "2"
                state_file.seek(0)
                state_file.write("2")
                state_file.truncate()  # Ensure the file size is truncated to the new size
                
                # Write the order_id to a separate file
                with open('order.txt', 'w') as file:
                    file.write(order_id)
                
                # Return a success response
                return jsonify({"state": "Success"}), 200
            else:
                # Return an error if the state is not "1"
                return jsonify({"error": "Webots down"}), 500

    except Exception as e:
        # Handle any exceptions that occur during the process
        return jsonify({"error": str(e)}), 500

# Define a POST route for the API endpoint /api/scenario3
@app.route('/api/scenario3', methods=['POST'])
def scenario3():
    try:
        # Retrieve JSON data from the incoming request
        data = request.json
        order_id = data.get('orderId')

        # Open the state file for robot 3
        with open('robot_3_controller/state.txt', 'r+') as state_file:
            state_content = state_file.read()
            
            # Check if the state is "1"
            if state_content == "1":
                # Update the state file to "2"
                state_file.seek(0)
                state_file.write("2")
                state_file.truncate()  # Ensure the file size is truncated to the new size
                
                # Write the order_id to a separate file
                with open('order.txt', 'w') as file:
                    file.write(order_id)
                
                # Return a success response
                return jsonify({"state": "Success"}), 200
            else:
                # Return an error if the state is not "1"
                return jsonify({"error": "Webots down"}), 500

    except Exception as e:
        # Handle any exceptions that occur during the process
        return jsonify({"error": str(e)}), 500
"""
# Define a POST route for the API endpoint /api/robot
@app.route('/api/robot', methods=['POST'])
def feedback():
    try:
        # Retrieve JSON data from the incoming request
        data = request.json
        order_id = data.get('orderId')
        robot_id = data.get('robotId')

        # Print the order_id and robot_id to the console
        print(order_id, " ", robot_id)        
        
        # Return a success response
        return jsonify({"state": "Success"}), 200
            
    except Exception as e:
        # Handle any exceptions that occur during the process
        return jsonify({"error": str(e)}), 500
"""
# Run the Flask application
if __name__ == '__main__':
    app.run()
