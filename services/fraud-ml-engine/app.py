from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import pandas as pd
import joblib
import os
import uvicorn
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Aegis Fraud ML Engine", version="1.0.0")

model_path = "models/aegis_fraud_model.joblib"
model = None

class FraudEvaluationRequest(BaseModel):
    transactionReference: str
    amount: float
    oldbalanceOrg: float
    newbalanceOrig: float
    oldbalanceDest: float
    newbalanceDest: float

class FraudEvaluationResponse(BaseModel):
    transactionReference: str
    mlRiskScore: float
    mlProbability: float
    isAnomaly: bool

@app.on_event("startup")
def load_model():
    global model
    if os.path.exists(model_path):
        model = joblib.load(model_path)
        logger.info(f"Model loaded from {model_path}")
    else:
        logger.warning("Model not found! ML Engine will return default scores.")

@app.post("/api/v1/ml/evaluate", response_model=FraudEvaluationResponse)
def evaluate_transaction(req: FraudEvaluationRequest):
    if model is None:
        return FraudEvaluationResponse(
            transactionReference=req.transactionReference,
            mlRiskScore=0.0,
            mlProbability=0.0,
            isAnomaly=False
        )

    try:
        # Create a DataFrame for prediction matching training features
        features = pd.DataFrame([{
            'amount': req.amount,
            'oldbalanceOrg': req.oldbalanceOrg,
            'newbalanceOrig': req.newbalanceOrig,
            'oldbalanceDest': req.oldbalanceDest,
            'newbalanceDest': req.newbalanceDest
        }])

        # Predict probability of fraud (class 1)
        prob = model.predict_proba(features)[0][1]
        
        # Scale probability to a risk score (0-100)
        risk_score = round(prob * 100, 2)
        
        return FraudEvaluationResponse(
            transactionReference=req.transactionReference,
            mlRiskScore=risk_score,
            mlProbability=prob,
            isAnomaly=(risk_score > 50.0)
        )
    except Exception as e:
        logger.error(f"Error during ML evaluation: {e}")
        raise HTTPException(status_code=500, detail="Internal ML evaluation error")

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
