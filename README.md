# HydroSpark Measurement and Billing System

A comprehensive water utility management system with ML-based forecasting, anomaly detection, and automated billing.

## 🌊 Features

### Customer Features
- **User Registration & Login** - Self-registration with admin approval workflow
- **Historical Usage Dashboard** - View all water usage data with charts and statistics
- **12-Month Forecasting** - AI-powered predictions of future water usage and costs
- **Bill Estimation** - Upload meter photos for instant bill estimates using OCR
- **Anomaly Alerts** - Get notified of unusual usage patterns (leaks, spikes)
- **Bill Management** - View current and past bills

### Admin Features
- **User Management** - Approve registrations, create accounts, manage roles
- **Data Import** - Bulk import 1M+ rows of usage data from CSV/XLSX
- **Billing Management** - Generate bills, configure rates
- **Anomaly Detection** - ML-based detection with dynamic thresholds
- **Analytics Dashboard** - System-wide metrics and insights
- **Audit Logs** - Track all system actions

### Technical Features
- **Role-Based Access Control** (Admin, Billing, Customer)
- **ML-Powered Forecasting** using Facebook Prophet
- **Anomaly Detection** using Isolation Forest
- **OCR Meter Reading** using Tesseract (no API key needed)
- **Email Notifications** via Gmail SMTP
- **RESTful API** with JWT authentication
- **Responsive UI** with Tailwind CSS

## 🎨 Brand Colors

- **Deep Aqua Blue** (#0A4C78) - Primary logo color, headers
- **Spark Blue** (#1EA7D6) - Accent color, highlights
- **Soft Sky Blue** (#E6F6FB) - Backgrounds, panels
- **Clean White** (#FFFFFF) - Primary background
- **Charcoal Gray** (#2E2E2E) - Body text
- **Fresh Green** (#5FB58C) - Success states, sustainability

## 🚀 Quick Start
Email: customer_958213684@hydrospark.com
Password: welcome123
Customer: Ava Walker

Email: customer_772641217@hydrospark.com
Password: welcome123
Customer: Benjamin White

Email: customer_186640798@hydrospark.com
Password: welcome123
Customer: City of Dallas Public Works

Email: customer_833244776@hydrospark.com
Password: welcome123
Customer: Taylor Davis
### Prerequisites
- Docker & Docker Compose
- Git
- 4GB+ RAM recommended

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd hydrospark-system
```

2. **Create environment file**
```bash
cp .env.example .env
```

The `.env` file is pre-configured with:
- Database: `root/password`
- Gmail: `conbenlan@gmail.com` with app password
- JWT secret will auto-generate on first run

3. **Start the application**
```bash
docker-compose up --build
```

This will start:
- **MySQL** on port 3307
- **Backend API** on port 5000
- **Frontend** on port 3000

4. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- API Health: http://localhost:5000/api/health

### Default Admin Credentials
```
Email: admin@hydrospark.com
Password: admin123
```

## 📊 Data Import

To import your 1M+ row dataset:

1. Log in as admin
2. Navigate to Admin > Data Import
3. Upload your CSV/XLSX file with these columns:
   - Customer Name
   - Mailing Address
   - Location ID
   - Customer Type
   - Cycle Number
   - Customer Phone Number (optional)
   - Business Name (optional)
   - Facility Name (optional)
   - Year
   - Month
   - Day
   - Daily Water Usage (CCF)

Or use the API endpoint:
```bash
curl -X POST http://localhost:5000/api/admin/import/usage \
  -H "Authorization: Bearer <your-token>" \
  -F "file=@your-data.csv"
```

## 🔧 API Documentation

### Authentication
```bash
# Login
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password"
}

# Register
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "password",
  "first_name": "John",
  "last_name": "Doe",
  "customer_name": "John Doe",
  "mailing_address": "123 Main St"
}
```

### Usage Data
```bash
# Get usage data
GET /api/usage?start_date=2024-01-01&end_date=2024-12-31
Authorization: Bearer <token>

# Get usage summary
GET /api/usage/summary?customer_id=1
Authorization: Bearer <token>
```

### Forecasting
```bash
# Generate 12-month forecast
POST /api/forecasts/generate
Authorization: Bearer <token>
{
  "customer_id": 1,
  "months": 12
}

# Get forecasts
GET /api/forecasts?customer_id=1
Authorization: Bearer <token>
```

### Anomaly Detection
```bash
# Detect anomalies
POST /api/alerts/detect
Authorization: Bearer <token>
{
  "customer_id": 1
}

# Get alerts
GET /api/alerts?customer_id=1&status=new
Authorization: Bearer <token>
```

### Meter Reading
```bash
# Upload meter photo
POST /api/meter/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data
photo: <image-file>
```

## 🤖 Machine Learning Models

### Forecasting (Facebook Prophet)
- **Training Data**: Last 2 years of usage
- **Forecast Period**: 12 months ahead
- **Features**: Daily, weekly, and yearly seasonality
- **Output**: Predicted usage + confidence intervals

### Anomaly Detection (Isolation Forest)
- **Algorithm**: Isolation Forest with 10% contamination
- **Threshold**: ML-based dynamic threshold (50%+ deviation)
- **Risk Score**: 0-100 based on deviation magnitude
- **Alert Types**: Spike, Leak, Unusual Pattern

### Model Evaluation
```bash
# Evaluate forecast accuracy
GET /api/forecasts/evaluate?customer_id=1
Authorization: Bearer <token>

Returns: MAPE, RMSE, Accuracy %
```

## 📧 Email Notifications

The system sends email notifications for:
- New user registration (to admins)
- Account approval
- Bill generation
- Anomaly alerts
- Payment reminders

Gmail SMTP is pre-configured. To use a different email:
1. Update `.env`:
   ```
   GMAIL_USER=your-email@gmail.com
   GMAIL_APP_PASSWORD=your-app-password
   ```
2. For Gmail, generate an app password:
   - Google Account > Security > 2-Step Verification > App Passwords
   - Generate password for "Mail"

## 🗄️ Database Schema

Key tables:
- **users** - Authentication and roles
- **customers** - Customer profiles
- **water_usage** - Daily usage records (1M+ rows)
- **bills** - Generated bills
- **anomaly_alerts** - Detected anomalies
- **usage_forecasts** - ML predictions
- **meter_readings** - OCR meter photos
- **audit_log** - System audit trail

