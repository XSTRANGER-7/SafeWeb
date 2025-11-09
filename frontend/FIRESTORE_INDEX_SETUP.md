# Firestore Index Setup for Notifications

## Required Index

To enable efficient querying of notifications, you need to create a composite index in Firestore.

### Index Details:
- **Collection**: `notifications`
- **Fields**:
  1. `recipientId` (Ascending)
  2. `createdAt` (Descending)

### How to Create the Index:

1. **Automatic (Recommended)**:
   - When you run the app and the notification query fails, Firebase will show an error with a link to create the index automatically
   - Click the link in the error message to create the index

2. **Manual**:
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Select your project
   - Go to **Firestore Database** → **Indexes** tab
   - Click **Create Index**
   - Set:
     - Collection ID: `notifications`
     - Fields:
       - `recipientId` - Ascending
       - `createdAt` - Descending
   - Click **Create**

### Note:
The notification system will work without this index, but it will use a simpler query and sort in memory. The index improves performance, especially as the number of notifications grows.

