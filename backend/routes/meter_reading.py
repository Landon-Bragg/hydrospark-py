"""
Meter reading OCR routes
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import db, User, Customer, MeterReading
from services.ocr_service import OCRService
import os
from werkzeug.utils import secure_filename

meter_bp = Blueprint('meter', __name__)
ocr_service = OCRService()

UPLOAD_FOLDER = 'uploads/meter_photos'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@meter_bp.route('/upload', methods=['POST'])
@jwt_required()
def upload_meter_photo():
    """Upload meter photo and extract reading"""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if user.role != 'customer' or not user.customer:
            return jsonify({'error': 'Customer access required'}), 403
        
        if 'photo' not in request.files:
            return jsonify({'error': 'No photo file'}), 400
        
        file = request.files['photo']
        
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
        
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f"{user.customer.id}_{timestamp}_{filename}"
            
            os.makedirs(UPLOAD_FOLDER, exist_ok=True)
            filepath = os.path.join(UPLOAD_FOLDER, filename)
            file.save(filepath)
            
            # Perform OCR
            reading_value, confidence = ocr_service.extract_meter_reading(filepath)
            
            # Save reading
            meter_reading = MeterReading(
                customer_id=user.customer.id,
                image_path=filepath,
                reading_value=reading_value,
                ocr_confidence=confidence,
                is_verified=False
            )
            db.session.add(meter_reading)
            db.session.commit()
            
            # Calculate estimated bill
            from services.billing_service import BillingService
            billing_service = BillingService()
            estimated_bill = billing_service.estimate_bill_from_reading(
                user.customer.id,
                reading_value
            )
            
            return jsonify({
                'message': 'Meter reading uploaded successfully',
                'reading': meter_reading.to_dict(),
                'estimated_bill': estimated_bill
            }), 201
        
        return jsonify({'error': 'Invalid file type'}), 400
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@meter_bp.route('/readings', methods=['GET'])
@jwt_required()
def get_meter_readings():
    """Get meter readings"""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if user.role == 'customer':
            if not user.customer:
                return jsonify({'error': 'Customer profile not found'}), 404
            customer_id = user.customer.id
        else:
            customer_id = request.args.get('customer_id', type=int)
        
        query = MeterReading.query
        if customer_id:
            query = query.filter_by(customer_id=customer_id)
        
        readings = query.order_by(MeterReading.reading_date.desc()).all()
        
        return jsonify({
            'readings': [r.to_dict() for r in readings]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
