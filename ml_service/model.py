import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
import pickle
import os

MODEL_PATH = "rent_model.pkl"

def generate_mock_data():
    np.random.seed(42)
    # Generate ~500 sample data points for Pune areas
    areas = ['Hinjewadi', 'Kothrud', 'Viman Nagar', 'Wakad', 'Kharadi']
    room_types = ['Single Room', 'Double Sharing', 'Triple Sharing']
    
    data = []
    for _ in range(500):
        area = np.random.choice(areas)
        room_type = np.random.choice(room_types)
        has_ac = np.random.choice([0, 1])
        has_food = np.random.choice([0, 1])
        
        # Base rent calculation
        base_rent = 10000
        if area in ['Viman Nagar', 'Kharadi']:
            base_rent += 3000
        elif area in ['Hinjewadi', 'Wakad']:
            base_rent += 1500
        
        if room_type == 'Single Room':
            base_rent += 5000
        elif room_type == 'Triple Sharing':
            base_rent -= 3000
            
        if has_ac:
            base_rent += 2500
        if has_food:
            base_rent += 3000
            
        noise = np.random.normal(0, 1000)
        rent = max(4000, base_rent + noise)
        
        data.append({
            'area': area,
            'room_type': room_type,
            'has_ac': has_ac,
            'has_food': has_food,
            'rent': rent
        })
        
    df = pd.DataFrame(data)
    # One-hot encoding
    df = pd.get_dummies(df, columns=['area', 'room_type'])
    return df

def train_rent_model():
    df = generate_mock_data()
    X = df.drop('rent', axis=1)
    y = df['rent']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    predictions = model.predict(X_test)
    mae = mean_absolute_error(y_test, predictions)
    r2 = r2_score(y_test, predictions)
    
    # Save model and columns
    with open(MODEL_PATH, 'wb') as f:
        pickle.dump({'model': model, 'columns': X.columns.tolist()}, f)
        
    return {"mae": mae, "r2_score": r2, "status": "Training complete"}

def load_model():
    if not os.path.exists(MODEL_PATH):
        train_rent_model()
    with open(MODEL_PATH, 'rb') as f:
        return pickle.load(f)

def predict_rent(area: str, room_type: str, has_ac: int, has_food: int):
    # Load model
    data = load_model()
    model = data['model']
    cols = data['columns']
    
    # Create input vector with 0s
    input_df = pd.DataFrame(columns=cols)
    input_df.loc[0] = 0
    
    # Set features based on user input
    area_col = f'area_{area}'
    type_col = f'room_type_{room_type}'
    
    if area_col in cols:
        input_df.loc[0, area_col] = 1
    if type_col in cols:
        input_df.loc[0, type_col] = 1
        
    input_df.loc[0, 'has_ac'] = has_ac
    input_df.loc[0, 'has_food'] = has_food
    
    predicted_price = model.predict(input_df)[0]
    return float(predicted_price)
