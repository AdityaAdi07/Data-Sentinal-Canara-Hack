from flask import Flask, jsonify, request
from flask_cors import CORS
from faker import Faker
from datetime import datetime, timedelta, timezone
import hashlib
import uuid

# --- Config ---
API_KEY = '007085'
USERS = {
    'aditya123': {"watermark": True, "policy": True, "honeytoken": True, "expiry_date": "2025-07-30"}
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

def check_api_key(request):
    api_key = request.headers.get('X-API-Key')
    return api_key == API_KEY

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
        "message": "Backend is healthy and ready!"
    })

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
    # For demo, return all alerts for the user
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