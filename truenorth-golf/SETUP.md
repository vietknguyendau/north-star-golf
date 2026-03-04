# North Star Amateur Series — Setup Guide

## What this is
A live golf tournament leaderboard app. Players register via join code,
enter scores from their phones, and the leaderboard updates in real time
for everyone. Built with React + Firebase Firestore.

---

## Step 1 — Create a Firebase Project (5 min, free)

1. Go to https://console.firebase.google.com
2. Click **"Add project"** → name it `north-star-golf` → click Continue
3. Disable Google Analytics (optional) → click **Create project**
4. Once created, click the **</>** (Web) icon to register a web app
5. Name it `north-star-golf` → click **Register app**
6. You'll see a `firebaseConfig` object — **copy it**
7. Open `src/firebase.js` and paste your values in place of the placeholders

```js
const firebaseConfig = {
  apiKey:            "YOUR_KEY",
  authDomain:        "YOUR_DOMAIN",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId:             "YOUR_APP_ID",
};
```

8. In the Firebase console left sidebar → **Build → Firestore Database**
9. Click **Create database** → **Start in test mode** → choose a region → **Done**

---

## Step 2 — Run locally (optional, to test)

```bash
cd north-star-golf
npm install
npm start
```

Opens at http://localhost:3000

---

## Step 3 — Deploy to Vercel (5 min, free)

1. Go to https://vercel.com → sign up with GitHub
2. Push this folder to a GitHub repo:
   ```bash
   git init
   git add .
   git commit -m "North Star Amateur Series"
   gh repo create north-star-golf --public --push
   ```
3. In Vercel → **Add New Project** → import your GitHub repo
4. Framework: **Create React App** (auto-detected)
5. Click **Deploy** → done ✅

You'll get a URL like: `https://north-star-golf.vercel.app`

---

## Step 4 — Custom Domain (optional, ~$12/yr)

1. Buy a domain at Namecheap or Google Domains (e.g. `truenorthgolf.app`)
2. In Vercel → your project → **Settings → Domains** → add your domain
3. Follow DNS instructions — usually live within 10 min

---

## Customizing before tournament day

| What to change | Where |
|---|---|
| Join code | `src/App.jsx` line: `const JOIN_CODE = "NORTHSTAR24"` |
| Admin PIN | `src/App.jsx` line: `const ADMIN_PIN = "1234"` |
| Course name/par/yards | Admin tab in the app (no code needed) |
| Tournament ID (new season) | `src/App.jsx` line: `const TOURNAMENT_ID = "tournament-2024"` |

---

## Tournament day workflow

1. **Commissioner**: Open the app → Admin tab → enter PIN → confirm course details
2. **Share the URL** and join code `NORTHSTAR24` with all players
3. **Players**: Open URL on phone → Register tab → enter join code + details
4. **During the round**: Each player taps "My Scores" → selects their name → enters hole-by-hole
5. **Leaderboard**: Updates live for everyone automatically

---

## Firestore security (before going public)

Change Firestore rules from test mode to this in Firebase console:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /tournaments/{tid}/players/{pid} {
      allow read: if true;
      allow write: if true; // players can write their own scores
    }
    match /tournaments/{tid}/settings/{doc} {
      allow read: if true;
      allow write: if true; // tighten this if needed
    }
  }
}
```

For a private league, you can add Firebase Authentication later.
