# Fix Firebase Service Account Key Error

## The Problem
Your `backend/serviceAccountKey.json` file is either:
1. Invalid/expired
2. Missing required fields
3. The key has been revoked in Firebase Console

## Solution: Get a New Service Account Key

### Step 1: Go to Firebase Console
1. Visit: https://console.firebase.google.com
2. Select your project: **safeweb-b3ea1**

### Step 2: Generate New Private Key
1. Click the **gear icon** ⚙️ next to "Project Overview"
2. Select **Project settings**
3. Go to **Service accounts** tab
4. Click **Generate new private key** button
5. Click **Generate key** in the confirmation dialog
6. A JSON file will download automatically

### Step 3: Replace the File
1. Rename the downloaded file to: `serviceAccountKey.json`
2. Copy it to: `d:\safeweb\backend\serviceAccountKey.json`
3. **Replace** the existing file

### Step 4: Restart Backend Server
```bash
cd backend
# Stop the server (Ctrl+C if running)
npm start
```

## Verify It Works
After replacing the file, try creating an account from `/admin` again.

## Alternative: Manual Credential Creation
If you can't fix the service account key right now, you can manually create credentials in Firebase Console:
1. Go to Firebase Console → Authentication → Users
2. Click "Add user"
3. Enter email and password
4. Then manually add the user data to Firestore `users` and `officials` collections

