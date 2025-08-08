from flask import Flask, request, jsonify, render_template
import joblib
import pandas as pd
from pathlib import Path

app = Flask(__name__)

# Load model
MODEL_PATH = Path(__file__).parent / 'models' / 'model.pkl'
model = joblib.load(MODEL_PATH)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        
        # Validate input
        required_fields = ['age', 'gpa', 'math_skill', 'goal']
        if not all(field in data for field in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Prepare features
        features = pd.DataFrame([{
            'age': int(data['age']),
            'gpa': float(data['gpa']),
            'math_skill': int(data['math_skill']),
            'goal': data['goal']
        }])
        
        # Predict
        level = model.predict(features)[0]
        
        # Generate roadmap
        roadmaps = {
            'beginner': "1. Python Basics (2 weeks)\n   - Variables, loops\n   - Mini projects\n2. Math Fundamentals (2 weeks)",
            'intermediate': "1. Data Structures (3 weeks)\n   - Lists, dictionaries\n2. Algorithms (3 weeks)\n   - Sorting, searching",
            'advanced': "1. Machine Learning (4 weeks)\n   - Supervised learning\n2. Capstone Project (4 weeks)"
        }
        
        return jsonify({
            'level': level,
            'roadmap': roadmaps.get(level, "Custom learning path"),
            'success': True
        })
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'success': False
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)