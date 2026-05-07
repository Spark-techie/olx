const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
require('dotenv').config();

let db;

try {
  if (!getApps().length) {
    // Use service account credentials from environment variables if available
    // Otherwise fall back to application default credentials
    if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_PRIVATE_KEY !== 'your-private-key-here') {
      const serviceAccount = {
        type: 'service_account',
        project_id: process.env.FIREBASE_PROJECT_ID || 'olxx-cc881',
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID || '',
        private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL || '',
        client_id: process.env.FIREBASE_CLIENT_ID || '',
        auth_uri: 'https://accounts.google.com/o/oauth2/auth',
        token_uri: 'https://oauth2.googleapis.com/token',
      };
      initializeApp({ credential: cert(serviceAccount) });
    } else {
      // Use Application Default Credentials (works on Google Cloud / with GOOGLE_APPLICATION_CREDENTIALS env)
      // OR use the Web API key approach
      initializeApp({
        credential: cert({
          projectId: 'olxx-cc881',
          // We'll use the REST API fallback below if this fails
        }),
        projectId: 'olxx-cc881',
      });
    }
  }

  db = getFirestore();
  db.settings({ ignoreUndefinedProperties: true });
  console.log('✅ Firebase Firestore (Admin SDK) connected!');
} catch (err) {
  console.error('❌ Firebase Admin SDK failed:', err.message);
  console.log('⚠️  Falling back to REST API mode...');
  
  // Fallback: Use a simple REST-based Firestore client
  const https = require('https');
  const PROJECT_ID = 'olxx-cc881';
  const API_KEY = 'AIzaSyAhOlcSqVZw8hUQ8XGJ9xA8QUNmF0-wMgI';
  
  // We return a mock db object that uses Firestore REST API
  db = createRestDb(PROJECT_ID, API_KEY);
}

function createRestDb(projectId, apiKey) {
  // Simple Firestore REST wrapper
  const base = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;

  function firestoreRequest(method, path, body) {
    return new Promise((resolve, reject) => {
      const url = `${base}${path}?key=${apiKey}`;
      const opts = { method, headers: { 'Content-Type': 'application/json' } };
      const req = require('https').request(url, opts, res => {
        let data = '';
        res.on('data', c => data += c);
        res.on('end', () => {
          try { resolve(JSON.parse(data)); } catch(e) { resolve({}); }
        });
      });
      req.on('error', reject);
      if (body) req.write(JSON.stringify(body));
      req.end();
    });
  }

  // Convert Firestore REST format to plain JS
  function fromFirestore(fields = {}) {
    const obj = {};
    for (const [k, v] of Object.entries(fields)) {
      if (v.stringValue !== undefined) obj[k] = v.stringValue;
      else if (v.integerValue !== undefined) obj[k] = parseInt(v.integerValue);
      else if (v.doubleValue !== undefined) obj[k] = v.doubleValue;
      else if (v.booleanValue !== undefined) obj[k] = v.booleanValue;
      else if (v.nullValue !== undefined) obj[k] = null;
      else if (v.arrayValue) obj[k] = (v.arrayValue.values || []).map(i => fromFirestore({_: i})._);
      else if (v.mapValue) obj[k] = fromFirestore(v.mapValue.fields || {});
      else obj[k] = null;
    }
    return obj;
  }

  // Convert plain JS to Firestore REST format
  function toFirestore(obj) {
    const fields = {};
    for (const [k, v] of Object.entries(obj)) {
      if (v === null || v === undefined) fields[k] = { nullValue: null };
      else if (typeof v === 'boolean') fields[k] = { booleanValue: v };
      else if (typeof v === 'number') {
        if (Number.isInteger(v)) fields[k] = { integerValue: String(v) };
        else fields[k] = { doubleValue: v };
      }
      else if (typeof v === 'string') fields[k] = { stringValue: v };
      else if (typeof v === 'object') fields[k] = { mapValue: { fields: toFirestore(v) } };
    }
    return fields;
  }

  class RestCollection {
    constructor(col) { this.col = col; }
    
    doc(id) { return new RestDoc(this.col, id); }
    
    async add(data) {
      const result = await firestoreRequest('POST', `/${this.col}`, { fields: toFirestore(data) });
      const id = result.name?.split('/').pop();
      return { id };
    }

    where(field, op, value) { return new RestQuery(this.col, [[field, op, value]]); }
    orderBy() { return new RestQuery(this.col, []); }
    limit(n) { return new RestQuery(this.col, [], n); }
    async get() { return new RestQuery(this.col, []).get(); }
  }

  class RestDoc {
    constructor(col, id) { this.col = col; this.id = id; }
    
    async get() {
      const result = await firestoreRequest('GET', `/${this.col}/${this.id}`);
      if (result.error) return { exists: false, id: this.id, data: () => null };
      const data = fromFirestore(result.fields || {});
      return { exists: true, id: this.id, data: () => data, ref: this };
    }

    async update(data) {
      const existing = await this.get();
      const current = existing.exists ? fromFirestore(existing.fields || {}) : {};
      const merged = { ...current, ...data };
      await firestoreRequest('PATCH', `/${this.col}/${this.id}`, { fields: toFirestore(merged) });
    }

    async delete() {
      await firestoreRequest('DELETE', `/${this.col}/${this.id}`);
    }
  }

  class RestQuery {
    constructor(col, filters, lim) { this.col = col; this.filters = filters || []; this.lim = lim; }
    
    where(field, op, value) { return new RestQuery(this.col, [...this.filters, [field, op, value]], this.lim); }
    orderBy() { return this; }
    limit(n) { return new RestQuery(this.col, this.filters, n); }

    async get() {
      // Use structuredQuery
      const query = {
        structuredQuery: {
          from: [{ collectionId: this.col }],
          limit: this.lim || 1000
        }
      };
      if (this.filters.length) {
        query.structuredQuery.where = this.filters.length === 1
          ? buildFilter(this.filters[0])
          : { compositeFilter: { op: 'AND', filters: this.filters.map(buildFilter) } };
      }

      function buildFilter([field, op, value]) {
        const opMap = { '==': 'EQUAL', '!=': 'NOT_EQUAL', '<': 'LESS_THAN', '<=': 'LESS_THAN_OR_EQUAL', '>': 'GREATER_THAN', '>=': 'GREATER_THAN_OR_EQUAL' };
        let fv;
        if (value === null) fv = { nullValue: null };
        else if (typeof value === 'boolean') fv = { booleanValue: value };
        else if (typeof value === 'number') fv = { integerValue: String(value) };
        else fv = { stringValue: String(value) };
        return { fieldFilter: { field: { fieldPath: field }, op: opMap[op] || 'EQUAL', value: fv } };
      }

      const result = await firestoreRequest('POST', ':runQuery', query);
      const docs = Array.isArray(result) ? result.filter(r => r.document) : [];
      
      return {
        empty: docs.length === 0,
        docs: docs.map(r => {
          const data = fromFirestore(r.document.fields || {});
          const id = r.document.name.split('/').pop();
          return { id, data: () => data, exists: true, ref: new RestDoc(this.col, id) };
        })
      };
    }
  }

  return {
    collection: (name) => new RestCollection(name),
    settings: () => {}
  };
}

module.exports = db;
