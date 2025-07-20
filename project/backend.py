from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
from faker import Faker
from datetime import datetime, timedelta, timezone
import hashlib
import uuid
import os
import json
from werkzeug.utils import secure_filename

# --- Config ---
API_KEY = '007085'
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf', 'png', 'jpg', 'jpeg', 'gif', 'doc', 'docx'}

# --- Users (expanded to 3 users) ---
USERS = {
    'aditya123': {
        "username": "Aditya Ankanath",
        "role": "user",
        "watermark": True, 
        "policy": True, 
        "honeytoken": True, 
        "expiry_date": "2025-07-30"
    },
    'ace277': {
        "username": "Anirudh C",
        "role": "user",
        "watermark": True, 
        "policy": True, 
        "honeytoken": True, 
        "expiry_date": "2025-07-30"
    },
    'tulya343': {
        "username": "Tulya Reddy",
        "role": "user",
        "watermark": True, 
        "policy": True, 
        "honeytoken": True, 
        "expiry_date": "2025-07-30"
    },
    'admin': {
        "username": "System Admin",
        "role": "admin",
        "watermark": True, 
        "policy": True, 
        "honeytoken": True, 
        "expiry_date": "2025-07-30"
    }
}

# --- In-memory stores ---
access_logs = []
user_notifications = []
user_access_history = []
last_policy = {"expiry_date": "2099-12-31", "geo_restriction": "IN"}
alerts = []
restriction_requests = []
trap_logs = []
blocked_partner_user = set()
decode_log = []

# File storage
user_files = {}
access_requests = []
file_alerts = []

# Risk engine state
suspicious_hours = set(range(0, 7))
partner_scores = {}
partner_access_times = {}
partner_trap_counts = {}
partner_traits = {}
restricted_partners = {}
deception_state = {}
detailed_access_log = []
alert_log = []
trap_hits = {}
trap_impact_log = []

fake = Faker()

# --- Flask app ---
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True,
     allow_headers=["Content-Type", "X-API-Key"], methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

# Create upload directory
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
for user_id in USERS.keys():
    os.makedirs(os.path.join(UPLOAD_FOLDER, user_id), exist_ok=True)

def check_api_key(request):
    api_key = request.headers.get('X-API-Key')
    return api_key == API_KEY

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def generate_honeytoken_code():
    return str(uuid.uuid4())[:8].upper()

# Initialize some demo files
def init_demo_files():
    demo_files = [
        {
            "fileId": "file_001",
            "ownerId": "aditya123",
            "filename": "Financial_Report_Q4.pdf",
            "type": "pdf",
            "size": "2.4 MB",
            "uploadDate": "2024-01-15T10:30:00Z",
            "sharedWith": [],
            "honeytoken": generate_honeytoken_code(),
            "description": "Quarterly financial analysis and projections"
        },
        {
            "fileId": "file_002",
            "ownerId": "aditya123",
            "filename": "Customer_Database.xlsx",
            "type": "xlsx",
            "size": "5.1 MB",
            "uploadDate": "2024-01-14T14:20:00Z",
            "sharedWith": ["ace277"],
            "honeytoken": generate_honeytoken_code(),
            "description": "Customer contact information and preferences"
        },
        {
            "fileId": "file_003",
            "ownerId": "ace277",
            "filename": "Marketing_Strategy_2024.pptx",
            "type": "pptx",
            "size": "8.7 MB",
            "uploadDate": "2024-01-16T09:15:00Z",
            "sharedWith": [],
            "honeytoken": generate_honeytoken_code(),
            "description": "Comprehensive marketing strategy for 2024"
        },
        {
            "fileId": "file_004",
            "ownerId": "ace277",
            "filename": "Product_Roadmap.pdf",
            "type": "pdf",
            "size": "1.8 MB",
            "uploadDate": "2024-01-13T16:45:00Z",
            "sharedWith": ["tulya343"],
            "honeytoken": generate_honeytoken_code(),
            "description": "Product development timeline and milestones"
        },
        {
            "fileId": "file_005",
            "ownerId": "tulya343",
            "filename": "Security_Audit_Report.pdf",
            "type": "pdf",
            "size": "3.2 MB",
            "uploadDate": "2024-01-12T11:30:00Z",
            "sharedWith": [],
            "honeytoken": generate_honeytoken_code(),
            "description": "Annual security assessment and recommendations"
        },
        {
            "fileId": "file_006",
            "ownerId": "tulya343",
            "filename": "Employee_Handbook.docx",
            "type": "docx",
            "size": "1.5 MB",
            "uploadDate": "2024-01-11T13:20:00Z",
            "sharedWith": ["aditya123", "ace277"],
            "honeytoken": generate_honeytoken_code(),
            "description": "Company policies and employee guidelines"
        }
    ]
    
    for file_data in demo_files:
        user_files[file_data["fileId"]] = file_data

init_demo_files()

# --- Utility functions ---
def generate_watermark(partner_id, timestamp, user_id):
    combined = f"{partner_id}|{timestamp}|{user_id}".encode('utf-8')
    return hashlib.sha256(combined).hexdigest()

def generate_honeytoken():
    token = {
        "name": fake.name(),
        "email": fake.email(),
        "record_id": str(uuid.uuid4()),
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    return token

def generate_policy(purpose, days_valid, region):
    expiry = (datetime.now(timezone.utc) + timedelta(days=days_valid)).date().isoformat()
    return {
        "purpose": purpose,
        "expiry_date": expiry,
        "retention_policy": "standard",
        "geo_restriction": region
    }

def generate_synthetic_data(partner_id=None):
    return {
        "name": fake.name(),
        "email": fake.email(),
        "phone": fake.phone_number(),
        "region": fake.country(),
        "record_id": str(uuid.uuid4())
    }

def create_file_alert(file_id, owner_id, requester_id, alert_type, message):
    alert = {
        "id": str(uuid.uuid4()),
        "fileId": file_id,
        "ownerId": owner_id,
        "requesterId": requester_id,
        "type": alert_type,
        "message": message,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "read": False
    }
    file_alerts.append(alert)
    
    # Also add to user notifications
    user_notifications.append({
        "user": owner_id,
        "type": "threat" if alert_type == "unauthorized_access" else "info",
        "message": message,
        "timestamp": alert["timestamp"]
    })
    
    return alert

# --- Risk engine logic ---
def activate_deception_mode(partner_id):
    if not deception_state.get(partner_id):
        deception_state[partner_id] = True
        alert_log.append({
            "partner": partner_id,
            "event": "deception_mode_activated",
            "timestamp": datetime.now(timezone.utc).isoformat()
        })

def update_risk_score(partner_id, reason, user_id=None):
    score = 0
    trait = None
    now = datetime.now(timezone.utc)
    hour = now.hour
    if partner_id not in partner_access_times:
        partner_access_times[partner_id] = []
    partner_access_times[partner_id].append(now)
    partner_access_times[partner_id] = [t for t in partner_access_times[partner_id] if (now-t).total_seconds() < 600]
    freq = len(partner_access_times[partner_id])
    if partner_id not in partner_trap_counts:
        partner_trap_counts[partner_id] = 0
    if reason == "trap":
        score = 80
        partner_trap_counts[partner_id] += 1
        trait = "reckless"
        trap_hits[partner_id] = trap_hits.get(partner_id, 0) + 1
        trap_impact_log.append({
            "partner": partner_id,
            "user": user_id,
            "timestamp": now.isoformat(),
            "event": "trap_hit",
            "trap_hits": trap_hits[partner_id]
        })
        if trap_hits[partner_id] >= 3:
            if partner_id not in restricted_partners:
                restricted_partners[partner_id] = set()
            if user_id:
                restricted_partners[partner_id].add(user_id)
            alert_log.append({
                "partner": partner_id,
                "event": "blocked_after_3_trap_hits",
                "timestamp": now.isoformat()
            })
    elif reason == "late_access":
        score = 10
        if hour in suspicious_hours:
            trait = "nocturnal"
    elif reason == "high_frequency":
        score = 10
        if freq > 5:
            trait = "bursty"
    elif reason == "region_mismatch":
        score = 20
    else:
        score = 0
    partner_scores[partner_id] = partner_scores.get(partner_id, 0) + score
    if partner_id not in partner_traits:
        partner_traits[partner_id] = set()
    if trait:
        partner_traits[partner_id].add(trait)
    if freq > 10 and partner_trap_counts[partner_id] == 0:
        partner_traits[partner_id].add("stealthy")
    if partner_scores[partner_id] >= 80:
        activate_deception_mode(partner_id)
    return partner_scores[partner_id]

def calculate_risk_score(partner_id, endpoint, user_id=None):
    if endpoint == "/generate_honeytoken":
        return update_risk_score(partner_id, "trap", user_id)
    now = datetime.now(timezone.utc)
    hour = now.hour
    if hour in suspicious_hours:
        return update_risk_score(partner_id, "late_access", user_id)
    if partner_id in partner_access_times and len(partner_access_times[partner_id]) > 5:
        return update_risk_score(partner_id, "high_frequency", user_id)
    return partner_scores.get(partner_id, 0)

# --- API Endpoints ---
@app.route('/health')
def health():
    return jsonify({
        "status": "running",
        "service": "Data Sentinel Backend",
        "version": "1.0.0",
        "message": "Backend is healthy and ready!",
        "users": len(USERS),
        "files": len(user_files)
    })

# --- Authentication ---
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user_id = data.get('user_id')
    api_key = data.get('api_key')
    
    if api_key != API_KEY:
        return jsonify({"error": "Invalid API key"}), 401
    
    if user_id not in USERS:
        return jsonify({"error": "User not found"}), 404
    
    user_data = USERS[user_id].copy()
    user_data['id'] = user_id
    
    return jsonify({
        "user": user_data,
        "token": "demo_token",
        "message": "Login successful"
    })

# --- User Management ---
@app.route('/users', methods=['GET'])
def get_users():
    if not check_api_key(request):
        return jsonify({"error": "Unauthorized"}), 401
    
    users_list = []
    for user_id, user_data in USERS.items():
        if user_data['role'] != 'admin':  # Don't include admin in partner list
            users_list.append({
                "id": user_id,
                "username": user_data['username'],
                "role": user_data['role']
            })
    
    return jsonify(users_list)

# --- File Management ---
@app.route('/files', methods=['GET'])
def get_files():
    if not check_api_key(request):
        return jsonify({"error": "Unauthorized"}), 401
    
    user_id = request.args.get('user_id')
    owner_id = request.args.get('owner_id')
    
    if owner_id:
        # Get files owned by specific user
        files = [f for f in user_files.values() if f['ownerId'] == owner_id]
    elif user_id:
        # Get files accessible to user (owned + shared)
        files = [f for f in user_files.values() if f['ownerId'] == user_id or user_id in f.get('sharedWith', [])]
    else:
        # Get all files
        files = list(user_files.values())
    
    return jsonify(files)

@app.route('/upload', methods=['POST'])
def upload_file():
    if not check_api_key(request):
        return jsonify({"error": "Unauthorized"}), 401
    
    user_id = request.form.get('user_id')
    description = request.form.get('description', '')
    
    if not user_id or user_id not in USERS:
        return jsonify({"error": "Invalid user"}), 400
    
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_id = str(uuid.uuid4())
        user_folder = os.path.join(UPLOAD_FOLDER, user_id)
        file_path = os.path.join(user_folder, f"{file_id}_{filename}")
        
        # Save file
        file.save(file_path)
        
        # Get file size
        file_size = os.path.getsize(file_path)
        file_size_mb = round(file_size / (1024 * 1024), 1)
        
        # Create file record
        file_data = {
            "fileId": file_id,
            "ownerId": user_id,
            "filename": filename,
            "type": filename.rsplit('.', 1)[1].lower(),
            "size": f"{file_size_mb} MB",
            "uploadDate": datetime.now(timezone.utc).isoformat(),
            "sharedWith": [],
            "honeytoken": generate_honeytoken_code(),
            "description": description,
            "path": file_path
        }
        
        user_files[file_id] = file_data
        
        return jsonify({
            "message": "File uploaded successfully",
            "file": file_data
        })
    
    return jsonify({"error": "Invalid file type"}), 400

@app.route('/download/<file_id>')
def download_file(file_id):
    if not check_api_key(request):
        return jsonify({"error": "Unauthorized"}), 401
    
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({"error": "Missing user_id"}), 400
    
    if file_id not in user_files:
        return jsonify({"error": "File not found"}), 404
    
    file_data = user_files[file_id]
    
    # Check access permissions
    if file_data['ownerId'] == user_id or user_id in file_data.get('sharedWith', []):
        # Log legitimate access
        access_logs.append({
            "fileId": file_id,
            "filename": file_data['filename'],
            "ownerId": file_data['ownerId'],
            "accessedBy": user_id,
            "method": "download",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "ip": request.remote_addr
        })
        
        # For demo purposes, return file info instead of actual file
        # In production, you would use send_file(file_data['path'])
        return jsonify({
            "message": f"Downloading {file_data['filename']}",
            "file": file_data
        })
    else:
        # Unauthorized access attempt - trigger trap
        create_file_alert(
            file_id,
            file_data['ownerId'],
            user_id,
            "unauthorized_access",
            f"Unauthorized download attempt for {file_data['filename']} by {USERS[user_id]['username']}"
        )
        
        # Update risk score
        update_risk_score(user_id, "trap", file_data['ownerId'])
        
        return jsonify({"error": "Access denied - security alert triggered"}), 403

@app.route('/partner-files', methods=['GET'])
def get_partner_files():
    if not check_api_key(request):
        return jsonify({"error": "Unauthorized"}), 401
    
    current_user = request.args.get('user_id')
    if not current_user:
        return jsonify({"error": "Missing user_id"}), 400
    
    # Get files owned by other users
    partner_files = {}
    for file_id, file_data in user_files.items():
        if file_data['ownerId'] != current_user:
            owner_id = file_data['ownerId']
            if owner_id not in partner_files:
                partner_files[owner_id] = {
                    "owner": USERS[owner_id]['username'],
                    "files": []
                }
            
            # Check if user has access
            has_access = current_user in file_data.get('sharedWith', [])
            
            # Check for pending requests
            pending_request = any(
                req['fileId'] == file_id and req['requesterId'] == current_user and req['status'] == 'pending'
                for req in access_requests
            )
            
            file_info = file_data.copy()
            file_info['hasAccess'] = has_access
            file_info['pendingRequest'] = pending_request
            partner_files[owner_id]['files'].append(file_info)
    
    return jsonify(partner_files)

# --- Access Request Management ---
@app.route('/request-access', methods=['POST'])
def request_access():
    if not check_api_key(request):
        return jsonify({"error": "Unauthorized"}), 401
    
    data = request.get_json()
    file_id = data.get('file_id')
    requester_id = data.get('requester_id')
    message = data.get('message', '')
    honeytoken = data.get('honeytoken', '')
    
    if not file_id or not requester_id:
        return jsonify({"error": "Missing file_id or requester_id"}), 400
    
    if file_id not in user_files:
        return jsonify({"error": "File not found"}), 404
    
    file_data = user_files[file_id]
    owner_id = file_data['ownerId']
    
    # Check if already has access
    if requester_id in file_data.get('sharedWith', []):
        return jsonify({"error": "Access already granted"}), 400
    
    # Check for existing pending request
    existing_request = any(
        req['fileId'] == file_id and req['requesterId'] == requester_id and req['status'] == 'pending'
        for req in access_requests
    )
    
    if existing_request:
        return jsonify({"error": "Request already pending"}), 400
    
    # If honeytoken provided, validate it
    if honeytoken:
        if honeytoken == file_data.get('honeytoken'):
            # Valid honeytoken - grant immediate access
            file_data['sharedWith'].append(requester_id)
            
            # Log access
            access_logs.append({
                "fileId": file_id,
                "filename": file_data['filename'],
                "ownerId": owner_id,
                "accessedBy": requester_id,
                "method": "honeytoken",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "ip": request.remote_addr
            })
            
            return jsonify({"message": "Access granted via honeytoken", "access": True})
        else:
            # Invalid honeytoken - trigger trap
            create_file_alert(
                file_id, 
                owner_id, 
                requester_id, 
                "unauthorized_access",
                f"Invalid honeytoken attempt for {file_data['filename']} by {USERS[requester_id]['username']}"
            )
            
            # Update risk score
            update_risk_score(requester_id, "trap", owner_id)
            
            return jsonify({"error": "Invalid honeytoken - security alert triggered"}), 403
    
    # Create access request
    request_data = {
        "id": str(uuid.uuid4()),
        "fileId": file_id,
        "filename": file_data['filename'],
        "ownerId": owner_id,
        "requesterId": requester_id,
        "requesterName": USERS[requester_id]['username'],
        "message": message,
        "status": "pending",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    
    access_requests.append(request_data)
    
    # Notify owner
    user_notifications.append({
        "user": owner_id,
        "type": "info",
        "message": f"Access request for {file_data['filename']} from {USERS[requester_id]['username']}",
        "timestamp": request_data['timestamp']
    })
    
    return jsonify({"message": "Access request sent", "requestId": request_data['id']})

@app.route('/access-requests', methods=['GET'])
def get_access_requests():
    if not check_api_key(request):
        return jsonify({"error": "Unauthorized"}), 401
    
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({"error": "Missing user_id"}), 400
    
    # Get requests for files owned by this user
    user_requests = [req for req in access_requests if req['ownerId'] == user_id]
    
    return jsonify(user_requests)

@app.route('/approve-access', methods=['POST'])
def approve_access():
    if not check_api_key(request):
        return jsonify({"error": "Unauthorized"}), 401
    
    data = request.get_json()
    request_id = data.get('request_id')
    action = data.get('action')  # 'approve' or 'deny'
    
    if not request_id or action not in ['approve', 'deny']:
        return jsonify({"error": "Missing request_id or invalid action"}), 400
    
    # Find the request
    request_data = None
    for req in access_requests:
        if req['id'] == request_id:
            request_data = req
            break
    
    if not request_data:
        return jsonify({"error": "Request not found"}), 404
    
    if request_data['status'] != 'pending':
        return jsonify({"error": "Request already processed"}), 400
    
    # Update request status
    request_data['status'] = action
    request_data['processedAt'] = datetime.now(timezone.utc).isoformat()
    
    if action == 'approve':
        # Grant access
        file_data = user_files[request_data['fileId']]
        if request_data['requesterId'] not in file_data.get('sharedWith', []):
            file_data['sharedWith'].append(request_data['requesterId'])
        
        # Log access grant
        access_logs.append({
            "fileId": request_data['fileId'],
            "filename": file_data['filename'],
            "ownerId": request_data['ownerId'],
            "accessedBy": request_data['requesterId'],
            "method": "approved_request",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "ip": request.remote_addr
        })
        
        # Notify requester
        user_notifications.append({
            "user": request_data['requesterId'],
            "type": "success",
            "message": f"Access approved for {file_data['filename']}",
            "timestamp": request_data['processedAt']
        })
        
        message = "Access approved"
    else:
        # Notify requester of denial
        user_notifications.append({
            "user": request_data['requesterId'],
            "type": "warning",
            "message": f"Access denied for {request_data['filename']}",
            "timestamp": request_data['processedAt']
        })
        
        message = "Access denied"
    
    return jsonify({"message": message})

# --- File Access ---
@app.route('/file/<file_id>/access', methods=['POST'])
def access_file():
    if not check_api_key(request):
        return jsonify({"error": "Unauthorized"}), 401
    
    data = request.get_json()
    user_id = data.get('user_id')
    
    if not user_id:
        return jsonify({"error": "Missing user_id"}), 400
    
    if file_id not in user_files:
        return jsonify({"error": "File not found"}), 404
    
    file_data = user_files[file_id]
    
    # Check access permissions
    if file_data['ownerId'] == user_id or user_id in file_data.get('sharedWith', []):
        # Log legitimate access
        access_logs.append({
            "fileId": file_id,
            "filename": file_data['filename'],
            "ownerId": file_data['ownerId'],
            "accessedBy": user_id,
            "method": "legitimate_access",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "ip": request.remote_addr
        })
        
        return jsonify({
            "access": True,
            "file": file_data,
            "downloadUrl": f"/download/{file_id}"
        })
    else:
        # Unauthorized access attempt - trigger trap
        create_file_alert(
            file_id,
            file_data['ownerId'],
            user_id,
            "unauthorized_access",
            f"Unauthorized access attempt to {file_data['filename']} by {USERS[user_id]['username']}"
        )
        
        # Update risk score
        update_risk_score(user_id, "trap", file_data['ownerId'])
        
        return jsonify({"error": "Access denied - security alert triggered"}), 403

# --- File Alerts ---
@app.route('/file-alerts', methods=['GET'])
def get_file_alerts():
    if not check_api_key(request):
        return jsonify({"error": "Unauthorized"}), 401
    
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({"error": "Missing user_id"}), 400
    
    # Get alerts for files owned by this user
    user_alerts = [alert for alert in file_alerts if alert['ownerId'] == user_id]
    
    return jsonify(user_alerts)

# --- Original endpoints (keeping existing functionality) ---
@app.route('/generate_watermark', methods=['POST'])
def api_generate_watermark():
    if not check_api_key(request):
        return jsonify({"error": "Unauthorized"}), 401
    data = request.get_json()
    partner_id = data.get('partner_id')
    user_id = data.get('user_id')
    timestamp = data.get('timestamp')
    if not partner_id or not user_id or not timestamp:
        return jsonify({"error": "Missing partner_id, user_id, or timestamp"}), 400
    if not USERS.get(user_id, {}).get("watermark", True):
        return jsonify({"error": "Consent denied for watermarking"}), 403
    hash_value = generate_watermark(partner_id, timestamp, user_id)
    return jsonify({"watermark": hash_value, "partner_id": partner_id, "user_id": user_id, "timestamp": timestamp})

@app.route('/generate_honeytoken', methods=['GET'])
def api_generate_honeytoken():
    if not check_api_key(request):
        return jsonify({"error": "Unauthorized"}), 401
    partner_id = request.args.get('partner_id') or request.headers.get('X-Partner-Id')
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({"error": "Missing user_id"}), 400
    if not USERS.get(user_id, {}).get("honeytoken", True):
        return jsonify({"error": "Consent denied for honeytoken"}), 403
    token = generate_honeytoken()
    if partner_id:
        calculate_risk_score(partner_id, "/generate_honeytoken")
    return jsonify(token)

@app.route('/generate_policy', methods=['POST'])
def api_generate_policy():
    if not check_api_key(request):
        return jsonify({"error": "Unauthorized"}), 401
    data = request.get_json()
    purpose = data.get('purpose')
    days_valid = data.get('days_valid')
    region = data.get('region')
    user_id = data.get('user_id')
    if not purpose or days_valid is None or not region or not user_id:
        return jsonify({"error": "Missing purpose, days_valid, region, or user_id"}), 400
    if not USERS.get(user_id, {}).get("policy", True):
        return jsonify({"error": "Consent denied for policy"}), 403
    try:
        days_valid = int(days_valid)
    except ValueError:
        return jsonify({"error": "days_valid must be an integer"}), 400
    policy = generate_policy(purpose, days_valid, region)
    USERS[user_id]["expiry_date"] = policy["expiry_date"]
    return jsonify(policy)

@app.route('/access_log', methods=['GET'])
def get_access_log():
    return jsonify(access_logs), 200

@app.route('/user_notifications', methods=['GET'])
def get_user_notifications():
    user_id = request.args.get('user_id')
    if user_id:
        filtered = [n for n in user_notifications if n['user'] == user_id]
        return jsonify(filtered), 200
    return jsonify(user_notifications), 200

@app.route('/get_consent/<user_id>', methods=['GET'])
def get_consent(user_id):
    consent = USERS.get(user_id)
    if consent is None:
        return jsonify({"error": "User not found"}), 404
    return jsonify(consent), 200

@app.route('/update_consent/<user_id>', methods=['POST'])
def update_consent(user_id):
    data = request.get_json()
    if user_id not in USERS:
        return jsonify({"error": "User not found"}), 404
    USERS[user_id].update(data)
    return jsonify(USERS[user_id]), 200

@app.route('/partner_request_data', methods=['POST'])
def partner_request_data():
    if not check_api_key(request):
        return jsonify({"error": "Unauthorized"}), 401
    data = request.get_json()
    partner_id = data.get('partner_id')
    region = data.get('region')
    requested_users = data.get('requested_users', [])
    purpose = data.get('purpose')
    if not partner_id or not region or not requested_users:
        return jsonify({"error": "Missing partner_id, region, or requested_users"}), 400
    for user_id in requested_users:
        user_access_history.append({
            "partner": partner_id,
            "user": user_id,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "ip": request.remote_addr,
            "purpose": purpose,
            "region": region
        })
    return jsonify({"status": "success", "users": requested_users}), 200

@app.route('/bulk_partner_request', methods=['POST'])
def bulk_partner_request():
    if not check_api_key(request):
        return jsonify({"error": "Unauthorized"}), 401
    data = request.get_json()
    requests = data.get('requests', [])
    result = {}
    for req in requests:
        partner_id = req.get('partner_id')
        users = req.get('users', [])
        region = req.get('region')
        purpose = req.get('purpose')
        for user_id in users:
            user_access_history.append({
                "partner": partner_id,
                "user": user_id,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "ip": request.remote_addr,
                "purpose": purpose,
                "region": region
            })
        result[partner_id] = users
    return jsonify(result), 200

@app.route('/alerts/<user_id>', methods=['GET'])
def get_alerts(user_id):
    return jsonify([a for a in alerts if a.get('user') == user_id]), 200

@app.route('/admin/trap_logs', methods=['GET'])
def get_admin_trap_logs():
    return jsonify(trap_logs), 200

@app.route('/admin/restricted_partners_detailed', methods=['GET'])
def get_admin_restricted_partners_detailed():
    return jsonify(restricted_partners), 200

@app.route('/admin/partner_activity_summary', methods=['GET'])
def get_admin_partner_activity_summary():
    return jsonify(partner_scores), 200

@app.route('/admin/user_activity_summary', methods=['GET'])
def get_admin_user_activity_summary():
    return jsonify(USERS), 200

@app.route('/request_admin_action', methods=['POST'])
def request_admin_action():
    data = request.get_json()
    alerts.append({
        "user": data.get('user_id'),
        "partner": data.get('partner_id'),
        "reason": data.get('reason'),
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "type": "user_escalation"
    })
    return jsonify({"message": "Escalation sent to admin."})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)