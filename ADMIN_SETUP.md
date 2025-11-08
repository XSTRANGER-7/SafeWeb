# Admin API Key Setup Guide

## Quick Setup Steps

### Step 1: Generate or Get Your Admin API Key

If you already have a `backend/.env` file with `ADMIN_API_KEY`, use that value. Otherwise, generate a new one:

**Option 1: Using Node.js (Recommended)**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Option 2: Using PowerShell**
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

**Option 3: Manual**
Just create any long random string like: `my-secret-admin-key-2024-xyz123`

### Step 2: Add to Backend .env (if not already there)

1. Open `backend/.env` file
2. Add or update this line:
   ```
   ADMIN_API_KEY=your-generated-key-here
   ```
3. Save the file

### Step 3: Add to Frontend .env

1. Open `frontend/.env` file
2. Add this line (use the SAME key from backend):
   ```
   VITE_ADMIN_API_KEY=your-generated-key-here
   ```
3. Make sure you also have:
   ```
   VITE_API_URL=http://localhost:5000
   ```
4. Save the file

### Step 4: Restart Your Frontend Server

After adding the environment variable, you MUST restart your frontend development server:

1. Stop the current server (Ctrl+C)
2. Start it again:
   ```bash
   cd frontend
   npm run dev
   ```

## Example .env Files

### backend/.env
```
PORT=5000
ADMIN_API_KEY=21f3b2cd76cc9ce811eaa87a921d9a580cea09e94c44a822cdecfc7162091ec8
FIREBASE_SERVICE_ACCOUNT=./serviceAccountKey.json
```

### frontend/.env
```
VITE_FIREBASE_APIKEY=AIzaSyAS7LOBZ39dCv73RY_4u-JUAIxjt-DZg9U
VITE_FIREBASE_AUTHDOMAIN=safeweb-b3ea1.firebaseapp.com
VITE_FIREBASE_PROJECTID=safeweb-b3ea1
VITE_FIREBASE_STORAGEBUCKET=safeweb-b3ea1.firebasestorage.app
VITE_FIREBASE_MESSAGINGSENDERID=546833493073
VITE_FIREBASE_APPID=1:546833493073:web:c7beb802fe6527db711c70
VITE_API_URL=http://localhost:5000
VITE_ADMIN_API_KEY=21f3b2cd76cc9ce811eaa87a921d9a580cea09e94c44a822cdecfc7162091ec8
```

## Important Notes

- ⚠️ **The ADMIN_API_KEY in backend/.env and VITE_ADMIN_API_KEY in frontend/.env must be THE SAME**
- ⚠️ **Never commit .env files to git** (they should be in .gitignore)
- ⚠️ **Restart frontend server after adding environment variables**
- The key is used to secure admin endpoints and should be kept secret

## Troubleshooting

**Error: "VITE_ADMIN_API_KEY is not set"**
- Make sure you added `VITE_ADMIN_API_KEY` to `frontend/.env`
- Make sure you restarted the frontend server after adding it
- Check that there are no typos in the variable name

**Error: "Unauthorized - invalid admin key"**
- Make sure the key in `frontend/.env` matches the key in `backend/.env`
- Make sure there are no extra spaces or quotes around the key value

