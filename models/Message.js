const db = require('../config/db');

const Message = {
  async create({ sender_id, receiver_id, product_id, message }) {
    const ref = await db.collection('messages').add({
      sender_id, receiver_id, product_id, message,
      is_read: false,
      created_at: new Date().toISOString()
    });
    return ref.id;
  },

  async getConversation(user1_id, user2_id, product_id) {
    const snap = await db.collection('messages')
      .where('product_id', '==', product_id)
      .orderBy('created_at', 'asc')
      .get();

    const msgs = snap.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(m =>
        (m.sender_id === user1_id && m.receiver_id === user2_id) ||
        (m.sender_id === user2_id && m.receiver_id === user1_id)
      );

    // Enrich with user names
    for (const m of msgs) {
      const sender = await db.collection('users').doc(m.sender_id).get();
      const receiver = await db.collection('users').doc(m.receiver_id).get();
      if (sender.exists) m.sender_name = sender.data().full_name;
      if (receiver.exists) m.receiver_name = receiver.data().full_name;
    }
    return msgs;
  },

  async getInbox(user_id) {
    const snap = await db.collection('messages')
      .orderBy('created_at', 'desc')
      .get();

    const all = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(m => m.sender_id === user_id || m.receiver_id === user_id);

    // Group by product + conversation pair
    const groups = {};
    for (const m of all) {
      const key = `${m.product_id}_${[m.sender_id, m.receiver_id].sort().join('_')}`;
      if (!groups[key]) groups[key] = { ...m, msg_count: 0, unread_count: 0 };
      groups[key].msg_count++;
      if (m.receiver_id === user_id && !m.is_read) groups[key].unread_count++;
    }

    // Enrich with sender + product info
    const results = [];
    for (const g of Object.values(groups)) {
      const sender = await db.collection('users').doc(g.sender_id).get();
      const product = await db.collection('products').doc(g.product_id).get();
      if (sender.exists) g.sender_name = sender.data().full_name;
      if (product.exists) {
        g.product_title = product.data().title;
        g.product_image = product.data().image_url;
      }
      results.push(g);
    }
    return results;
  },

  async markAsRead(receiver_id, sender_id, product_id) {
    const snap = await db.collection('messages')
      .where('receiver_id', '==', receiver_id)
      .where('sender_id', '==', sender_id)
      .where('product_id', '==', product_id)
      .where('is_read', '==', false)
      .get();
    for (const doc of snap.docs) await doc.ref.update({ is_read: true });
  },

  async getUnreadCount(user_id) {
    const snap = await db.collection('messages')
      .where('receiver_id', '==', user_id)
      .where('is_read', '==', false)
      .get();
    return snap.size;
  }
};

module.exports = Message;
