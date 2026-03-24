# WhatsApp Cloud API Integration Guide

This backend is now configured to Handle WhatsApp Cloud API webhooks as requested.

## 1. Environment Variables

You must add the following variables to your `backend/.env` file:

```env
# The permanent or temporary access token from Meta Dashboard
WHATSAPP_TOKEN=YOUR_ACCESS_TOKEN 

# The Phone Number ID from Meta Dashboard 
WHATSAPP_PHONE_ID=YOUR_PHONE_NUMBER_ID

# A custom secret string you make up (e.g., "my_super_secret_verify_token_123")
WHATSAPP_VERIFY_TOKEN=YOUR_WEBHOOK_VERIFY_TOKEN
```

## 2. Meta Dashboard Webhook Setup

1. Go to your App in [Meta Developers Dashboard](https://developers.facebook.com).
2. Go to **WhatsApp** -> **Configuration**.
3. Under **Webhook**, click **Edit**.
4. **Callback URL:** Enter the public URL for your backend (e.g., if using ngrok: `https://your-ngrok-url.app/whatsapp/webhook`).
   > *Note: Meta requires HTTPS for webhooks. If testing locally, you must use a tool like `ngrok` to expose your `localhost:5000` over HTTPS.*
5. **Verify Token:** Enter the exact string you set for `WHATSAPP_VERIFY_TOKEN` in your `.env`.
6. Click **Verify and Save**.
7. Under **Webhook Fields**, click **Manage** and subscribe to:
   - `messages`

## 3. Frontend Connection

The website is already connected to your bot:
When users click the floating WhatsApp icon on the bottom right of the website, it redirects them to start a chat with your WhatsApp bot.

To ensure it redirects to the *correct* bot phone number:
1. Open `frontend/src/components/WhatsAppBot.jsx`
2. Change the `botPhoneNumber` variable (around line 18) to the phone number associated with your WhatsApp Cloud API.
```javascript
const botPhoneNumber = '919999999999'; // Replace with your WhatsApp Bot Number
```

## 4. How It Works

1. A user clicks the button on the website and is redirected to WhatsApp with a prefilled greeting.
2. When the user sends the greeting (or any other text), Meta sends a `POST` request to `YOUR_DOMAIN/whatsapp/webhook`.
3. The backend receives it (`src/controllers/whatsappController.js`) and responds by sending an Interactive Menu with options (Complaint, Track Status, SOS).
4. When the user taps a button on the menu, the backend receives that tap and responds accordingly.
