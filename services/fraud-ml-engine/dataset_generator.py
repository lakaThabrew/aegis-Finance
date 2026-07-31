import pandas as pd
import numpy as np
import os

print("Generating Aegis Synthetic Domain Dataset...")

# We generate 5,000 normal transactions and 500 fraudulent ones tailored to our system
n_normal = 5000
n_fraud = 500

np.random.seed(42)

# Normal transactions (mostly small amounts, under 10000)
normal_amount = np.random.exponential(scale=2000, size=n_normal)
# Cap normal amounts to mostly be under 10000
normal_amount = np.clip(normal_amount, 10, 9500)

normal_oldbalanceOrg = np.random.uniform(500, 20000, size=n_normal)
normal_newbalanceOrig = normal_oldbalanceOrg - normal_amount

normal_oldbalanceDest = np.random.uniform(0, 50000, size=n_normal)
normal_newbalanceDest = normal_oldbalanceDest + normal_amount

normal_isFraud = np.zeros(n_normal)

# Fraudulent transactions (High amounts, specifically bypassing our $10k threshold or just above it)
# e.g., amounts between 9,000 and 25,000, where old balance is suddenly drained
fraud_amount = np.random.uniform(9500, 50000, size=n_fraud)
fraud_oldbalanceOrg = fraud_amount + np.random.uniform(0, 100, size=n_fraud) # Draining the account completely
fraud_newbalanceOrig = fraud_oldbalanceOrg - fraud_amount

fraud_oldbalanceDest = np.random.uniform(0, 10000, size=n_fraud)
fraud_newbalanceDest = fraud_oldbalanceDest + fraud_amount

fraud_isFraud = np.ones(n_fraud)

# Combine
amount = np.concatenate([normal_amount, fraud_amount])
oldbalanceOrg = np.concatenate([normal_oldbalanceOrg, fraud_oldbalanceOrg])
newbalanceOrig = np.concatenate([normal_newbalanceOrig, fraud_newbalanceOrig])
oldbalanceDest = np.concatenate([normal_oldbalanceDest, fraud_oldbalanceDest])
newbalanceDest = np.concatenate([normal_newbalanceDest, fraud_newbalanceDest])
isFraud = np.concatenate([normal_isFraud, fraud_isFraud])

df = pd.DataFrame({
    'amount': amount,
    'oldbalanceOrg': oldbalanceOrg,
    'newbalanceOrig': newbalanceOrig,
    'oldbalanceDest': oldbalanceDest,
    'newbalanceDest': newbalanceDest,
    'isFraud': isFraud
})

# Shuffle
df = df.sample(frac=1, random_state=42).reset_index(drop=True)

os.makedirs("data", exist_ok=True)
df.to_csv("data/aegis_synthetic.csv", index=False)

print(f"Generated {len(df)} records (Fraud: {int(df['isFraud'].sum())}). Saved to data/aegis_synthetic.csv")
