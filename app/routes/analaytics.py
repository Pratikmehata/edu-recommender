from flask import Blueprint, jsonify
from ..extensions import db
from datetime import datetime, timedelta

analytics_bp = Blueprint('analytics', __name__)

@analytics_bp.route('/metrics')
def get_metrics():
    """System performance metrics"""
    try:
        # Prediction volume (last 24 hours)
        pred_count = db.session.execute(
            "SELECT COUNT(*) FROM predictions WHERE timestamp > :cutoff",
            {'cutoff': datetime.utcnow() - timedelta(hours=24)}
        ).scalar()
        
        # Average processing time
        avg_time = db.session.execute(
            "SELECT AVG(processing_time) FROM predictions"
        ).scalar() or 0
        
        return jsonify({
            'predictions_24h': pred_count,
            'avg_processing_time_ms': round(avg_time, 2),
            'system_status': 'operational'
        })
    
    except Exception as e:
        current_app.logger.error(f"Analytics error: {str(e)}")
        return jsonify({'error': 'Failed to get metrics'}), 500