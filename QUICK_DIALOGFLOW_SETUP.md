# Quick Dialogflow Setup (5 Minutes)

## 🚀 Fast Setup Steps

### 1. Create Dialogflow Agent (2 minutes)
1. Go to: https://dialogflow.cloud.google.com/
2. Click **"Create Agent"**
3. Name: `SafeWeb Bot`
4. Click **"Create"**

### 2. Enable Web Demo (1 minute)
1. Click **Settings** (⚙️ icon) → **Integrations**
2. Find **"Web Demo"** → Click **"Enable"**
3. **Copy the Agent ID** from the iframe URL
   - It looks like: `abc123def456-ghi789...`
   - Example URL: `https://console.dialogflow.com/api-client/demo/embedded/abc123def456-ghi789`

### 3. Add Basic Intents (1 minute)
1. Click **"Intents"** → **"Create Intent"**
2. Name: `Welcome`
3. Add Training Phrases:
   - "Hello"
   - "Hi"
   - "Help"
4. Add Response:
   - "Hello! I'm SafeWeb assistant. How can I help you today?"

### 4. Configure Website (1 minute)

**Option A: Using .env file (Recommended)**
1. Create `frontend/.env` file
2. Add this line:
   ```
   VITE_DIALOGFLOW_AGENT_ID=your-agent-id-here
   ```
3. Replace `your-agent-id-here` with your actual Agent ID
4. Restart your dev server

**Option B: Direct in code**
1. Open `frontend/src/components/DialogflowChatbot.jsx`
2. Find line 26: `const agentId = import.meta.env.VITE_DIALOGFLOW_AGENT_ID || ''`
3. Replace with: `const agentId = 'your-agent-id-here'`
4. Save file

### 5. Test! ✅
1. Open your website
2. Look for chat button (bottom-right)
3. Click it and say "Hello"

## 🎉 Done!

Your chatbot is now live! The chat button appears on all pages.

## 📝 Common Intents to Add Later

- **File Complaint**: "How do I file a complaint?"
- **Check Status**: "Check my complaint status"
- **Services**: "What services do you offer?"
- **Contact**: "How can I contact support?"

## 🔧 Troubleshooting

**Chatbot not showing?**
- Check browser console for errors
- Verify Agent ID is correct
- Make sure Web Demo is enabled
- Restart dev server after adding .env

**Need help?** See `DIALOGFLOW_SETUP.md` for detailed guide.

