# Dialogflow Chatbot Setup Guide

This guide will help you set up a Dialogflow chatbot for your SafeWeb application.

## 🎯 What is Dialogflow?

Dialogflow is Google's conversational AI platform that allows you to create chatbots without coding. It's perfect for customer support, FAQs, and helping users navigate your website.

## ✅ Benefits

- 🟢 **Free plan available** - Perfect for getting started
- 🎨 **Visual interface** - Design conversations without coding
- 🔗 **Easy integration** - Just 2 lines of code
- 📱 **Multi-platform** - Can be linked to WhatsApp, Telegram, etc. later
- 🌐 **Multi-language** - Supports multiple languages

## 📋 Step-by-Step Setup

### Step 1: Create a Dialogflow Account

1. Go to [Dialogflow Console](https://dialogflow.cloud.google.com/)
2. Sign in with your Google account
3. Accept the terms and conditions

### Step 2: Create a New Agent

1. Click **"Create Agent"** button
2. Fill in the details:
   - **Agent Name**: `SafeWeb Support Bot` (or any name you prefer)
   - **Default Language**: `English` (or your preferred language)
   - **Time Zone**: Select your timezone
   - **Google Project**: Create a new project or select existing
3. Click **"Create"**

### Step 3: Configure Your Agent

1. Go to **Settings** (gear icon) → **General**
2. Enable **"Web Demo"** integration:
   - Scroll down to **"Integrations"**
   - Find **"Web Demo"**
   - Click **"Enable"**
   - Copy the **Agent ID** from the iframe URL (it looks like: `abc123def456...`)

### Step 4: Add Intents and Responses

#### Create Welcome Intent

1. Click **"Intents"** in the left menu
2. Click **"Create Intent"**
3. Name it: `Welcome`
4. Add Training Phrases (what users might say):
   - "Hello"
   - "Hi"
   - "Help"
   - "I need help"
   - "What can you do?"
5. Add Responses (what bot should reply):
   - "Hello! Welcome to SafeWeb. I'm here to help you with:
     - Filing cyber fraud complaints
     - Checking complaint status
     - Understanding our services
     - General questions
     
     How can I assist you today?"

#### Create FAQ Intents

Create intents for common questions:

**Intent: File Complaint**
- Training Phrases:
  - "How do I file a complaint?"
  - "I want to report fraud"
  - "File a cyber fraud report"
- Responses:
  - "To file a cyber fraud complaint, please:
    1. Go to the 'Cyber Fraud Report' page
    2. Fill in all required details
    3. Upload evidence if available
    4. Submit the form
     
     Would you like me to guide you through the process?"

**Intent: Check Status**
- Training Phrases:
  - "Check my complaint status"
  - "Where is my case?"
  - "Status of my complaint"
- Responses:
  - "To check your complaint status:
    1. Log in to your account
    2. Go to Dashboard
    3. View your cases and their current status
     
     You'll also receive notifications when there are updates!"

**Intent: Services**
- Training Phrases:
  - "What services do you offer?"
  - "What can you help with?"
  - "Tell me about your services"
- Responses:
  - "SafeWeb offers:
     • Cyber Fraud Complaint Filing
     • Phishing URL Detection
     • Real-time Case Tracking
     • Police & Bank Coordination
     • Secure Evidence Upload
     
     Which service would you like to know more about?"

### Step 5: Configure the Website

#### Option 1: Using Environment Variable (Recommended)

1. Create or edit `.env` file in the `frontend` directory:
   ```env
   VITE_DIALOGFLOW_AGENT_ID=your-agent-id-here
   ```

2. Replace `your-agent-id-here` with your actual Agent ID from Step 3

3. Restart your development server

#### Option 2: Direct Configuration

1. Open `frontend/src/components/DialogflowChatbot.jsx`
2. Find the line: `const agentId = import.meta.env.VITE_DIALOGFLOW_AGENT_ID || ''`
3. Replace with: `const agentId = 'your-agent-id-here'`
4. Save the file

### Step 6: Test the Chatbot

1. Start your development server: `npm run dev`
2. Open your website
3. Look for the chat button in the bottom-right corner
4. Click it to open the chatbot
5. Test with phrases like "Hello", "Help", "File complaint"

## 🎨 Customization

### Change Chatbot Position

Edit `frontend/src/components/DialogflowChatbot.jsx`:

```jsx
// Change position (currently: bottom-6 right-6)
className="fixed bottom-6 right-6 ..."
```

### Change Chatbot Size

Edit the width and height in the chatbot window:

```jsx
// Current: w-96 h-[600px]
className="... w-96 h-[600px] ..."
```

### Change Colors

The chatbot uses amber/yellow gradient. To change:

```jsx
// Find and replace: from-amber-500 to-yellow-500
// Example: from-blue-500 to-indigo-500
```

## 📱 Advanced Features

### Add Quick Replies

1. In Dialogflow, go to your Intent
2. Scroll to **"Responses"**
3. Click **"Add Response"** → **"Custom Payload"**
4. Add:
   ```json
   {
     "quickReplies": {
       "title": "Choose an option:",
       "quickReplies": [
         "File Complaint",
         "Check Status",
         "Contact Support"
       ]
     }
   }
   ```

### Add Rich Cards

You can add cards with images, buttons, etc. using Custom Payloads.

### Multi-language Support

1. In Dialogflow Settings → Languages
2. Add additional languages
3. Create intents for each language
4. Dialogflow will automatically detect user's language

## 🔧 Troubleshooting

### Chatbot Not Appearing

1. Check browser console for errors
2. Verify Agent ID is correct
3. Make sure Web Demo is enabled in Dialogflow
4. Check if `.env` file is in the `frontend` directory
5. Restart development server after adding `.env` file

### Chatbot Not Responding

1. Check if intents are properly configured
2. Verify training phrases are added
3. Check Dialogflow console for errors
4. Make sure agent is published (if using production)

### Environment Variable Not Working

1. Make sure variable name starts with `VITE_`
2. Restart development server
3. Check `.env` file is in correct location (`frontend/.env`)
4. Verify no typos in variable name

## 📚 Resources

- [Dialogflow Documentation](https://cloud.google.com/dialogflow/docs)
- [Dialogflow Console](https://dialogflow.cloud.google.com/)
- [Dialogflow Web Demo Guide](https://cloud.google.com/dialogflow/docs/integrations/web-demo)

## 🎉 You're Done!

Your chatbot is now live and ready to help users! The chatbot will appear as a floating button in the bottom-right corner of your website.

## 💡 Tips

1. **Start Simple**: Begin with basic intents and add more over time
2. **Test Regularly**: Test your chatbot with real user queries
3. **Update Frequently**: Add new intents based on common user questions
4. **Monitor Analytics**: Check Dialogflow analytics to see what users are asking
5. **Use Fallback Intents**: Configure fallback responses for unrecognized queries

## 🔐 Security Note

The Agent ID in the iframe is public and safe to expose. Dialogflow handles authentication and security on their end. However, for production, consider:
- Using environment variables (already implemented)
- Setting up proper Dialogflow access controls
- Monitoring usage in Dialogflow console

