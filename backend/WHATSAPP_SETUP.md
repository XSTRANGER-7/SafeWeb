# 📱 WhatsApp Cloud API & Meta Setup Guide

This guide explains specifically how to connect the SafeWeb backend to the **Official Meta WhatsApp Cloud API** step-by-step so that the chatbot redirect on the frontend actually communicates with your backend server.

---

## Step 1: Create a Meta Developer App

1. Go to the [Meta for Developers Portal](https://developers.facebook.com/).
2. Log in with your Facebook account.
3. Click on **My Apps** in the top right corner.
4. Click **Create App**.
5. Select **Other** as the use case, then click **Next**.
6. Select **Business** as the app type, then click **Next**.
7. Give your app a name (e.g., *SafeWeb OP Bot*) and enter your contact email. Click **Create App**.

---

## Step 2: Add the WhatsApp Product

1. In your App Dashboard, scroll down to **Add products to your app**.
2. Find the **WhatsApp** card and click **Set up**.
3. Select an existing Meta Business Account or leave it to create a new one. Click **Continue**.
4. You will be redirected to the **WhatsApp > API Setup** page.

---

## Step 3: Get Your Credentials

On the **API Setup** page, you will see a temporary access token and a Test Phone Number.

To connect your `backend`, you need three things for your `.env` file:

1. **Temporary Access Token**: Copy the long token string.
   > *Note: Temporary tokens expire in 24 hours. For production, you must generate a Permanent System User Token in your Meta Business Settings.*
2. **Phone Number ID**: Copy the ID associated with the phone number you are sending messages from.
3. **Verify Token**: Make up a secure password-like string (e.g., `safeweb_verify_2026`).

Open your `backend/.env` file and add them:

```env
WHATSAPP_TOKEN="Paste_Your_Access_Token_Here"
WHATSAPP_PHONE_ID="Paste_Your_Phone_Number_ID_Here"
WHATSAPP_VERIFY_TOKEN="safeweb_verify_2026"
```

---

## Step 4: Configure the Webhook

Meta needs to know where to send messages when users reply to your bot.

1. In the left sidebar of the Meta Dashboard, click **WhatsApp > Configuration**.
2. Click the **Edit** button under the Webhook section.
3. **Callback URL:** Enter the public URL of your backend followed by `/whatsapp/webhook`.
   - *Example (Production):* `https://api.yourdomain.com/whatsapp/webhook`
   - *Example (Local Testing):* If running locally on port 5000, use [ngrok](https://ngrok.com/) (`ngrok http 5000`) and paste the HTTPS URL: `https://1a2b3c4d.ngrok.app/whatsapp/webhook`
4. **Verify Token:** Enter the exact string you saved in your `.env` file (`safeweb_verify_2026`).
5. Click **Verify and save**.
   > *Note: Your Node.js backend must be running for Meta to verify the webhook successfully!*

### Subscribe to Message Events
Once the webhook is verified:
1. Under the Webhook section, click **Manage**.
2. Find **messages** in the list and click **Subscribe**.

---

## Step 5: Connect the Frontend

Now that the backend is processing messages, you need to point the frontend floating button to your WhatsApp bot number.

1. Go back to the **API Setup** page on Meta.
2. Under "Send and receive messages", find your **Test Phone Number** (or real number if verified).
3. Open `frontend/src/components/WhatsAppBot.jsx`.
4. Locate the `botPhoneNumber` variable near the top of the component:
   ```javascript
   const botPhoneNumber = '15551234567'; // Enter your Meta Phone Number here (Country Code + Number, no + or spaces)
   ```
5. Save the file. When users click the "Official WhatsApp Bot" banner inside your web chat, they will securely redirect to this number on WhatsApp Web or their mobile app.

---

## Usage in Production

To go live officially, you must:
1. Add a real phone number in **WhatsApp > API Setup** instead of using the test number.
2. Complete verifying your Meta Business Account.
3. Generate a **Permanent Access Token** via System Users in Business Settings.
4. Replace the `WHATSAPP_TOKEN` in `.env` with the permanent one.
