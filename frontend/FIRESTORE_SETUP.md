# Firestore Security Rules Setup

## Quick Fix for Permission Errors

The app is currently showing "Missing or insufficient permissions" errors. To fix this:

### Step 1: Go to Firebase Console
1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select your project (`safeweb-b3ea1`)
3. Go to **Firestore Database** → **Rules** tab

### Step 2: Update Security Rules
Copy and paste these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - users can read/write their own profile
    match /users/{userId} {
      // Allow read if user is authenticated and accessing their own data
      allow read: if request.auth != null && request.auth.uid == userId;
      
      // Allow create/update if user is authenticated and accessing their own data
      allow create, update: if request.auth != null && request.auth.uid == userId;
      
      // Allow delete only if user is deleting their own data
      allow delete: if request.auth != null && request.auth.uid == userId;
    }
    
    // Default: deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### Step 3: Publish Rules
Click the **"Publish"** button to save the rules.

### Step 4: Test
Refresh your app and try logging in again. The permission errors should be gone.

---

## Note about ERR_BLOCKED_BY_CLIENT

If you see `ERR_BLOCKED_BY_CLIENT` errors in the console, these are usually caused by:
- Ad blockers (uBlock Origin, AdBlock Plus, etc.)
- Privacy extensions
- Browser security settings

These warnings won't break the app functionality. The app will still work, but you may want to:
- Disable ad blockers for your localhost/development domain
- Or ignore these warnings (they're harmless)

---

## Temporary Development Rules (NOT for Production)

If you want to allow all access during development (for testing only):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**⚠️ WARNING: Never use these rules in production! They allow any authenticated user to read/write all data.**

