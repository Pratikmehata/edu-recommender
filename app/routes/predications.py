from flask import Blueprint, request, jsonify
import pandas as pd
from ..extensions import cache
from datetime import timedelta

predictions_bp = Blueprint('predictions', __name__)

@predictions_bp.route('/predict', methods=['POST'])
@cache.cached(timeout=300, key_prefix=lambda: request.json)
def predict():
    """Main prediction endpoint"""
    try:
        data = request.json
        
        # Validate input
        required = ['age', 'gpa', 'math_skill', 'goal']
        if not all(k in data for k in required):
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Prepare features (must match training data structure)
        features = pd.DataFrame([{
            'age': int(data['age']),
            'gpa': float(data['gpa']),
            'math_skill': int(data['math_skill']),
            'goal': data['goal']
        }])
        
        # Get prediction
        level = current_app.model.predict(features)[0]
        
        # Generate roadmap
        roadmap = generate_roadmap(level, data)
        
        return jsonify({
            'level': level,
            'roadmap': roadmap,
            'model_version': current_app.config['MODEL_VERSION']
        })
    
    except Exception as e:
        current_app.logger.error(f"Prediction error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

def generate_roadmap(level, data):
    """Generate personalized roadmap"""
    templates = {
        'beginner': f"""BEGINNER PATH for {data['goal'].replace('_', ' ').title()}
        
        1. Fundamentals (4 weeks)
           - Core concepts
           - Hands-on exercises
           - Weekly quizzes
        
        2. Foundational Project (2 weeks)
           - Apply basics
           - Get feedback""",
        
        'intermediate': f"""INTERMEDIATE PATH for {data['goal'].replace('_', ' ').title()}
        
        1. Core Concepts (6 weeks)
           - Advanced topics
           - Case studies
        
        2. Portfolio Project (4 weeks)
           - Real-world application
           - Code reviews""",
        
        'advanced': f"""ADVANCED PATH for {data['goal'].replace('_', ' ').title()}
        
        1. Specialization (8 weeks)
           - Master advanced techniques
           - Research papers
        
        2. Capstone Project (6 weeks)
           - Industry-level project
           - Performance optimization"""
    }
    
    return templates.get(level, "Custom learning path")