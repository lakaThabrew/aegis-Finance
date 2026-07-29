import pandas as pd
from xgboost import XGBClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
import joblib
import os
import warnings
warnings.filterwarnings('ignore')

print("Starting AutoML Fine-Tuning Pipeline...")

models_dir = "C:/Users/LOQ/Downloads/Duothon 6.0/aegis/services/fraud-ml-engine/models"
base_model_path = os.path.join(models_dir, "base_model.joblib")
meta_path = os.path.join(models_dir, "model_meta.txt")

if not os.path.exists(base_model_path):
    print("Error: Base model not found. Run train_base_model.py first.")
    exit(1)

synth_data_path = "C:/Users/LOQ/Downloads/Duothon 6.0/aegis/services/fraud-ml-engine/data/aegis_synthetic.csv"
if not os.path.exists(synth_data_path):
    print("Error: Synthetic data not found. Run dataset_generator.py first.")
    exit(1)

print("Loading Synthetic Domain Dataset...")
df = pd.read_csv(synth_data_path)
features = ['amount', 'oldbalanceOrg', 'newbalanceOrig', 'oldbalanceDest', 'newbalanceDest']

X = df[features]
y = df['isFraud']

model_type = "Unknown"
if os.path.exists(meta_path):
    with open(meta_path, "r") as f:
        model_type = f.readline().strip()

print(f"Loading Base Model ({model_type})...")
original_model = joblib.load(base_model_path)

print("Fine-tuning on domain-specific data...")

if model_type == "XGBoost":
    booster = original_model.get_booster()
    new_model = XGBClassifier(
        n_estimators=50, 
        learning_rate=0.05,
        max_depth=5,
        random_state=42,
        n_jobs=-1
    )
    new_model.fit(X, y, xgb_model=booster)
    
elif model_type == "RandomForest":
    # Enable warm start and add a few more trees for the new data
    original_model.warm_start = True
    original_model.n_estimators += 20
    original_model.fit(X, y)
    new_model = original_model
    
else:
    # For Logistic Regression or others, we can't easily strictly add trees.
    # We will fit it on the domain data (domain adaptation) using the loaded model's state as starting point
    # Note: LogisticRegression with lbfgs solver supports warm_start.
    if hasattr(original_model, 'warm_start'):
        original_model.warm_start = True
    original_model.fit(X, y)
    new_model = original_model

# Save the fine-tuned model
final_model_path = os.path.join(models_dir, "aegis_fraud_model.joblib")
joblib.dump(new_model, final_model_path)
print(f"Fine-tuned {model_type} model saved to {final_model_path}")
