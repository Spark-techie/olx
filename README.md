# 🎓 Campus OLX — Firebase + GitHub Edition

A college-only buy & sell marketplace built with **Node.js + Express + Firebase Firestore**.

---

## 🔥 Firebase Setup

### Step 1 — Create a Firebase Project
1. Go to [https://console.firebase.google.com](https://console.firebase.google.com)
2. Click **"Add project"** → name it `campus-olx`
3. Disable Google Analytics (optional) → **Create project**

### Step 2 — Enable Firestore
1. In the Firebase Console sidebar → **Firestore Database**
2. Click **"Create database"**
3. Choose **"Start in production mode"** → select a region → **Done**

### Step 3 — Get Service Account Key
1. Go to **Project Settings** (gear icon) → **Service accounts** tab
2. Click **"Generate new private key"** → **Generate key**
3. A JSON file downloads — **keep it secret!**
4. Copy the values into your `.env`:

```
FIREBASE_PROJECT_ID=       # "project_id" in JSON
FIREBASE_PRIVATE_KEY_ID=   # "private_key_id" in JSON
FIREBASE_PRIVATE_KEY=      # "private_key" in JSON (keep the \n characters)
FIREBASE_CLIENT_EMAIL=     # "client_email" in JSON
FIREBASE_CLIENT_ID=        # "client_id" in JSON
```

### Step 4 — Set Firestore Security Rules
In Firestore → **Rules** tab, paste:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false; // Server-side only via Admin SDK
    }
  }
}
```

---

## 🚀 GitHub Hosting Setup

### Step 1 — Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit - Firebase edition"
git remote add origin https://github.com/YOUR_USERNAME/campus-olx.git
git push -u origin main
```

### Step 2 — Deploy on Render (Free)
1. Go to [https://render.com](https://render.com) → Sign up with GitHub
2. Click **"New"** → **"Web Service"**
3. Connect your `campus-olx` GitHub repo
4. Settings:
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Under **Environment Variables**, add all your `.env` values:
   - `FIREBASE_PROJECT_ID`, `FIREBASE_PRIVATE_KEY`, etc.
   - `SESSION_SECRET`, `APP_URL` (set to your Render URL)
6. Click **Deploy**!

### Step 3 — Auto-Deploy with GitHub Actions
1. In Render: **Settings** → **Deploy Hook** → copy the URL
2. In GitHub: **Settings** → **Secrets and variables** → **Actions**
3. Add secret: `RENDER_DEPLOY_HOOK_URL` = the URL you copied
4. Now every `git push` to `main` auto-deploys! ✅

---

## 💻 Local Development

```bash
# Install dependencies
npm install

# Copy env template and fill in Firebase credentials
cp .env.example .env

# Run the server
npm run dev
```

Visit: `http://localhost:3000`
Admin: `http://localhost:3000/admin/dashboard`

---

## 📁 Project Structure

```
campus-olx/
├── .github/workflows/deploy.yml  # Auto-deploy to Render
├── config/
│   ├── db.js          # Firebase Admin SDK connection
│   └── multer.js      # File upload config
├── controllers/       # Route handlers
├── middleware/        # Auth, upload middleware
├── models/            # Firestore data models
│   ├── User.js
│   ├── Product.js
│   ├── Message.js
│   └── Admin.js
├── routes/            # Express routes
├── views/             # EJS templates
├── public/            # CSS, JS, images
├── .env               # Firebase credentials (never commit!)
├── .gitignore
└── server.js
```

---

## 🗄️ Firestore Collections

| Collection   | Description                  |
|-------------|------------------------------|
| `users`     | Student accounts             |
| `products`  | Product listings             |
| `favorites` | User favorites               |
| `messages`  | In-app messaging             |
| `reports`   | Product reports              |
| `categories`| Admin-managed categories     |

---

## ⚠️ Important Notes

- **Never commit `.env`** — it's in `.gitignore`
- Uploaded images are stored locally in `/uploads/` — for production, consider **Firebase Storage** or **Cloudinary**
- The app uses **Firebase Admin SDK** (server-side), not the client SDK
