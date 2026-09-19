import { collection, addDoc, query, where, getDocs } from 'firebase/firestore'
import { db } from '../../firebase'

/**
 * Create a notification for a specific user (by UID and/or Email)
 */
export async function createNotification(recipientId, title, message, link = null, type = 'info', recipientEmail = null, caseId = null) {
  try {
    const targetId = recipientId && recipientId !== 'anonymous' ? recipientId : (recipientEmail || '')
    if (!targetId && !recipientEmail) {
      console.warn('⚠️ Cannot create notification: neither recipientId nor recipientEmail is provided')
      return null
    }

    const notificationData = {
      recipientId: targetId,
      recipientEmail: recipientEmail || null,
      caseId: caseId || null,
      title,
      message,
      link,
      type,
      read: false,
      readBy: [],
      createdAt: Date.now()
    }

    const docRef = await addDoc(collection(db, 'notifications'), notificationData)
    console.log(`✅ Notification created: ${docRef.id}`, notificationData)
    return docRef.id
  } catch (error) {
    console.error('❌ Error creating notification:', error)
    return null
  }
}

/**
 * Create notifications for all users with a specific role (police or bank)
 */
export async function createNotificationForRole(role, title, message, link = null, type = 'info', caseId = null) {
  try {
    const now = Date.now()

    // 1. Create a broad role notification with recipientRole: role
    try {
      await addDoc(collection(db, 'notifications'), {
        recipientRole: role,
        recipientId: `role_${role}`,
        caseId: caseId || null,
        title,
        message,
        link,
        type,
        read: false,
        readBy: [],
        createdAt: now
      })
    } catch (e) {
      console.warn('Broad role notification creation failed:', e)
    }

    // 2. Also query users and officials collections to create direct notifications
    const recipients = new Set()

    try {
      const usersRef = collection(db, 'users')
      const q = query(usersRef, where('role', '==', role))
      const snapshot = await getDocs(q)
      snapshot.forEach(d => recipients.add(d.id))
    } catch (err) {
      console.warn('Could not query users collection for role:', role, err)
    }

    try {
      const officialsRef = collection(db, 'officials')
      const officialsQ = query(officialsRef, where('role', '==', role))
      const officialsSnapshot = await getDocs(officialsQ)
      officialsSnapshot.forEach(d => recipients.add(d.id))
    } catch (err) {
      console.warn('Could not query officials collection for role:', role, err)
    }

    const promises = []
    recipients.forEach((userId) => {
      promises.push(
        addDoc(collection(db, 'notifications'), {
          recipientId: userId,
          recipientRole: role,
          caseId: caseId || null,
          title,
          message,
          link,
          type,
          read: false,
          readBy: [],
          createdAt: now
        }).catch(err => console.warn('Direct notification write failed:', err))
      )
    })

    if (promises.length > 0) {
      await Promise.all(promises)
    }
  } catch (error) {
    console.error(`❌ Error creating notifications for ${role} users:`, error)
  }
}

/**
 * Create notifications for both police and bank when a new complaint is filed
 */
export async function notifyNewComplaint(caseId, caseData) {
  try {
    const title = '🚨 New Cyber Fraud Complaint Filed'
    const message = `Case ${caseId} filed. Victim: ${caseData.victimName || 'Citizen'}. Amount: ₹${Number(caseData.amountLost || 0).toLocaleString('en-IN')}`

    // Notify all police users - link to police dashboard
    await createNotificationForRole('police', title, message, `/police-dashboard?caseId=${caseId}`, 'new_complaint', caseId)

    // Notify all bank users - link to bank dashboard
    await createNotificationForRole('bank', title, message, `/bank-dashboard?caseId=${caseId}`, 'new_complaint', caseId)

    console.log('✅ Notifications dispatched to police and bank for new complaint', caseId)
  } catch (error) {
    console.error('Error notifying new complaint:', error)
  }
}

/**
 * Notify victim when police updates their case
 */
export async function notifyVictimPoliceUpdate(victimUid, caseId, updateType, details = {}, victimEmail = null) {
  try {
    let title = '👮 Police Update on Your Case'
    let message = ''

    switch (updateType) {
      case 'status':
        title = `👮 Case Status: ${details.status || 'Updated'}`
        message = `Your case ${caseId} is now marked as "${details.status || 'Updated'}"${details.note ? `. Note: ${details.note}` : ''}`
        break
      case 'fir':
        title = '📋 FIR Registered by Police'
        message = `Official FIR has been registered for your case ${caseId}. FIR Number: ${details.firNumber || 'N/A'}`
        break
      case 'investigation':
        title = '🏦 Bank Investigation Requested'
        message = `Police has officially requested bank investigation & fund-freeze for your case ${caseId}.`
        break
      case 'message':
        title = '💬 New Message from Police'
        message = `Officer: ${details.message || 'New message regarding your complaint.'}`
        break
      case 'viewed':
        title = '👀 Case Under Review by Police'
        message = `A Cyber Crime officer has opened and reviewed your case ${caseId}.`
        break
      case 'note':
        title = '📝 Officer Note Added'
        message = `Police added a note to your case ${caseId}: ${details.note || 'Note added'}`
        break
      default:
        message = `Your complaint ${caseId} has been updated by the police department.`
    }

    const link = `/dashboard?caseId=${caseId}`
    await createNotification(victimUid, title, message, link, 'police_update', victimEmail, caseId)
  } catch (error) {
    console.error('Error notifying victim of police update:', error)
  }
}

/**
 * Notify victim when bank updates their case
 */
export async function notifyVictimBankUpdate(victimUid, caseId, updateType, details = {}, victimEmail = null) {
  try {
    let title = '🏦 Bank Update on Your Case'
    let message = ''

    switch (updateType) {
      case 'freeze':
        title = '❄️ Funds Frozen by Bank'
        message = `Bank has successfully frozen funds of ₹${Number(details.amount || 0).toLocaleString('en-IN')} for case ${caseId}.`
        break
      case 'refund':
        title = '💰 Refund Processed by Bank'
        message = `A refund of ₹${Number(details.amount || 0).toLocaleString('en-IN')} has been initiated for case ${caseId}.`
        break
      case 'status':
        title = `🏦 Bank Status: ${details.status || 'Updated'}`
        message = `Bank updated case ${caseId} to "${details.status || 'Updated'}"${details.note ? `. Note: ${details.note}` : ''}`
        break
      case 'message':
        title = '💬 New Message from Bank'
        message = `Bank Official: ${details.message || 'New message regarding your transaction.'}`
        break
      default:
        message = `Your bank has updated information on case ${caseId}.`
    }

    const link = `/dashboard?caseId=${caseId}`
    await createNotification(victimUid, title, message, link, 'bank_update', victimEmail, caseId)
  } catch (error) {
    console.error('Error notifying victim of bank update:', error)
  }
}
