# Manual Credential Setup (If Admin Panel Doesn't Work)

If the Firebase service account key is invalid, you can manually create credentials in Firebase Console.

## Method 1: Using Firebase Console (Easiest)

### Step 1: Create Firebase Auth Users

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: **safeweb-b3ea1**
3. Go to **Authentication** → **Users** tab
4. Click **Add user** button
5. Create these users:

**Police User:**
- Email: `police@test.com`
- Password: `police123`
- Click **Add user**

**Bank User:**
- Email: `bank@test.com`
- Password: `bank123`
- Click **Add user**

### Step 2: Get User UIDs

After creating users, note down their UIDs:
1. Click on each user in the Authentication → Users list
2. Copy the **User UID** (it's a long string like `abc123def456...`)

### Step 3: Add to Firestore

1. Go to **Firestore Database** in Firebase Console
2. Add documents to `officials` collection:

**For Police User:**
- Collection: `officials`
- Document ID: (paste the User UID from Step 2)
- Fields:
  ```
  email: "police@test.com"
  name: "Test Police Officer"
  role: "police"
  officialId: "POLICE001"
  createdAt: "2024-01-01T00:00:00.000Z"
  createdBy: "manual"
  ```

**For Bank User:**
- Collection: `officials`
- Document ID: (paste the User UID from Step 2)
- Fields:
  ```
  email: "bank@test.com"
  name: "Test Bank Official"
  role: "bank"
  officialId: "BANK001"
  createdAt: "2024-01-01T00:00:00.000Z"
  createdBy: "manual"
  ```

3. Add documents to `users` collection (same UIDs):

**For Police User:**
- Collection: `users`
- Document ID: (same UID as above)
- Fields:
  ```
  email: "police@test.com"
  name: "Test Police Officer"
  role: "police"
  officialId: "POLICE001"
  createdAt: "2024-01-01T00:00:00.000Z"
  ```

**For Bank User:**
- Collection: `users`
- Document ID: (same UID as above)
- Fields:
  ```
  email: "bank@test.com"
  name: "Test Bank Official"
  role: "bank"
  officialId: "BANK001"
  createdAt: "2024-01-01T00:00:00.000Z"
  ```

### Step 4: Test Login

- Police: `http://localhost:5173/login/police`
  - Email: `police@test.com`
  - Password: `police123`

- Bank: `http://localhost:5173/login/bank`
  - Email: `bank@test.com`
  - Password: `bank123`

## Method 2: Fix Service Account Key (Recommended)

1. Go to: https://console.firebase.google.com/project/safeweb-b3ea1/settings/serviceaccounts/adminsdk
2. Click **Generate new private key**
3. Download the JSON file
4. Replace `backend/serviceAccountKey.json` with the downloaded file
5. Restart backend server: `cd backend && npm start`
6. Then use the Admin Panel at `/admin` to create accounts

