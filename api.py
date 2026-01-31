from flask import Flask, request, jsonify
from flask_cors import CORS
from smart_invest_logic import run_investment_analysis

app = Flask(__name__)

CORS(app)

@app.route('/analyze', methods=['POST'])
def analyze():
    # Get the JSON data sent from the React frontend
    data = request.get_json()

    if not data:
        return jsonify({"error": "Invalid input. Please provide stock and amount."}), 400

    # Call your analysis function with the received data
    analysis_result = run_investment_analysis(data)

    if "error" in analysis_result:
        return jsonify(analysis_result), 500

    # Return the result to the frontend as JSON
    return jsonify(analysis_result)

if __name__ == '__main__':
    # Run the Flask app on port 5000
    app.run(debug=True, port=5000)
