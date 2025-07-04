# Data Sentinel

Data Sentinel is a comprehensive privacy and data protection platform designed to help organizations manage user consent, monitor data access, enforce policies, and detect suspicious activity using advanced risk analytics and deception techniques.

---

## 🚀 Features

- **User Consent Management:** Empower users to control how their data is used (watermarking, policy enforcement, honeytokens).
- **Policy Management:** Create, update, and enforce data sharing and retention policies.
- **Risk Monitoring:** Real-time risk scoring and threat detection for partner access.
- **Deception & Honeytokens:** Deploy honeytokens and activate deception mode to catch unauthorized access.
- **Comprehensive Audit Logs:** Track all access and administrative actions for compliance.
- **Admin Dashboard:** View partner activity, restricted users, and system alerts.
- **Modern UI:** Built with React, Tailwind CSS, and Lucide icons for a clean, responsive experience.
- **RESTful API Backend:** Powered by Flask (Python) for rapid prototyping and extensibility.

---

## 🛠️ Tech Stack

- **Frontend:** React, TypeScript, Tailwind CSS, Lucide React
- **Backend:** Python, Flask, Flask-CORS, Faker
- **Build Tools:** Vite, npm

---

## 📦 Project Structure

```
Data-Sentinal-Canara-Hack/
├── backend/
│   ├── aap.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   ├── package.json
│   └── ...
└── README.md
```

---

## ⚡ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [npm](https://www.npmjs.com/)
- [Python 3.8+](https://www.python.org/)
- [pip](https://pip.pypa.io/en/stable/)

### 1. Clone the repository
```sh
git clone https://github.com/AdityaAdi07/Data-Sentinal-Canara-Hack.git
cd Data-Sentinal-Canara-Hack
```

### 2. Install Frontend Dependencies
```sh
cd frontend
npm install
```

### 3. Install Backend Dependencies
```sh
cd ../backend
pip install -r requirements.txt
```

### 4. Running the Application

#### Start the Backend
```sh
python aap.py
```
The backend will run on [http://localhost:5000](http://localhost:5000).

#### Start the Frontend
```sh
cd ../frontend
npm install lucide-react@0.263.0
npm run dev
```
The frontend will run on [http://localhost:5173](http://localhost:5173).

---

## 🌐 API Overview

- `POST /generate_watermark` — Generate a data watermark for a user/partner
- `GET /generate_honeytoken` — Generate a honeytoken for deception
- `POST /generate_policy` — Create a new data policy
- `GET /get_consent/<user_id>` — Get consent preferences for a user
- `POST /update_consent/<user_id>` — Update consent preferences for a user
- `GET /access_log` — Retrieve access logs
- `GET /user_notifications` — Get user notifications
- `GET /alerts/<user_id>` — Get alerts for a user
- ...and more (see backend code for full API details)

---

## 🖥️ UI Overview

- **Login & Authentication**
- **User Dashboard:** View consent status, notifications, and quick actions
- **Consent Management:** Toggle watermarking, policy, honeytoken preferences, and set expiry
- **Policy Management:** Create and manage data sharing policies
- **Risk Monitoring:** View system risk, threat level, and incidents
- **Admin Dashboard:** Monitor partner activity, restricted users, and system alerts

---

## 🤝 Contributing

Contributions are welcome! Please open issues or pull requests for improvements or bug fixes.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a pull request

---

## 📄 License

This project is licensed under the MIT License.

---

**Data Sentinel** — Protecting privacy, empowering users. 
