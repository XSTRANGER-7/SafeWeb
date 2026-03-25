# 🛡️ SafeWeb - Cyber Fraud Prevention & Reporting System

<div align="center">

![SafeWeb Banner](https://img.shields.io/badge/SafeWeb-Cyber%20Fraud%20Prevention-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-19.1.1-61DAFB?style=flat-square&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js)
![Python](https://img.shields.io/badge/Python-3.12+-3776AB?style=flat-square&logo=python)
![Firebase](https://img.shields.io/badge/Firebase-10.11.0-FFCA28?style=flat-square&logo=firebase)
![WhatsApp](https://img.shields.io/badge/WhatsApp-Integration-25D366?style=flat-square&logo=whatsapp)

**A comprehensive cyber fraud prevention, phishing detection, and reporting platform developed for collaboration between citizens, police, and banking authorities.**

[Features](#-features) • [Tech Stack](#-technology-stack) • [Installation](#-installation) • [Usage](#-usage)

</div>

---

## 📖 Table of Contents

- [About The Project](#-about-the-project)
- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [System Architecture](#-system-architecture)
- [Installation & Setup](#-installation--setup)
  - [1. Frontend Setup](#1-frontend-react--vite)
  - [2. Backend Setup](#2-backend-node--express)
  - [3. Phishing ML API Setup](#3-phishing-ml-api-python--fastapi)
- [Configuration](#-configuration)
- [Usage & User Roles](#-usage--user-roles)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 About The Project

**SafeWeb** is a unified, multi-stakeholder platform designed to streamline cyber fraud reporting, enable real-time case tracking, and provide machine-learning-based proactive fraud prevention tools. It connects Victims, Police Officers, and Bank Officials in a single, real-time ecosystem.

### Key Highlights
- 🚀 **Rapid Response**: Real-time reporting and cross-agency tracking.
- 🤖 **ML Phishing Detection**: Advanced Random Forest AI model to scan and block malicious URLs.
- 🔍 **Automated OCR Scanning**: Uses Tesseract.js to automatically extract evidence from images.
- 💬 **WhatsApp Bot**: 24/7 AI-powered conversational bot for remote reporting.
- 🌍 **Multi-language**: Complete support for English, Hindi, and Odia.
- 🎭 **Role-Based Access**: Dedicated secure interactive dashboards for Citizens, Police, and Banks.

---

## ✨ Features

### 🚨 Cyber Fraud Reporting & Management
- Step-by-step complaint filing with **OCR automated evidence extraction**.
- Real-time case tracking and timeline history.
- Multi-role dashboards allowing Banks to instantly freeze accounts and Police to issue FIR updates.

### 🔗 ML-Powered Phishing Detection
- Dedicated Python FastAPI backend trained on vast datasets of malicious URLs.
- Live URL scanner available on the web app and via a bundled **Chrome Extension** to alert users of dangerous sites before they load.

### 💬 Omnichannel AI Chatbot (WhatsApp)
- DMRC-style interactive WhatsApp Business Chatbot.
- Users can file complaints, check case statuses, and verify phishing links directly via WhatsApp.

### 🎨 Modern UI/UX
- Hardware-accelerated framer-motion page transitions and CSS keyframe animations.
- Beautiful, fully responsive user interfaces utilizing Tailwind CSS and dynamic, role-based navigation.
- Extensively SEO optimized (Sitemap, Robots.txt, Open Graph, Twitter Cards).

---

## 🛠️ Technology Stack

### 💻 Frontend (Client)
- **React.js 19+ (Vite)** - Ultra-fast modern UI framework.
- **Tailwind CSS & PostCSS** - Robust utility-first styling.
- **Framer Motion** - Sleek page transitions and component animations.
- **Tesseract.js** - Client-side Optical Character Recognition (OCR) for image scanning.
- **Recharts** - Dynamic data visualization for role analytics.
- **i18next** - Seamless multi-language support.

### ⚙️ Backend (Node.js API & Webhooks)
- **Node.js 18+ & Express.js** - Blazing fast REST API.
- **Firebase Admin SDK** - Secure, server-side data manipulation and querying.
- **Twilio WhatsApp API** - Manages the conversational webhook logic for the chatbot.

### 🧠 Machine Learning API (Phishing Detection)
- **Python 3.12+ & FastAPI** - High-performance ML serving API.
- **Scikit-learn, Pandas, Joblib** - Training and deploying the Random Forest classifier.
- **Docker** - Containerized for isolated, reproducible deployments.

### 🗄️ Database & Cloud Services
- **Firebase Firestore** - Real-time NoSQL cloud database.
- **Firebase Authentication** - Phone & Aadhaar-based secure login.
- **Firebase Storage** - Evidence and asset cloud storage.

---

## 🏗️ System Architecture

The ecosystem relies on three interconnected micro-services:

1. **Frontend**: The public-facing React SPA interacting with Firebase directly (Client SDK) for real-time dashboard listeners.
2. **Node Backend**: Handles secure WhatsApp Twilio webhooks, heavy background administrative actions.
3. **Phishing ML Backend**: A separate FastAPI microservice providing isolated ML predictions for URLs submitted by users or the bundled Chrome extension.

---

## 📦 Installation & Setup

### Prerequisites
- **Node.js** 18.x or higher
- **Python** 3.12+ (For Phishing ML API)
- **Git**

### 1. Frontend (React + Vite)
```bash
git clone https://github.com/XSTRANGER-7/SafeWeb.git
cd SafeWeb/frontend

# Install dependencies
npm install

# Setup environment variables
# Create a .env file and add your VITE_FIREBASE matching credentials:
# VITE_FIREBASE_API_KEY=...
# VITE_API_BASE_URL=http://localhost:5000

# Start development server
npm run dev
```
The frontend runs at `http://localhost:5173`.

### 2. Backend (Node + Express)
```bash
cd ../backend

# Install dependencies
npm install

# Setup environment variables (.env)
# FIREBASE_SERVICE_ACCOUNT=./serviceAccountKey.json
# WHATSAPP_ACCESS_TOKEN=your_twilio_access_token

# Place your generated serviceAccountKey.json in the backend directory.

# Start development server
npm run dev
```
The Node backend runs at `http://localhost:5000`.

### 3. Phishing ML API (Python + FastAPI)
```bash
cd ../phishing_backend

# Install Python dependencies
pip install -r backend_api/requirements.txt

# Start the FastAPI server
python -m backend_api.main
```
The ML API runs at `http://localhost:8000` waiting for phishing detection queries.

*(Alternatively, you can run the Phishing API via Docker: `docker build -t phish-backend ./ -f backend_api/Dockerfile`)*

---

## ⚙️ Configuration

Ensure you review the internal documentation for specific feature setups:
- **Firebase/Firestore Rules**: See `/frontend/firestore.rules` for the correct DB access controls.
- **WhatsApp Chatbot**: View `/backend/WHATSAPP_SETUP.md` to configure Twilio endpoints and Ngrok tunneling for webhook listeners.
- **Chrome Extension**: To install the phishing blocker extension locally, open Chrome → Manage Extensions → Enable Developer Mode → Load Unpacked (`/phishing_backend/extension`).

---

## 🚀 Usage & User Roles

SafeWeb supports three primary interactive layers:

1. **Victim / Citizen**:
   - Report cyber crimes, securely upload image evidence (scanned automatically via OCR).
   - Track live updates on active cases.
   - Utilize the WhatsApp bot for instant help.
2. **Police Officer**:
   - Access the dedicated `/police-dashboard`.
   - Review auto-classified case priorities, file digital FIRs.
   - Forward serious banking frauds directly to the respective banking nodes.
3. **Bank Official**:
   - Access the dedicated `/bank-dashboard`.
   - Receive prioritized alerts for compromised accounts.
   - Record frozen transactions, leaving a robust audit trail for Police visibility.

---

## 🤝 Contributing

We welcome contributions! 
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add an amazing new feature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the `LICENSE` file for details.

<div align="center">
<b>Made with ❤️ for a safer digital infrastructure</b>
</div>
