# Verify Login Setup for Police/Bank Users

## If you manually added users, verify the following:

### 1. Check Firebase Authentication
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select project: **safeweb-b3ea1**
3. Go to **Authentication** → **Users**
4. Find your user (e.g., `police@test.com`)
5. **Copy the User UID** (it's a long string like `abc123def456...`)

### 2. Check Firestore Database

#### For Police User:
1. Go to **Firestore Database**
2. Check **`officials` collection**:
   - Document ID should be the **User UID** from step 1
   - Fields should include:
     ```json
     {
       "email": "police@test.com",
       "name": "Test Police Officer",
       "role": "police",  // ⚠️ Must be exactly "police"
       "officialId": "POLICE001",
       "createdAt": "2024-01-01T00:00:00.000Z"
     }
     ```

3. Check **`users` collection**:
   - Document ID should be the **same User UID**
   - Fields should include:
     ```json
     {
       "email": "police@test.com",
       "name": "Test Police Officer",
       "role": "police",  // ⚠️ Must be exactly "police"
       "officialId": "POLICE001",
       "createdAt": "2024-01-01T00:00:00.000Z"
     }
     ```

#### For Bank User:
Same as above, but:
- Email: `bank@test.com`
- Role: `"bank"` (not "police")
- Official ID: `BANK001`

### 3. Common Issues

#### Issue: "Invalid credentials for police login"
**Cause:** The `role` field in Firestore doesn't match the login route.

**Fix:**
- If logging in at `/login/police`, the `role` field must be exactly `"police"`
- If logging in at `/login/bank`, the `role` field must be exactly `"bank"`
- Check both `users` and `officials` collections

#### Issue: "ERR_BLOCKED_BY_CLIENT"
**Cause:** Ad blocker or browser extension is blocking Firestore requests.

**Fix:**
1. Disable ad blockers for `localhost` or your domain
2. Disable browser extensions that block requests
3. Try in incognito/private mode
4. The login will still work (based on Firebase Auth), but role verification might be skipped

#### Issue: "User credentials not found"
**Cause:** Firestore documents don't exist or have wrong UID.

**Fix:**
1. Verify the User UID from Firebase Auth matches the document ID in Firestore
2. Make sure documents exist in either `users` or `officials` collection
3. Check that the email matches

### 4. Quick Test

1. **Login URL:**
   - Police: `http://localhost:5173/login/police`
   - Bank: `http://localhost:5173/login/bank`

2. **Credentials:**
   - Email: `police@test.com` or `bank@test.com`
   - Password: (whatever you set in Firebase Auth)

3. **Check Browser Console:**
   - Open DevTools (F12)
   - Look for console logs showing:
     - "Found user in Firestore users collection. Role: police, Expected: police"
     - Or "Found user in Firestore officials collection. Role: police, Expected: police"

### 5. If Still Not Working

1. **Check Firestore Security Rules:**
   - Go to Firestore Database → Rules
   - Make sure authenticated users can read `users` and `officials` collections

2. **Verify User UID:**
   - The document ID in Firestore must match the User UID from Firebase Auth
   - They are case-sensitive

3. **Check Role Field:**
   - Must be lowercase: `"police"` or `"bank"`
   - Not `"Police"` or `"POLICE"`

