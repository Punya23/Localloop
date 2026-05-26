from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from model import train_rent_model, predict_rent

app = FastAPI(
    title="LocalLoop ML Service",
    description="AI-powered rent prediction for the LocalLoop platform",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class RentPredictionRequest(BaseModel):
    area: str
    room_type: str
    has_ac: int = 0
    has_food: int = 0


class RentPredictionResponse(BaseModel):
    predicted_rent: float
    currency: str = "INR"


@app.get("/")
def read_root():
    return {"status": "ML API is running", "available_models": ["Rent Predictor"]}


@app.post("/train/rent_model")
def trigger_training():
    try:
        metrics = train_rent_model()
        return {"message": "Model trained successfully", "metrics": metrics}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/predict/rent", response_model=RentPredictionResponse)
def get_prediction(data: RentPredictionRequest):
    try:
        price = predict_rent(
            area=data.area,
            room_type=data.room_type,
            has_ac=data.has_ac,
            has_food=data.has_food,
        )
        return RentPredictionResponse(predicted_rent=round(price, 2))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
