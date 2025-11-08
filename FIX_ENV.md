# ⚠️ IMPORTANT: Fix Your .env File

I can see the `VITE_ADMIN_API_KEY` was added, but it's on the same line as `VITE_API_URL`. 

## Quick Fix Steps:

### 1. Open `frontend/.env` file
Open: `d:\safeweb\frontend\.env`

### 2. Make sure it looks like this (each variable on its own line):

```
VITE_FIREBASE_APIKEY=AIzaSyAS7LOBZ39dCv73RY_4u-JUAIxjt-DZg9U
VITE_FIREBASE_AUTHDOMAIN=safeweb-b3ea1.firebaseapp.com
VITE_FIREBASE_PROJECTID=safeweb-b3ea1
VITE_FIREBASE_STORAGEBUCKET=safeweb-b3ea1.firebasestorage.app
VITE_FIREBASE_MESSAGINGSENDERID=546833493073
VITE_FIREBASE_APPID=1:546833493073:web:c7beb802fe6527db711c70
VITE_API_URL=http://localhost:5000
VITE_ADMIN_API_KEY=2bb6c18b1c30d2eaf9a7cde784af6649edab1e54fcc56a6e823b12b949d7f806
```

**Important:** Make sure `VITE_API_URL` and `VITE_ADMIN_API_KEY` are on **separate lines**!

### 3. Save the file

### 4. RESTART YOUR FRONTEND SERVER
**THIS IS CRITICAL!** Vite only reads environment variables when the server starts.

1. **Stop** your frontend server (press `Ctrl+C` in the terminal)
2. **Start** it again:
   ```bash
   cd frontend
   npm run dev
   ```

### 5. Refresh your browser
After restarting, refresh the browser page where you see the error.

## Why it's not working:
- Environment variables are only loaded when Vite starts
- If you added the variable but didn't restart, it won't be available
- The variable must be on its own line in the .env file

## Verify it's working:
After restarting, the error message should disappear and you should be able to create official accounts.

