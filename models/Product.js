const db = require('../config/db');

const Product = {
  async findAll({ search='', category='', minPrice='', maxPrice='', sort='newest', page=1, limit=12 }={}) {
    return Product.getAll({ search, category, minPrice, maxPrice, sort, page, limit });
  },

  async getAll({ search='', category='', minPrice='', maxPrice='', sort='newest', page=1, limit=12 }={}) {
    let query = db.collection('products')
      .where('status', '==', 'active')
      .where('is_approved', '==', true);

    if (category) query = query.where('category', '==', category);
    if (minPrice !== '') query = query.where('price', '>=', parseFloat(minPrice));
    if (maxPrice !== '') query = query.where('price', '<=', parseFloat(maxPrice));

    // Sorting
    if (sort === 'price_low') query = query.orderBy('price', 'asc');
    else if (sort === 'price_high') query = query.orderBy('price', 'desc');
    else if (sort === 'oldest') query = query.orderBy('created_at', 'asc');
    else query = query.orderBy('created_at', 'desc');

    const snap = await query.get();
    let products = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Search filter (client-side since Firestore doesn't support LIKE)
    if (search) {
      const s = search.toLowerCase();
      products = products.filter(p =>
        p.title?.toLowerCase().includes(s) || p.description?.toLowerCase().includes(s)
      );
    }

    // Pagination
    const start = (parseInt(page) - 1) * parseInt(limit);
    return products.slice(start, start + parseInt(limit));
  },

  async countAll({ search='', category='', minPrice='', maxPrice='' }={}) {
    const all = await Product.getAll({ search, category, minPrice, maxPrice, limit: 9999 });
    return all.length;
  },

  async findById(id) {
    const doc = await db.collection('products').doc(id).get();
    if (!doc.exists) return null;
    const data = doc.data();
    if (data.status === 'deleted') return null;

    // Fetch seller info
    const sellerDoc = await db.collection('users').doc(data.seller_id).get();
    const seller = sellerDoc.exists ? sellerDoc.data() : {};

    return {
      id: doc.id,
      ...data,
      seller_name: seller.full_name || '',
      college_name: seller.college_name || '',
      seller_email: seller.email || '',
      seller_avatar: seller.profile_image || null,
      seller_phone: seller.phone || null
    };
  },

  async create({ seller_id, title, price, category, description, image_url, contact_number, location, condition_type }) {
    const ref = await db.collection('products').add({
      seller_id,
      title,
      price: parseFloat(price),
      category,
      description,
      image_url: image_url || null,
      contact_number,
      location,
      condition_type: condition_type || 'Good',
      status: 'active',
      is_approved: true,
      views: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    return ref.id;
  },

  async update(id, sellerId, { title, price, category, description, image_url, contact_number, location, condition_type }) {
    const update = {
      title, price: parseFloat(price), category, description,
      contact_number, location, condition_type,
      updated_at: new Date().toISOString()
    };
    if (image_url) update.image_url = image_url;

    const doc = await db.collection('products').doc(id).get();
    if (!doc.exists || doc.data().seller_id !== sellerId) throw new Error('Unauthorized');
    await db.collection('products').doc(id).update(update);
  },

  async delete(id, sellerId) { return Product.softDelete(id, sellerId); },
  async softDelete(id, sellerId) {
    const doc = await db.collection('products').doc(id).get();
    if (!doc.exists || doc.data().seller_id !== sellerId) throw new Error('Unauthorized');
    await db.collection('products').doc(id).update({ status: 'deleted' });
  },

  async incrementViews(id) {
    const doc = await db.collection('products').doc(id).get();
    if (doc.exists) {
      await db.collection('products').doc(id).update({ views: (doc.data().views || 0) + 1 });
    }
  },

  async getBySeller(sellerId) {
    const snap = await db.collection('products')
      .where('seller_id', '==', sellerId)
      .where('status', '!=', 'deleted')
      .orderBy('status')
      .orderBy('created_at', 'desc')
      .get();
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async getCategories() {
    const snap = await db.collection('products').where('status', '==', 'active').get();
    const count = {};
    snap.docs.forEach(doc => {
      const cat = doc.data().category;
      count[cat] = (count[cat] || 0) + 1;
    });
    return Object.entries(count).map(([category, c]) => ({ category, count: c }))
      .sort((a, b) => b.count - a.count);
  },

  async isFavorited(userId, productId) {
    const snap = await db.collection('favorites')
      .where('user_id', '==', userId).where('product_id', '==', productId).limit(1).get();
    return !snap.empty;
  },

  async getFavoriteIds(userId) {
    const snap = await db.collection('favorites').where('user_id', '==', userId).get();
    return snap.docs.map(doc => doc.data().product_id);
  },

  async addFavorite(userId, productId) {
    const existing = await db.collection('favorites')
      .where('user_id', '==', userId).where('product_id', '==', productId).limit(1).get();
    if (existing.empty) {
      await db.collection('favorites').add({
        user_id: userId, product_id: productId, created_at: new Date().toISOString()
      });
    }
  },

  async removeFavorite(userId, productId) {
    const snap = await db.collection('favorites')
      .where('user_id', '==', userId).where('product_id', '==', productId).get();
    for (const doc of snap.docs) await doc.ref.delete();
  },

  async getFavoriteProducts(userId) {
    const favSnap = await db.collection('favorites').where('user_id', '==', userId)
      .orderBy('created_at', 'desc').get();
    const productIds = favSnap.docs.map(doc => doc.data().product_id);
    if (!productIds.length) return [];

    const products = [];
    for (const pid of productIds) {
      const p = await Product.findById(pid);
      if (p && p.status === 'active') products.push(p);
    }
    return products;
  },

  async getRelated(category, excludeId, limit=4) {
    const snap = await db.collection('products')
      .where('category', '==', category)
      .where('status', '==', 'active')
      .limit(limit + 1)
      .get();
    const results = snap.docs
      .filter(doc => doc.id !== excludeId)
      .slice(0, limit)
      .map(doc => ({ id: doc.id, ...doc.data() }));

    // Enrich with seller name
    for (const p of results) {
      const seller = await db.collection('users').doc(p.seller_id).get();
      if (seller.exists) p.seller_name = seller.data().full_name;
    }
    return results;
  }
};

const CATEGORIES = [
  'Books', 'Electronics', 'Mobiles', 'Cycles', 'Hostel Items',
  'Lab Equipment', 'Hobbies', 'Project Components', 'Fashion', 'Gaming'
];

module.exports = { Product, CATEGORIES };
