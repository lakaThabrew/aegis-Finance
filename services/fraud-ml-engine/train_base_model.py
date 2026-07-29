import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, roc_auc_score
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from xgboost import XGBClassifier
import joblib
import time
import os

print("Starting AutoML Base Model Training Pipeline...")
start_time = time.time()

data_path = "C:/Users/LOQ/Downloads/Duothon 6.0/aegis/services/fraud-ml-engine/data/paysim.csv"
if not os.path.exists(data_path):
    print(f"Error: Dataset not found at {data_path}.")
    exit(1)

print("Loading PaySim dataset...")
# Load a subset to keep training times reasonable for demonstration
# Using usecols and float32 dtypes to drastically reduce memory usage
columns_to_use = ['amount', 'oldbalanceOrg', 'newbalanceOrig', 'oldbalanceDest', 'newbalanceDest', 'isFraud']
dtypes = {
    'amount': np.float32, 'oldbalanceOrg': np.float32, 'newbalanceOrig': np.float32,
    'oldbalanceDest': np.float32, 'newbalanceDest': np.float32, 'isFraud': np.int8
}
df = pd.read_csv(data_path, nrows=500000, usecols=columns_to_use, dtype=dtypes)

features = ['amount', 'oldbalanceOrg', 'newbalanceOrig', 'oldbalanceDest', 'newbalanceDest']
X = df[features]
y = df['isFraud']

print(f"Loaded {len(df)} records. Fraud cases: {y.sum()}")

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)

# Calculate scale_pos_weight for imbalanced classes
fraud_count = y_train.sum()
normal_count = len(y_train) - fraud_count
scale_pos_weight = normal_count / fraud_count if fraud_count > 0 else 1

print("\n--- Training Candidates ---")

models = {
    "LogisticRegression": LogisticRegression(class_weight='balanced', max_iter=1000, random_state=42),
    "RandomForest": RandomForestClassifier(n_estimators=50, max_depth=10, class_weight='balanced', random_state=42, n_jobs=-1),
    "XGBoost": XGBClassifier(n_estimators=50, max_depth=5, learning_rate=0.1, scale_pos_weight=scale_pos_weight, random_state=42, n_jobs=-1)
}

results = {}
best_model_name = None
best_score = -1
best_model = None

for name, model in models.items():
    print(f"Training {name}...")
    t0 = time.time()
    model.fit(X_train, y_train)
    
    # Predict probabilities for ROC-AUC
    y_prob = model.predict_proba(X_test)[:, 1]
    score = roc_auc_score(y_test, y_prob)
    
    train_time = time.time() - t0
    results[name] = {"roc_auc": score, "time": train_time}
    print(f"  -> ROC-AUC: {score:.4f} (Took {train_time:.2f}s)")
    
    if score > best_score:
        best_score = score
        best_model_name = name
        best_model = model

print("\n=== AutoML Leaderboard ===")
for name, metrics in sorted(results.items(), key=lambda item: item[1]['roc_auc'], reverse=True):
    print(f"{name:20s} | ROC-AUC: {metrics['roc_auc']:.4f} | Time: {metrics['time']:.2f}s")

print(f"\nWinner: {best_model_name} with ROC-AUC {best_score:.4f}")

# Save the best model
models_dir = "C:/Users/LOQ/Downloads/Duothon 6.0/aegis/services/fraud-ml-engine/models"
os.makedirs(models_dir, exist_ok=True)
model_path = os.path.join(models_dir, "base_model.joblib")
joblib.dump(best_model, model_path)
print(f"Best model saved to {model_path}")

# Also save a metadata file so fine-tuning script knows what it is, and store training info
metadata_path = os.path.join(models_dir, "model_meta.txt")
with open(metadata_path, "w") as f:
    f.write(best_model_name + "\n")
    f.write(f"Best ROC-AUC: {best_score:.4f}\n")
    f.write(f"Total records used for training: {len(df)}\n")
    f.write(f"Fraud cases in training subset: {y.sum()}\n")
    f.write("=== Leaderboard ===\n")
    for name, metrics in sorted(results.items(), key=lambda item: item[1]['roc_auc'], reverse=True):
        f.write(f"{name}: ROC-AUC: {metrics['roc_auc']:.4f}, Time: {metrics['time']:.2f}s\n")
    f.write(f"Total pipeline time: {time.time() - start_time:.2f} seconds\n")

print(f"Pipeline completed in {time.time() - start_time:.2f} seconds.")
