from flask import Flask, request, jsonify


app = Flask(__name__)

@app.route('/receive_data', methods=['POST'])
def receive_data():
    data = request.get_json()

    # Check if the data is in the expected format
    if data and "Type" in data and "data" in data:
        if data["Type"] == "master":
            f = open("master.txt", "w")
            f.write(str(data['data']))
            f.close()
            return jsonify({"status": "success", "message": "Master data received", "received": data})
        elif data["Type"] == "slave":
            f = open("slave.txt", "w")
            f.write(str(data['data']))
            f.close()
            return jsonify({"status": "success", "message": "Slave data received", "received": data})
    else:
        return jsonify({"status": "error", "message": "Invalid JSON format"}), 400

@app.route('/send_data', methods=['GET', 'POST'])
def send_data():
    if request.method == 'GET':
        # Handle Type from query parameters
        data_type = request.args.get('Type', 'master')
    else:
        # For POST, handle JSON data
        data = request.get_json()
        if data and "Type" in data:
            data_type = data["Type"]
        else:
            return jsonify({"status": "error", "message": "Invalid JSON format"}), 400

    file_name = "master.txt" if data_type == "master" else "slave.txt"

    # Try to read the file content
    try:
        with open(file_name, "r") as f:
            response = f.read()
        return jsonify({"status": "success", "data": response})
    except FileNotFoundError:
        return jsonify({"status": "error", "message": f"No data found for {file_name}"}), 404
    except Exception as e:
        return jsonify({"status": "error", "message": f"Failed to read data: {str(e)}"}), 500


