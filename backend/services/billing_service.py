"""
Billing calculation service
"""

from database import db, Customer, WaterUsage, BillingRate
from datetime import datetime, timedelta
from sqlalchemy import func

class BillingService:
    def calculate_bill(self, customer_id, start_date, end_date):
        """Calculate bill for period"""
        # Get total usage
        total_usage = db.session.query(func.sum(WaterUsage.daily_usage_ccf)).filter(
            WaterUsage.customer_id == customer_id,
            WaterUsage.usage_date >= start_date,
            WaterUsage.usage_date <= end_date
        ).scalar() or 0
        
        # Get customer type
        customer = Customer.query.get(customer_id)
        if not customer:
            return None
        
        # Get rate
        rate = BillingRate.query.filter_by(
            customer_type=customer.customer_type,
            is_active=True
        ).first()
        
        if not rate:
            rate_value = 2.50  # Default
        else:
            rate_value = float(rate.flat_rate)
        
        total_amount = float(total_usage) * rate_value
        
        return {
            'total_usage_ccf': float(total_usage),
            'rate_per_ccf': rate_value,
            'total_amount': total_amount
        }
    
    def estimate_bill_from_reading(self, customer_id, meter_reading):
        """Estimate bill from current meter reading"""
        # Get last billing period
        from database import Bill
        last_bill = Bill.query.filter_by(customer_id=customer_id).order_by(
            Bill.billing_period_end.desc()
        ).first()
        
        if not last_bill:
            # No previous bill, use default estimation
            estimated_usage = meter_reading * 0.8  # Assume 80% usage
        else:
            # Calculate usage since last bill
            estimated_usage = meter_reading - float(last_bill.total_usage_ccf)
        
        # Get rate
        customer = Customer.query.get(customer_id)
        rate = BillingRate.query.filter_by(
            customer_type=customer.customer_type,
            is_active=True
        ).first()
        
        rate_value = float(rate.flat_rate) if rate else 2.50
        estimated_amount = estimated_usage * rate_value
        
        return {
            'meter_reading': meter_reading,
            'estimated_usage_ccf': estimated_usage,
            'estimated_amount': estimated_amount,
            'rate_per_ccf': rate_value
        }
