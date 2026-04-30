from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required
from werkzeug.security import generate_password_hash, check_password_hash
from models import db, Admin, Complaint
import os
import threading
import time
import requests

app = Flask(__name__)
CORS(app)

# Self-pinging to prevent Render sleep
def keep_alive():
    url = "https://tejas-indane-backend.onrender.com/" # Your Render URL
    while True:
        try:
            requests.get(url)
            print("Self-ping successful!")
        except Exception as e:
            print(f"Self-ping failed: {e}")
        time.sleep(840) # Ping every 14 minutes

if os.environ.get('RENDER'):
    threading.Thread(target=keep_alive, daemon=True).start()

# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL')
if app.config['SQLALCHEMY_DATABASE_URI'] and app.config['SQLALCHEMY_DATABASE_URI'].startswith("postgres://"):
    app.config['SQLALCHEMY_DATABASE_URI'] = app.config['SQLALCHEMY_DATABASE_URI'].replace("postgres://", "postgresql://", 1)

if not app.config['SQLALCHEMY_DATABASE_URI']:
    app.config['SQLALCHEMY_DATABASE_PATH'] = os.path.join(os.getcwd(), 'complaints.db')
    app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{app.config['SQLALCHEMY_DATABASE_PATH']}"

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'tejas-indane-secret-key-2024' # Change in production

db.init_app(app)
jwt = JWTManager(app)

# Initialize database
with app.app_context():
    db.create_all()
    # Create default admin if not exists
    if not Admin.query.filter_by(username='admin').first():
        hashed_password = generate_password_hash('admin123')
        default_admin = Admin(username='admin', password=hashed_password)
        db.session.add(default_admin)
        db.session.commit()
        print("Default admin created: admin / admin123")

# --- API Routes ---

@app.route('/', methods=['GET'])
def home():
    return jsonify({"status": "healthy", "message": "Tejas Indane API is running"}), 200

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    admin = Admin.query.filter_by(username=username).first()
    if admin and check_password_hash(admin.password, password):
        access_token = create_access_token(identity=username)
        return jsonify(access_token=access_token), 200
    
    return jsonify({"msg": "Bad username or password"}), 401

@app.route('/api/complaints', methods=['POST'])
def submit_complaint():
    data = request.json
    try:
        new_complaint = Complaint(
            customer_name=data['customerName'],
            mobile_number=data['mobileNumber'],
            consumer_number=data['consumerNumber'],
            complaint_type=data['complaintType'],
            description=data['description']
        )
        db.session.add(new_complaint)
        db.session.commit()
        return jsonify({"msg": "Complaint submitted successfully!"}), 201
    except Exception as e:
        return jsonify({"msg": str(e)}), 400

@app.route('/api/complaints', methods=['GET'])
@jwt_required()
def get_complaints():
    complaints = Complaint.query.order_by(Complaint.created_at.desc()).all()
    return jsonify([c.to_dict() for c in complaints]), 200

@app.route('/api/complaints/<int:id>', methods=['PATCH'])
@jwt_required()
def update_complaint_status(id):
    data = request.json
    complaint = Complaint.query.get_or_404(id)
    if 'status' in data:
        complaint.status = data['status']
        db.session.commit()
        return jsonify({"msg": "Status updated successfully!"}), 200
    return jsonify({"msg": "No status provided"}), 400

@app.route('/api/stats', methods=['GET'])
@jwt_required()
def get_stats():
    total = Complaint.query.count()
    pending = Complaint.query.filter_by(status='Pending').count()
    resolved = Complaint.query.filter_by(status='Resolved').count()
    return jsonify({
        "total": total,
        "pending": pending,
        "resolved": resolved
    }), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)
