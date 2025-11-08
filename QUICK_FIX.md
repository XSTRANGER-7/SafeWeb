# Quick Fix: Add VITE_ADMIN_API_KEY

## Your Backend Admin Key
Your backend already has this admin key:
```
2bb6c18b1c30d2eaf9a7cde784af6649edab1e54fcc56a6e823b12b949d7f806
```

## Steps to Fix

### 1. Open `frontend/.env` file
Open the file: `d:\safeweb\frontend\.env`

### 2. Add this line to the file
Add this line (use the EXACT same key from backend):
```
VITE_ADMIN_API_KEY=2bb6c18b1c30d2eaf9a7cde784af6649edab1e54fcc56a6e823b12b949d7f806
```

### 3. Make sure your frontend/.env has these lines:
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

### 4. Save the file

### 5. RESTART your frontend server
**IMPORTANT:** You MUST restart your frontend development server after adding the environment variable:

1. Stop the server (press `Ctrl+C` in the terminal where it's running)
2. Start it again:
   ```bash
   cd frontend
   npm run dev
   ```

## That's it!
After restarting, the error should be gone and you can create official accounts.

