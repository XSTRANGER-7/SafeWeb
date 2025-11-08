# Firestore Security Rules Setup

## Quick Fix for Permission Errors

The app is currently showing "Missing or insufficient permissions" errors. To fix this:

### Step 1: Go to Firebase Console
1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select your project (`safeweb-b3ea1`)
3. Go to **Firestore Database** → **Rules** tab

### Step 2: Update Security Rules
Copy and paste these rules from `frontend/firestore.rules`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function to check if user owns the document
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Helper function to get user role (safely handles missing document)
    function getUserRole() {
      let userDoc = get(/databases/$(database)/documents/users/$(request.auth.uid));
      return userDoc != null && userDoc.data != null ? userDoc.data.role : null;
    }
    
    // Helper function to check if user is police or bank
    function isPoliceOrBank() {
      let role = getUserRole();
      return role == 'police' || role == 'bank';
    }
    
    // Users collection - users can read/write their own profile
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && isOwner(userId);
      allow update: if isAuthenticated() && isOwner(userId);
      allow delete: if isAuthenticated() && isOwner(userId);
    }
    
    // Cases collection
    match /cases/{caseId} {
      // Victims can read their own cases, police/bank can read all cases
      allow read: if isAuthenticated() && (
        resource.data.victimUid == request.auth.uid ||
        isPoliceOrBank()
      );
      
      // Victims can create their own cases
      allow create: if isAuthenticated() && request.resource.data.victimUid == request.auth.uid;
      
      // Victims can update their own cases, police/bank can update any case
      allow update: if isAuthenticated() && (
        resource.data.victimUid == request.auth.uid ||
        isPoliceOrBank()
      );
      
      // Only police/bank can delete cases
      allow delete: if isAuthenticated() && isPoliceOrBank();
      
      // Evidence subcollection - allow access based on case access
      match /evidence/{evidenceId} {
        // Allow read if user can read the parent case
        allow read: if isAuthenticated() && (
          get(/databases/$(database)/documents/cases/$(caseId)).data.victimUid == request.auth.uid ||
          isPoliceOrBank()
        );
        
        // Allow create if user can create/update the parent case
        allow create: if isAuthenticated() && (
          get(/databases/$(database)/documents/cases/$(caseId)).data.victimUid == request.auth.uid ||
          isPoliceOrBank()
        );
        
        // Allow update/delete if user can update the parent case
        allow update, delete: if isAuthenticated() && (
          get(/databases/$(database)/documents/cases/$(caseId)).data.victimUid == request.auth.uid ||
          isPoliceOrBank()
        );
      }
    }
    
    // Default: deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### Step 3: Publish Rules
1. Click the **"Publish"** button to save the rules
2. Wait a few seconds for the rules to propagate (usually takes 10-30 seconds)

### Step 4: Test
1. **Hard refresh** your browser (Ctrl+Shift+R or Cmd+Shift+R) to clear cache
2. Try logging in again - the permission errors should be gone
3. Try submitting a cyber fraud report - it should work now

**Important Notes:**
- The rules use helper functions for cleaner code
- Users can read any user profile (for role checking), but can only create/update their own
- Victims can create and read their own cases
- Police and Bank users can read and update all cases
- Evidence subcollection follows the same access rules as the parent case

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

