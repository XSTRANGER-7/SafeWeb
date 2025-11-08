# Firebase Service Account Setup

## How to Get Your Service Account Key

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com
   - Select your project

2. **Navigate to Project Settings**
   - Click the gear icon ⚙️ next to "Project Overview"
   - Select **Project settings**

3. **Go to Service Accounts Tab**
   - Click on the **Service accounts** tab
   - You'll see "Firebase Admin SDK"

4. **Generate New Private Key**
   - Click **Generate new private key** button
   - A confirmation dialog will appear
   - Click **Generate key**
   - A JSON file will be downloaded automatically

5. **Save the File**
   - Rename the downloaded file to `serviceAccountKey.json`
   - Move it to the `backend` folder
   - Replace the existing empty file

## File Location

The file should be located at:
```
backend/serviceAccountKey.json
```

## Security Note

⚠️ **IMPORTANT**: 
- **NEVER** commit `serviceAccountKey.json` to version control
- This file contains sensitive credentials
- It should already be in `.gitignore`
- Keep it secure and private

## File Structure

The `serviceAccountKey.json` file should look like this:

```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "your-private-key-id",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com",
  "client_id": "your-client-id",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
}
```

## Troubleshooting

### Error: "Unexpected end of JSON input"
- The file is empty or corrupted
- Solution: Download a new key from Firebase Console

### Error: "Invalid service account key"
- Missing required fields in the JSON
- Solution: Ensure you downloaded the complete key from Firebase Console

### Error: "File not found"
- The file doesn't exist in the backend folder
- Solution: Download and place the file in the correct location

## Alternative: Use Environment Variable

You can also set the path via environment variable in `backend/.env`:

```env
FIREBASE_SERVICE_ACCOUNT=./path/to/your/serviceAccountKey.json
```

