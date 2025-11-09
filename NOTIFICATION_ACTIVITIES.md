# Complete List of Notification Activities

This document lists ALL activities that trigger notifications in the system.

## ✅ All Activities with Notifications

### 1. New Complaint Filed
- **Trigger:** Victim files a new cyber fraud complaint
- **Recipients:** All Police Users + All Bank Users
- **Notification:** "New Cyber Fraud Complaint Filed"
- **Details:** Case ID, Victim Name, Amount Lost

---

### 2. Police Activities (Victim Notifications)

#### ✅ Case Viewed
- **Trigger:** Police clicks "Mark as Viewed"
- **Recipient:** Victim
- **Notification:** "Case Viewed by Police"
- **Message:** "Your case [ID] has been reviewed by police"

#### ✅ FIR Filed
- **Trigger:** Police files an FIR
- **Recipient:** Victim
- **Notification:** "FIR Filed for Your Case"
- **Message:** "FIR has been filed for your case [ID]. FIR Number: [Number]"

#### ✅ Status Updated
- **Trigger:** Police updates case status (Pending, In Process, Closed, etc.)
- **Recipient:** Victim
- **Notification:** "Case Status Updated by Police"
- **Message:** "Your case [ID] status has been updated to: [Status]. Note: [Note]"

#### ✅ Bank Investigation Requested
- **Trigger:** Police requests bank to investigate
- **Recipients:** Victim + All Bank Users
- **Notification (Victim):** "Bank Investigation Requested"
- **Notification (Bank):** "Bank Investigation Requested by Police"
- **Message (Victim):** "Police has requested bank investigation for your case [ID]"
- **Message (Bank):** "Police has requested investigation for case [ID]. Victim: [Name]. Amount: ₹[Amount]"

#### ✅ Message Sent
- **Trigger:** Police sends a message to victim
- **Recipient:** Victim
- **Notification:** "New Message from Police"
- **Message:** "You have a new message from police regarding your case [ID]: [Message Text]"

#### ✅ Case Note Added
- **Trigger:** Police adds a case note
- **Recipient:** Victim
- **Notification:** "Case Note Added by Police"
- **Message:** "Police has added a note to your case [ID]: [Note Text]"

---

### 3. Bank Activities (Victim Notifications)

#### ✅ Funds Frozen
- **Trigger:** Bank freezes funds
- **Recipient:** Victim
- **Notification:** "Funds Frozen by Bank"
- **Message:** "Bank has frozen funds for your case [ID]. Amount: ₹[Amount]"

#### ✅ Message Sent
- **Trigger:** Bank sends a message to victim
- **Recipient:** Victim
- **Notification:** "New Message from Bank"
- **Message:** "You have a new message from bank regarding your case [ID]: [Message Text]"

#### ✅ Status Updated
- **Trigger:** Bank updates case status
- **Recipient:** Victim
- **Notification:** "Case Status Updated by Bank"
- **Message:** "Your case [ID] status has been updated to: [Status]. Note: [Note]"

#### ✅ Refund Processed
- **Trigger:** Bank processes a refund
- **Recipient:** Victim
- **Notification:** "Refund Processed"
- **Message:** "Refund has been processed for your case [ID]. Amount: ₹[Amount]"

---

## 📊 Summary

### Total Activities: 11
- **New Complaint:** 1 activity
- **Police Activities:** 6 activities
- **Bank Activities:** 4 activities

### Notification Recipients:
- **Victims:** Receive notifications for all police and bank activities on their cases
- **Police Users:** Receive notifications when new complaints are filed
- **Bank Users:** Receive notifications when new complaints are filed AND when police requests investigation

---

## 🔍 How to Verify

1. **File a new complaint** → Check police/bank dashboards for notification
2. **Police views case** → Check victim dashboard for notification
3. **Police files FIR** → Check victim dashboard for notification
4. **Police updates status** → Check victim dashboard for notification
5. **Police requests bank investigation** → Check victim AND bank dashboards for notifications
6. **Police sends message** → Check victim dashboard for notification
7. **Police adds case note** → Check victim dashboard for notification
8. **Bank freezes funds** → Check victim dashboard for notification
9. **Bank sends message** → Check victim dashboard for notification
10. **Bank updates status** → Check victim dashboard for notification
11. **Bank processes refund** → Check victim dashboard for notification

---

## 🛠️ Technical Implementation

All notifications are created using functions in `frontend/src/utils/notifications.js`:
- `notifyNewComplaint()` - For new complaints
- `notifyVictimPoliceUpdate()` - For police activities
- `notifyVictimBankUpdate()` - For bank activities
- `createNotificationForRole()` - For role-based notifications

Notifications are stored in Firestore `notifications` collection and displayed in real-time via the NotificationBell component in the navbar.

