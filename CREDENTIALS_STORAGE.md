# Where Credentials Are Stored

## Storage Locations

When you create credentials from the Admin Panel (`/admin`), here's what happens:

### 1. **Email & Password** → Firebase Authentication
- **Location**: Firebase Authentication (not Firestore)
- **Storage**: Encrypted by Firebase
- **Access**: Firebase Console → Authentication → Users

### 2. **User Details** → Firestore Database

#### Collection 1: `officials`
- **Document ID**: User's Firebase UID (auto-generated)
- **Fields**:
  ```javascript
  {
    email: "police@test.com",
    name: "Test Police Officer",
    role: "police",  // or "bank"
    officialId: "POLICE001",
    createdAt: "2024-01-01T00:00:00.000Z",
    createdBy: "admin"
  }
  ```

#### Collection 2: `users`
- **Document ID**: User's Firebase UID (same as officials)
- **Fields**:
  ```javascript
  {
    email: "police@test.com",
    name: "Test Police Officer",
    role: "police",  // or "bank"
    officialId: "POLICE001",
    createdAt: "2024-01-01T00:00:00.000Z"
  }
  ```

## How Login Works

1. User enters email/password at `/login/police` or `/login/bank`
2. Frontend authenticates with Firebase Auth using `signInWithEmailAndPassword()`
3. If successful, gets the user's UID
4. Checks Firestore `users` collection for that UID
5. If not found, checks `officials` collection
6. Verifies the `role` matches the login route (police/bank)
7. If everything matches → Login successful → Navigate to dashboard

## Code Flow

### Creating Account (Admin Panel):
```
Admin.jsx → POST /admin/create-official → adminController.js
  ↓
1. Create Firebase Auth user (email/password)
2. Store in Firestore 'officials' collection
3. Store in Firestore 'users' collection
```

### Login:
```
P-B-Login.jsx → signInWithEmailAndPassword() → Firebase Auth
  ↓
Check Firestore 'users' collection → Verify role → Login
```

## View Credentials

### Option 1: Firebase Console
1. Go to https://console.firebase.google.com
2. Select your project
3. **Authentication** → **Users** tab: See all email/password accounts
4. **Firestore Database**:
   - Open `officials` collection
   - Open `users` collection

### Option 2: Admin Panel
- Go to `/admin` page
- See "Existing Officials" list on the right side

## Test Credentials

If you want to manually add test credentials, use the admin panel at `/admin`:

**Police Account:**
- Email: `police@test.com`
- Password: `police123`
- Official ID: `POLICE001`
- Role: `police`

**Bank Account:**
- Email: `bank@test.com`
- Password: `bank123`
- Official ID: `BANK001`
- Role: `bank`

## Important Notes

- ✅ **Password is NOT stored in Firestore** - only in Firebase Auth (encrypted)
- ✅ **Both `officials` and `users` collections** store the same user data
- ✅ **Document ID = Firebase UID** (same for both collections)
- ✅ **Role must match** the login route (`/login/police` or `/login/bank`)

