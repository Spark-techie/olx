const db = require('../config/db');

const Admin = {
  async getStats() {
    const [usersSnap, bannedSnap, productsSnap, pendingSnap, soldSnap, reportsSnap, messagesSnap, favSnap] = await Promise.all([
      db.collection('users').where('is_admin', '==', 0).get(),
      db.collection('users').where('is_banned', '==', 1).get(),
      db.collection('products').where('status', '==', 'active').get(),
      db.collection('products').where('is_approved', '==', false).where('status', '==', 'active').get(),
      db.collection('products').where('status', '==', 'sold').get(),
      db.collection('reports').where('status', '==', 'pending').get(),
      db.collection('messages').get(),
      db.collection('favorites').get(),
    ]);
    return {
      totalUsers: usersSnap.size,
      bannedUsers: bannedSnap.size,
      totalProducts: productsSnap.size,
      pendingApproval: pendingSnap.size,
      soldProducts: soldSnap.size,
      pendingReports: reportsSnap.size,
      totalMessages: messagesSnap.size,
      totalFavorites: favSnap.size,
    };
  },

  async getSignupTrend() {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const snap = await db.collection('users').where('created_at', '>=', since).where('is_admin', '==', 0).get();
    const days = {};
    snap.docs.forEach(doc => {
      const day = doc.data().created_at.split('T')[0];
      days[day] = (days[day] || 0) + 1;
    });
    return Object.entries(days).map(([day, count]) => ({ day, count })).sort((a, b) => a.day.localeCompare(b.day));
  },

  async getProductTrend() {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const snap = await db.collection('products').where('created_at', '>=', since).get();
    const days = {};
    snap.docs.forEach(doc => {
      const day = doc.data().created_at.split('T')[0];
      days[day] = (days[day] || 0) + 1;
    });
    return Object.entries(days).map(([day, count]) => ({ day, count })).sort((a, b) => a.day.localeCompare(b.day));
  },

  async getCategoryBreakdown() {
    const snap = await db.collection('products').where('status', '==', 'active').get();
    const count = {};
    snap.docs.forEach(doc => {
      const cat = doc.data().category;
      count[cat] = (count[cat] || 0) + 1;
    });
    return Object.entries(count).map(([category, c]) => ({ category, count: c })).sort((a, b) => b.count - a.count);
  },

  async getCollegeBreakdown() {
    const snap = await db.collection('users').where('is_admin', '==', 0).get();
    const count = {};
    snap.docs.forEach(doc => {
      const col = doc.data().college_name;
      count[col] = (count[col] || 0) + 1;
    });
    return Object.entries(count).map(([college_name, c]) => ({ college_name, count: c })).sort((a, b) => b.count - a.count);
  },

  async getAllUsers({ search='', page=1, limit=20 }={}) {
    const snap = await db.collection('users').orderBy('created_at', 'desc').get();
    let users = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    if (search) {
      const s = search.toLowerCase();
      users = users.filter(u => u.full_name?.toLowerCase().includes(s) || u.email?.toLowerCase().includes(s));
    }
    const start = (parseInt(page) - 1) * parseInt(limit);
    return users.slice(start, start + parseInt(limit));
  },

  async countUsers(search='') {
    const all = await Admin.getAllUsers({ search, limit: 99999 });
    return all.length;
  },

  async banUser(userId, reason) {
    await db.collection('users').doc(userId).update({ is_banned: 1, ban_reason: reason });
  },

  async unbanUser(userId) {
    await db.collection('users').doc(userId).update({ is_banned: 0, ban_reason: null });
  },

  async deleteUser(userId) {
    const doc = await db.collection('users').doc(userId).get();
    if (doc.exists && !doc.data().is_admin) await doc.ref.delete();
  },

  async getAllProducts({ search='', status='', category='', page=1, limit=20 }={}) {
    let snap = await db.collection('products').orderBy('created_at', 'desc').get();
    let products = snap.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(p => p.status !== 'deleted');
    if (search) {
      const s = search.toLowerCase();
      products = products.filter(p => p.title?.toLowerCase().includes(s));
    }
    if (status) products = products.filter(p => p.status === status);
    if (category) products = products.filter(p => p.category === category);

    // Enrich with seller info
    for (const p of products) {
      const seller = await db.collection('users').doc(p.seller_id).get();
      if (seller.exists) {
        p.seller_name = seller.data().full_name;
        p.seller_email = seller.data().email;
      }
    }
    const start = (parseInt(page) - 1) * parseInt(limit);
    return products.slice(start, start + parseInt(limit));
  },

  async countProducts({ search='', status='', category='' }={}) {
    const all = await Admin.getAllProducts({ search, status, category, limit: 99999 });
    return all.length;
  },

  async approveProduct(id) {
    await db.collection('products').doc(id).update({ is_approved: true, rejection_reason: null });
  },

  async rejectProduct(id, reason) {
    await db.collection('products').doc(id).update({ is_approved: false, rejection_reason: reason, status: 'deleted' });
  },

  async adminDeleteProduct(id) {
    await db.collection('products').doc(id).update({ status: 'deleted' });
  },

  async markProductSold(id) {
    await db.collection('products').doc(id).update({ status: 'sold' });
  },

  async getAllReports({ status='', page=1, limit=20 }={}) {
    let snap = await db.collection('reports').orderBy('created_at', 'desc').get();
    let reports = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    if (status) reports = reports.filter(r => r.status === status);
    for (const r of reports) {
      if (r.reporter_id) {
        const u = await db.collection('users').doc(r.reporter_id).get();
        if (u.exists) r.reporter_name = u.data().full_name;
      }
      if (r.product_id) {
        const p = await db.collection('products').doc(r.product_id).get();
        if (p.exists) r.product_title = p.data().title;
      }
    }
    const start = (parseInt(page) - 1) * parseInt(limit);
    return reports.slice(start, start + parseInt(limit));
  },

  async resolveReport(id) {
    await db.collection('reports').doc(id).update({ status: 'resolved' });
  },

  async dismissReport(id) {
    await db.collection('reports').doc(id).update({ status: 'dismissed' });
  },

  async getAllCategories() {
    const snap = await db.collection('categories').orderBy('sort_order', 'asc').get();
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async createCategory(name, icon) {
    await db.collection('categories').add({ name, icon: icon || '📦', is_active: true, sort_order: 99 });
  },

  async updateCategory(id, { name, icon, is_active, sort_order }) {
    await db.collection('categories').doc(id).update({ name, icon, is_active, sort_order });
  },

  async deleteCategory(id) {
    await db.collection('categories').doc(id).delete();
  },
};

module.exports = Admin;
