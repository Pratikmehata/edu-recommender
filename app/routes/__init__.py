from flask import Flask
from flask_cors import CORS
from .extensions import db, cache, jwt

def create_app(config_class='config.Config'):
    """Application factory pattern"""
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Initialize extensions
    CORS(app)
    db.init_app(app)
    cache.init_app(app)
    jwt.init_app(app)
    
    # Register blueprints
    from .routes.predictions import predictions_bp
    from .routes.analytics import analytics_bp
    app.register_blueprint(predictions_bp)
    app.register_blueprint(analytics_bp)
    
    # Load ML model
    with app.app_context():
        from .models import load_model
        app.model = load_model()
    
    return app