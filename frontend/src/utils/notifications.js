import { collection, addDoc, query, where, getDocs } from 'firebase/firestore'
import { db } from '../../firebase'

/**
 * Create a notification for a specific user
 */
export async function createNotification(recipientId, title, message, link = null, type = 'info') {
  try {
    if (!recipientId) {
      console.warn('⚠️ Cannot create notification: recipientId is missing')
      return
    }
    
    const notificationData = {
      recipientId,
      title,
      message,
      link,
      type,
      read: false,
      createdAt: Date.now()
    }
    
    const docRef = await addDoc(collection(db, 'notifications'), notificationData)
    console.log(`✅ Notification created: ${docRef.id} for user ${recipientId}`, notificationData)
    return docRef.id
  } catch (error) {
    console.error('❌ Error creating notification:', error)
    console.error('Notification data:', { recipientId, title, message, link, type })
    throw error
  }
}

/**
 * Create notifications for all users with a specific role (police or bank)
 */
export async function createNotificationForRole(role, title, message, link = null, type = 'info') {
  try {
    // Query users collection for users with the specified role
    const usersRef = collection(db, 'users')
    const q = query(usersRef, where('role', '==', role))
    const snapshot = await getDocs(q)

    if (snapshot.empty) {
      console.warn(`⚠️ No users found with role: ${role}`)
      // Also check officials collection
      const officialsRef = collection(db, 'officials')
      const officialsQ = query(officialsRef, where('role', '==', role))
      const officialsSnapshot = await getDocs(officialsQ)
      
      if (officialsSnapshot.empty) {
        console.warn(`⚠️ No officials found with role: ${role}`)
        return
      }
      
      const promises = []
      officialsSnapshot.forEach((doc) => {
        const userId = doc.id
        promises.push(
          addDoc(collection(db, 'notifications'), {
            recipientId: userId,
            title,
            message,
            link,
            type,
            read: false,
            createdAt: Date.now()
          })
        )
      })
      
      await Promise.all(promises)
      console.log(`✅ Created ${promises.length} notifications for ${role} users (from officials)`)
      return
    }

    const promises = []
    snapshot.forEach((doc) => {
      const userId = doc.id
      promises.push(
        addDoc(collection(db, 'notifications'), {
          recipientId: userId,
          title,
          message,
          link,
          type,
          read: false,
          createdAt: Date.now()
        })
      )
    })

    await Promise.all(promises)
    console.log(`✅ Created ${promises.length} notifications for ${role} users`)
  } catch (error) {
    console.error(`❌ Error creating notifications for ${role} users:`, error)
    throw error
  }
}

/**
 * Create notifications for both police and bank when a new complaint is filed
 */
export async function notifyNewComplaint(caseId, caseData) {
  try {
    const title = 'New Cyber Fraud Complaint Filed'
    const message = `A new complaint has been filed. Case ID: ${caseId}. Victim: ${caseData.victimName || 'Unknown'}. Amount: ₹${caseData.amountLost || 0}`
    
    // Notify all police users - link to police dashboard
    await createNotificationForRole('police', title, message, `/police-dashboard?caseId=${caseId}`, 'new_complaint')

    // Notify all bank users - link to bank dashboard
    await createNotificationForRole('bank', title, message, `/bank-dashboard?caseId=${caseId}`, 'new_complaint')

    console.log('✅ Notifications sent to police and bank for new complaint')
  } catch (error) {
    console.error('Error notifying new complaint:', error)
    // Don't throw - we don't want to fail the complaint creation if notification fails
  }
}

/**
 * Notify victim when police updates their case
 */
export async function notifyVictimPoliceUpdate(victimUid, caseId, updateType, details) {
  try {
    let title = 'Case Update from Police'
    let message = ''

    switch (updateType) {
      case 'status':
        title = 'Case Status Updated by Police'
        message = `Your case ${caseId} status has been updated to: ${details.status || 'Updated'}${details.note ? `. Note: ${details.note}` : ''}`
        break
      case 'fir':
        title = 'FIR Filed for Your Case'
        message = `FIR has been filed for your case ${caseId}. FIR Number: ${details.firNumber || 'N/A'}`
        break
      case 'investigation':
        title = 'Bank Investigation Requested'
        message = `Police has requested bank investigation for your case ${caseId}`
        break
      case 'message':
        title = 'New Message from Police'
        message = `You have a new message from police regarding your case ${caseId}: ${details.message || 'New message received'}`
        break
      case 'viewed':
        title = 'Case Viewed by Police'
        message = `Your case ${caseId} has been reviewed by police`
        break
      case 'note':
        title = 'Case Note Added by Police'
        message = `Police has added a note to your case ${caseId}: ${details.note || 'New note added'}`
        break
      default:
        message = `Your case ${caseId} has been updated by police`
    }

    const link = `/dashboard?caseId=${caseId}`

    await createNotification(victimUid, title, message, link, 'police_update')
    console.log('✅ Notification sent to victim for police update')
  } catch (error) {
    console.error('Error notifying victim of police update:', error)
  }
}

/**
 * Notify victim when bank updates their case
 */
export async function notifyVictimBankUpdate(victimUid, caseId, updateType, details) {
  try {
    let title = 'Case Update from Bank'
    let message = ''

    switch (updateType) {
      case 'freeze':
        title = 'Funds Frozen by Bank'
        message = `Bank has frozen funds for your case ${caseId}. Amount: ₹${details.amount || 'N/A'}`
        break
      case 'refund':
        title = 'Refund Processed'
        message = `Refund has been processed for your case ${caseId}. Amount: ₹${details.amount || 'N/A'}`
        break
      case 'status':
        title = 'Case Status Updated by Bank'
        message = `Your case ${caseId} status has been updated to: ${details.status || 'Updated'}${details.note ? `. Note: ${details.note}` : ''}`
        break
      case 'message':
        title = 'New Message from Bank'
        message = `You have a new message from bank regarding your case ${caseId}: ${details.message || 'New message received'}`
        break
      default:
        message = `Your case ${caseId} has been updated by bank`
    }

    const link = `/dashboard?caseId=${caseId}`

    await createNotification(victimUid, title, message, link, 'bank_update')
    console.log('✅ Notification sent to victim for bank update')
  } catch (error) {
    console.error('Error notifying victim of bank update:', error)
  }
}

