# Backend Environment Setup

## Required Environment Variables

Create a `.env` file in the `backend` folder with the following variables:

### 1. ADMIN_API_KEY

**What is it?**
- This is a secret key you create yourself to secure admin endpoints
- It's NOT something you get from Firebase or any external service
- It's a random string that you generate for your own security

**How to generate it?**
You can use any of these methods:

**Option 1: Using Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Option 2: Using OpenSSL (if installed)**
```bash
openssl rand -hex 32
```

**Option 3: Online generator**
- Visit: https://randomkeygen.com/
- Use a "CodeIgniter Encryption Keys" or any random string generator
- Copy a long random string

**Option 4: Manual**
- Just create any long random string like: `my-secret-admin-key-2024-xyz123`

**Example:**
```
ADMIN_API_KEY=abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
```

### 2. PORT (Optional)
```
PORT=5000
```
Default is 5000 if not specified.

### 3. FIREBASE_SERVICE_ACCOUNT (Optional)
```
FIREBASE_SERVICE_ACCOUNT=./serviceAccountKey.json
```
Default is `./serviceAccountKey.json` if not specified.

### 4. FIREBASE_STORAGE_BUCKET (Optional)
```
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
```
Only needed if you're using Firebase Storage.

## Example .env file

Create `backend/.env` with:
```
PORT=5000
ADMIN_API_KEY=your-generated-secret-key-here
FIREBASE_SERVICE_ACCOUNT=./serviceAccountKey.json
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
```

## How to use ADMIN_API_KEY

When calling admin endpoints from your frontend or API clients, include the key in the request header:

```javascript
fetch('http://localhost:5000/admin/case/status', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-admin-key': 'your-generated-secret-key-here'
  },
  body: JSON.stringify({ caseId: '...', status: '...' })
});
```

Or as a query parameter:
```
http://localhost:5000/admin/case/status?adminKey=your-generated-secret-key-here
```

## Security Note

- **NEVER** commit your `.env` file to git
- Keep your `ADMIN_API_KEY` secret
- Use different keys for development and production
- The `.env` file should already be in `.gitignore`


