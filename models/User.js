const db = require('../config/db');
const bcrypt = require('bcryptjs');

const ALLOWED_DOMAINS = ['krct.ac.in', 'krce.ac.in', 'mkec.ac.in'];
const COLLEGE_MAP = {
  'krct.ac.in': 'KR College of Technology',
  'krce.ac.in': 'KR College of Engineering',
  'mkec.ac.in': 'Muthayammal Engineering College'
};

const User = {
  isValidCollegeEmail(email) {
    const domain = email.split('@')[1];
    return ALLOWED_DOMAINS.includes(domain);
  },

  getCollegeName(email) {
    const domain = email.split('@')[1];
    return COLLEGE_MAP[domain] || 'Admin';
  },

  async findByEmail(email) {
    const snap = await db.collection('users').where('email', '==', email).limit(1).get();
    if (snap.empty) return null;
    const doc = snap.docs[0];
    return { id: doc.id, ...doc.data() };
  },

  async findById(id) {
    const doc = await db.collection('users').doc(id).get();
    if (!doc.exists) return null;
    const data = doc.data();
    // Exclude password from returned data
    const { password: _, ...safeData } = data;
    return { id: doc.id, ...safeData };
  },

  async findByIdWithPassword(id) {
    const doc = await db.collection('users').doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  },

  async create({ full_name, email, password, phone }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const college_name = User.getCollegeName(email);
    const ref = await db.collection('users').add({
      full_name,
      email,
      password: hashedPassword,
      college_name,
      phone: phone || null,
      profile_image: null,
      bio: null,
      is_admin: 0,
      is_banned: 0,
      ban_reason: null,
      reset_token: null,
      reset_token_expiry: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    return ref.id;
  },

  async verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  },

  async updateProfile(id, { full_name, phone, bio, profile_image }) {
    const update = { full_name, phone, bio, updated_at: new Date().toISOString() };
    if (profile_image) update.profile_image = profile_image;
    await db.collection('users').doc(id).update(update);
  },

  async updatePassword(id, newPassword) {
    const hashed = await bcrypt.hash(newPassword, 10);
    await db.collection('users').doc(id).update({
      password: hashed,
      updated_at: new Date().toISOString()
    });
  },

  async setResetToken(email, token, expiry) {
    const snap = await db.collection('users').where('email', '==', email).limit(1).get();
    if (snap.empty) return;
    await snap.docs[0].ref.update({
      reset_token: token || null,
      reset_token_expiry: expiry ? expiry.toISOString() : null
    });
  },

  async findByResetToken(token) {
    const snap = await db.collection('users').where('reset_token', '==', token).limit(1).get();
    if (snap.empty) return null;
    const doc = snap.docs[0];
    const data = doc.data();
    if (data.reset_token_expiry && new Date(data.reset_token_expiry) < new Date()) return null;
    return { id: doc.id, ...data };
  }
};

module.exports = { User, ALLOWED_DOMAINS, COLLEGE_MAP };
