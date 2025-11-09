# Notification System Documentation

## Overview
The notification system provides real-time updates to users about important activities related to their cases. Notifications appear in the notification bell icon in the navbar.

## Notification Triggers

### 1. New Complaint Filed
**When:** A victim files a new cyber fraud complaint  
**Recipients:** All police users and all bank users  
**Message:** "A new complaint has been filed. Case ID: [ID]. Victim: [Name]. Amount: ₹[Amount]"  
**Link:** Police users → `/police-dashboard?caseId=[ID]`, Bank users → `/bank-dashboard?caseId=[ID]`

### 2. Police Updates (Victim Notifications)

#### Status Update
**When:** Police updates the case status  
**Recipients:** Victim  
**Message:** "Your case [ID] status has been updated to: [Status]. Note: [Note]"  
**Link:** `/dashboard?caseId=[ID]`

#### FIR Filed
**When:** Police files an FIR for the case  
**Recipients:** Victim  
**Message:** "FIR has been filed for your case [ID]. FIR Number: [FIR Number]"  
**Link:** `/dashboard?caseId=[ID]`

#### Bank Investigation Requested
**When:** Police requests bank to investigate  
**Recipients:** Victim + All Bank Users  
**Message (Victim):** "Police has requested bank investigation for your case [ID]"  
**Message (Bank):** "Police has requested investigation for case [ID]. Victim: [Name]. Amount: ₹[Amount]"  
**Link:** Victim → `/dashboard?caseId=[ID]`, Bank → `/bank-dashboard?caseId=[ID]`

#### New Message from Police
**When:** Police sends a message to the victim  
**Recipients:** Victim  
**Message:** "You have a new message from police regarding your case [ID]: [Message]"  
**Link:** `/dashboard?caseId=[ID]`

#### Case Viewed
**When:** Police marks the case as viewed  
**Recipients:** Victim  
**Message:** "Your case [ID] has been reviewed by police"  
**Link:** `/dashboard?caseId=[ID]`

#### Case Note Added
**When:** Police adds a note to the case  
**Recipients:** Victim  
**Message:** "Police has added a note to your case [ID]: [Note]"  
**Link:** `/dashboard?caseId=[ID]`

### 3. Bank Updates (Victim Notifications)

#### Funds Frozen
**When:** Bank freezes funds for the case  
**Recipients:** Victim  
**Message:** "Bank has frozen funds for your case [ID]. Amount: ₹[Amount]"  
**Link:** `/dashboard?caseId=[ID]`

#### Refund Processed
**When:** Bank processes a refund  
**Recipients:** Victim  
**Message:** "Refund has been processed for your case [ID]. Amount: ₹[Amount]"  
**Link:** `/dashboard?caseId=[ID]`

#### Status Update
**When:** Bank updates the case status  
**Recipients:** Victim  
**Message:** "Your case [ID] status has been updated to: [Status]. Note: [Note]"  
**Link:** `/dashboard?caseId=[ID]`

#### New Message from Bank
**When:** Bank sends a message to the victim  
**Recipients:** Victim  
**Message:** "You have a new message from bank regarding your case [ID]: [Message]"  
**Link:** `/dashboard?caseId=[ID]`

## Technical Implementation

### Components
- **NotificationBell** (`frontend/src/components/NotificationBell.jsx`): Displays notifications in the navbar
- **Notification Utilities** (`frontend/src/utils/notifications.js`): Functions to create notifications

### Firestore Structure
```
notifications/
  {notificationId}/
    recipientId: string (user UID)
    title: string
    message: string
    link: string (optional)
    type: string (new_complaint, police_update, bank_update, etc.)
    read: boolean
    createdAt: number (timestamp)
    readAt: number (timestamp, optional)
```

### Real-time Updates
Notifications use Firestore `onSnapshot` for real-time updates. When a notification is created, it immediately appears in the notification bell for the recipient.

### Error Handling
- Notification creation failures are logged but don't block the main operation
- Missing Firestore indexes are handled gracefully with fallback queries
- Invalid recipient IDs are logged as warnings

## Setup Requirements

### Firestore Index (Optional but Recommended)
Create a composite index for efficient querying:
- Collection: `notifications`
- Fields: `recipientId` (Ascending), `createdAt` (Descending)

See `FIRESTORE_INDEX_SETUP.md` for detailed instructions.

### Firestore Rules
The notification collection rules allow:
- Users to read their own notifications
- Users to update their own notifications (mark as read)
- Authenticated users to create notifications
- Police/bank to delete notifications

## Debugging

### Check Console Logs
The notification system logs all activities:
- ✅ Success: `✅ Notification created: [ID] for user [UID]`
- ⚠️ Warning: `⚠️ No users found with role: [role]`
- ❌ Error: `❌ Error creating notification: [error]`

### Common Issues

1. **Notifications not appearing**
   - Check browser console for errors
   - Verify user is logged in
   - Check Firestore rules allow read access
   - Verify `recipientId` matches user UID

2. **Notifications not being created**
   - Check console for error messages
   - Verify Firestore rules allow create access
   - Check if recipient user exists in Firestore

3. **Query errors**
   - If you see "index required" error, create the composite index
   - The system will fallback to a simpler query if index is missing

## Testing

To test notifications:
1. File a new complaint → Check police/bank dashboards for notifications
2. Update case status as police → Check victim dashboard for notification
3. Send a message as police/bank → Check victim dashboard for notification
4. Freeze funds as bank → Check victim dashboard for notification

