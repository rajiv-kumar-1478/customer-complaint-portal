# 🔥 Tejas Indane Complaint Management System

A professional, full-stack complaint registration and management portal designed for **Tejas Indane Gramin Vitrak**. This system allows customers to register LPG-related concerns and provides administrators with a premium dashboard to track and resolve issues.

![Version](https://img.shields.io/badge/version-1.0.0-orange)
![Python](https://img.shields.io/badge/python-3.10+-blue)
![Flask](https://img.shields.io/badge/framework-flask-lightgrey)

## ✨ Features

### 🌐 Public Portal
- **Modern UI**: Premium design with glassmorphism effects and smooth animations.
- **Complaint Registration**: Easy-to-use form for reporting gas leakage, delivery delays, and more.
- **Responsive Design**: Fully optimized for mobile, tablet, and desktop views.

### 🛡️ Admin Dashboard
- **Secure Authentication**: JWT-based login for authorized personnel.
- **Live Statistics**: Real-time overview of Total, Pending, and Resolved complaints.
- **Actionable Data**: List view of all complaints with one-click "Mark Resolved" functionality.
- **Persistent Storage**: Built on SQL (SQLite) for reliable data management.

## 🛠️ Tech Stack
- **Frontend**: HTML5, CSS3 (Vanilla), JavaScript (ES6+)
- **Backend**: Python, Flask, Flask-SQLAlchemy, Flask-JWT-Extended
- **Database**: SQLite (SQL)

## 🚀 Getting Started

### Prerequisites
- Python 3.10 or higher
- pip (Python package manager)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/tejas-indane-portal.git
   cd tejas-indane-portal
   ```

2. **Setup the Backend**:
   ```bash
   cd backend
   pip install -r requirements.txt
   python app.py
   ```
   *The server will run on `http://127.0.0.1:5000`*

3. **Access the Frontend**:
   - Simply open `frontend/index.html` in any modern browser.

### 🔑 Admin Credentials
- **Username**: `admin`
- **Password**: `admin123`

## ☁️ Deployment
This project is ready for deployment on **Render**. See the included `render.yaml` for configuration.

---
Developed with ❤️ for Tejas Indane Gramin Vitrak.
