# Staging Firebase Project Setup

This document describes how to set up a separate Firebase project for staging/preview environments so that preview deployments (GitHub Actions PRs) use isolated data instead of the production database.

## When to do this

The current approach for PR preview builds is the Firebase Emulator (local only). A staging project is the right next step when:
- Stakeholders need to QA features via preview URLs with persistent, realistic data
- You want preview builds to exercise real Firebase Auth, rules, and database behaviour

## Steps

### 1. Create the staging Firebase project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click **Add project** → name it `stand-up-duck-staging`
3. Enable **Realtime Database** (same region as production)
4. Enable **Authentication** with the same providers as production (Email/Password, etc.)
5. Enable **Storage** if used in previews
6. Copy the web app config — you'll need all values in the next step

### 2. Parameterise the Firebase config

Replace the hardcoded config in [src/utils/firebase.js](../src/utils/firebase.js) with environment variables:

```js
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL:       import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};
```

Create a `.env.local` (git-ignored) for local dev pointing at production or emulators:

```
VITE_FIREBASE_API_KEY=AIzaSyC7vSR3...
VITE_FIREBASE_AUTH_DOMAIN=stand-up-duck.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://stand-up-duck-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=stand-up-duck
VITE_FIREBASE_STORAGE_BUCKET=stand-up-duck.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=428802696640
VITE_FIREBASE_APP_ID=1:428802696640:web:c0fae1651ec9724e16d425
```

### 3. Add GitHub Actions secrets

In the repo → **Settings → Secrets and variables → Actions**, add two sets of secrets:

| Secret name (staging) | Secret name (production) |
|---|---|
| `STAGING_VITE_FIREBASE_API_KEY` | `PROD_VITE_FIREBASE_API_KEY` |
| `STAGING_VITE_FIREBASE_AUTH_DOMAIN` | `PROD_VITE_FIREBASE_AUTH_DOMAIN` |
| `STAGING_VITE_FIREBASE_DATABASE_URL` | `PROD_VITE_FIREBASE_DATABASE_URL` |
| `STAGING_VITE_FIREBASE_PROJECT_ID` | `PROD_VITE_FIREBASE_PROJECT_ID` |
| `STAGING_VITE_FIREBASE_STORAGE_BUCKET` | `PROD_VITE_FIREBASE_STORAGE_BUCKET` |
| `STAGING_VITE_FIREBASE_MESSAGING_SENDER_ID` | `PROD_VITE_FIREBASE_MESSAGING_SENDER_ID` |
| `STAGING_VITE_FIREBASE_APP_ID` | `PROD_VITE_FIREBASE_APP_ID` |
| `FIREBASE_SERVICE_ACCOUNT_STAND_UP_DUCK_STAGING` | _(existing)_ `FIREBASE_SERVICE_ACCOUNT_STAND_UP_DUCK` |

Generate the staging service account key from the Firebase Console → Project settings → Service accounts.

### 4. Update the PR preview workflow

In [.github/workflows/firebase-hosting-pull-request.yml](../.github/workflows/firebase-hosting-pull-request.yml), inject staging env vars into the build step and point the deploy action at the staging project:

```yaml
- name: Build
  env:
    VITE_FIREBASE_API_KEY: ${{ secrets.STAGING_VITE_FIREBASE_API_KEY }}
    VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.STAGING_VITE_FIREBASE_AUTH_DOMAIN }}
    VITE_FIREBASE_DATABASE_URL: ${{ secrets.STAGING_VITE_FIREBASE_DATABASE_URL }}
    VITE_FIREBASE_PROJECT_ID: ${{ secrets.STAGING_VITE_FIREBASE_PROJECT_ID }}
    VITE_FIREBASE_STORAGE_BUCKET: ${{ secrets.STAGING_VITE_FIREBASE_STORAGE_BUCKET }}
    VITE_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.STAGING_VITE_FIREBASE_MESSAGING_SENDER_ID }}
    VITE_FIREBASE_APP_ID: ${{ secrets.STAGING_VITE_FIREBASE_APP_ID }}
  run: npm ci && npm run build

- uses: FirebaseExtended/action-hosting-deploy@v0
  with:
    repoToken: ${{ secrets.GITHUB_TOKEN }}
    firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT_STAND_UP_DUCK_STAGING }}
    projectId: stand-up-duck-staging
```

### 5. Update the merge-to-main workflow

In [.github/workflows/firebase-hosting-merge.yml](../.github/workflows/firebase-hosting-merge.yml), do the same with production secrets so the build is also parameterised (rather than relying on the hardcoded config).

### 6. Copy Firebase rules to the staging project

Run the following to deploy storage rules and any database rules to the staging project:

```sh
firebase use stand-up-duck-staging
firebase deploy --only storage,database
firebase use default  # switch back to prod
```

## Trade-offs

| | Staging project | Emulators (current) |
|---|---|---|
| Preview URLs work for stakeholders | Yes | No (local only) |
| Persistent data between visits | Yes | No (ephemeral) |
| Tests real Firebase rules | Yes | Yes |
| Extra cost | Yes (free tier limits) | No |
| Setup effort | High | Low (already done) |
