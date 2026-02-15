"""
Customer management routes
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import db, User, Customer
from functools import wraps

customers_bp = Blueprint('customers', __name__)

def admin_required(f):
    @wraps(f)
    @jwt_required()
    def decorated_function(*args, **kwargs):
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        if not user or user.role not in ['admin', 'billing']:
            return jsonify({'error': 'Admin access required'}), 403
        return f(*args, **kwargs)
    return decorated_function

@customers_bp.route('/', methods=['GET'])
@jwt_required()
def get_customers():
    """Get all customers (admin) or current customer info"""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if user.role in ['admin', 'billing']:
            # Admin/billing can see all customers
            customers = Customer.query.all()
            return jsonify({
                'customers': [c.to_dict() for c in customers]
            }), 200
        else:
            # Customer can only see their own info
            if user.customer:
                return jsonify({
                    'customer': user.customer.to_dict()
                }), 200
            return jsonify({'error': 'Customer profile not found'}), 404
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@customers_bp.route('/<int:customer_id>', methods=['GET'])
@jwt_required()
def get_customer(customer_id):
    """Get specific customer by ID"""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        customer = Customer.query.get(customer_id)
        if not customer:
            return jsonify({'error': 'Customer not found'}), 404
        
        # Check permissions
        if user.role == 'customer' and customer.user_id != user_id:
            return jsonify({'error': 'Access denied'}), 403
        
        return jsonify({'customer': customer.to_dict()}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@customers_bp.route('/<int:customer_id>', methods=['PUT'])
@jwt_required()
def update_customer(customer_id):
    """Update customer information"""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        customer = Customer.query.get(customer_id)
        if not customer:
            return jsonify({'error': 'Customer not found'}), 404
        
        # Check permissions
        if user.role == 'customer' and customer.user_id != user_id:
            return jsonify({'error': 'Access denied'}), 403
        
        data = request.get_json()
        
        # Update fields
        if 'customer_name' in data:
            customer.customer_name = data['customer_name']
        if 'mailing_address' in data:
            customer.mailing_address = data['mailing_address']
        if 'customer_type' in data and user.role in ['admin', 'billing']:
            customer.customer_type = data['customer_type']
        if 'cycle_number' in data and user.role in ['admin', 'billing']:
            customer.cycle_number = data['cycle_number']
        if 'business_name' in data:
            customer.business_name = data['business_name']
        if 'facility_name' in data:
            customer.facility_name = data['facility_name']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Customer updated successfully',
            'customer': customer.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
