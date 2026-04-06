from flask import Flask, request, jsonify
from flask_cors import CORS
from model import train_rent_model, predict_rent

app = Flask(__name__)
CORS(app)

@app.route("/", methods=["GET"])
def read_root():
    return jsonify({"status": "ML API is running", "available_models": ["Rent Predictor"]})

@app.route("/train/rent_model", methods=["POST"])
def trigger_training():
    try:
        metrics = train_rent_model()
        return jsonify({"message": "Model trained successfully", "metrics": metrics})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/predict/rent", methods=["POST"])
def get_prediction():
    try:
        data = request.json
        price = predict_rent(
            area=data.get("area"),
            room_type=data.get("room_type"),
            has_ac=int(data.get("has_ac", 0)),
            has_food=int(data.get("has_food", 0))
        )
        return jsonify({"predicted_rent": round(price, 2), "currency": "INR"})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == "__main__":
    app.run(port=8000, debug=True)
