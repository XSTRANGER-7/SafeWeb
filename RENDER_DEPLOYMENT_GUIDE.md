# 🚀 Ultimate Render Deployment Guide

This guide will walk you step-by-step through deploying **both** of your backends (Node.js & Python) for free using [Render.com](https://render.com).

Render is vastly superior to Netlify for backend hosting because it runs actual servers instead of serverless functions, easily supporting your heavy Machine Learning Python models and your full Express API!

---

## Pre-requisites
1. Push your entire `SafeWeb` project to a single repository on GitHub.
2. Sign up / Log in to [Render](https://dashboard.render.com).
3. Connect your GitHub account to Render.

---

## 🟢 Part 1: Deploying the Node.js Main Backend
This is your primary `backend/` folder running Express.js.

1. In the Render Dashboard, click **New +** and select **Web Service**.
2. Select **"Build and deploy from a Git repository"** and click **Next**.
3. Connect and select your **SafeWeb** GitHub repository.
4. Fill out the configuration exactly as follows:
   * **Name:** `safeweb-api` (or whatever you prefer)
   * **Region:** Choose the region closest to you
   * **Branch:** `main`
   * **Root Directory:** `backend`  *(⚠️ CRITICAL!)*
   * **Runtime:** `Node`
   * **Build Command:** `npm install`
   * **Start Command:** `npm start`
5. Select the **Free** instance type.
6. **Environment Variables:**
   Expand "Advanced" and click "Add Environment Variable". Add all the variables from your local `backend/.env` file. (e.g., `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_ID`, `FIREBASE_ADMIN_PRIVATE_KEY` etc).
   > *Note: For Firebase Admin variables, make sure you copy the exact text including `\n` characters if pasting a private key string.*
7. Click **Create Web Service**.

Wait about 2-3 minutes. Once the logs say `Backend running on 5000` (or similar), your Node API is live! Copy the public Render URL (like `https://safeweb-api.onrender.com`).

---

## 🟣 Part 2: Deploying the Python ML Backend (Phishing API)
This is the `phishing_backend/` folder running FastAPI with `scikit-learn` in `backend_api/main.py`.

We will deploy this using Docker because Render natively supports Dockerfiles, which completely solves any heavy ML library dependency issues.

1. Go back to the Render dashboard, click **New +**, and select **Web Service**.
2. Select **"Build and deploy from a Git repository"** and connect the same **SafeWeb** repository.
3. Fill out the configuration exactly as follows:
   * **Name:** `safeweb-phishing-api` 
   * **Region:** Same region as above
   * **Branch:** `main`
   * **Root Directory:** `phishing_backend` *(⚠️ CRITICAL!)*
   * **Runtime:** `Docker` 
   * **Dockerfile Path:** `backend_api/Dockerfile` *(Scroll down to "Advanced" or Build Settings to specify this!)*
   * **Build Command:** *(Leave blank, Docker runs the installation)*
   * **Start Command:** *(Leave blank, Docker runs the CMD)*
4. Select the **Free** instance type.
5. **Environment Variables:**
   Expand "Advanced" and add any variables you need from `phishing_backend/.env`.
6. Click **Create Web Service**.

Render will now read the Dockerfile, download your code, install heavy ML libraries inside an isolated container, and start the `main.py` API! Once it says "Your service is live", copy the new public URL (like `https://safeweb-phishing-api.onrender.com`).

---

## 🔗 Part 3: Connecting the Frontend

Once BOTH backends are successfully running on Render:

1. Open your frontend `.env` file (or wherever you configure your API URLs).
2. Update the backend URL to point to your new Node API Render URL:
   ```env
   VITE_API_URL="https://safeweb-api.onrender.com"
   ```
3. Update the phishing AI URL to point to your new Python Render URL:
   ```env
   VITE_PHISHING_API_URL="https://safeweb-phishing-api.onrender.com"
   ```
4. Deploy your `frontend/` folder anywhere you like! (Vercel, Netlify, or even a Static Site on Render).

### WhatsApp Cloud Callback
Don't forget to log in to the **Meta Developer Console** and update your **Webhook Callback URL** to point to your new live Node backend:
`https://safeweb-api.onrender.com/whatsapp/webhook`
