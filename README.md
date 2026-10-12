# Study Group Finder (Anvil Research Milestone)

A small cross-platform app built with **Expo (React Native)** and **Firebase Cloud Firestore**, the stack my team (Anvil) is evaluating for our project.

Students can:

- **Host a study session**: name, course code, campus location, start time, and seat limit.
- **Join a session** by entering their name. The app tracks seats left and blocks joining a full session or joining twice under the same name.
- **Filter sessions by course** and see the total number of open seats.

Sessions sync live across every device through Firestore (`onSnapshot`). Joining uses a Firestore **transaction**, so two people can't take the last seat at the same moment. If Firebase isn't configured, the app falls back to an in-memory store, so it still runs for a quick demo.

## Running it

Requires Node.js 20+ and npm.

```bash
npm install
npx expo start        # then press w (web), a (Android), or scan the QR code with Expo Go
```

### Connecting Firestore

1. Create a project in the [Firebase console](https://console.firebase.google.com/), add a **Web app**, and create a **Cloud Firestore** database (test mode is fine for development).
2. Copy `.env.example` to `.env` and fill in the values from the Firebase web app config.
3. Restart `npx expo start`. Expo inlines `EXPO_PUBLIC_*` variables at build time, so changes need a restart.

`.env` is gitignored. Firebase web keys aren't secret (Firestore security rules are what protect the data), but keeping them out of the repo lets each teammate use their own project.

## Project layout

```
App.js                       screen: subscribes to sessions, filtering, status messages
src/firebase.js              Firebase init from EXPO_PUBLIC_* env vars
src/sessionStore.js          Firestore store + in-memory fallback (same interface)
src/validation.js            input validation and formatting helpers
src/components/SessionForm.js
src/components/SessionCard.js
src/theme.js
```

## What I learned

**Expo / React Native**
- `create-expo-app --template blank` gives a minimal JS project. Expo Go runs it on a phone without Xcode or Android Studio, and `react-native-web` lets the same code run in a browser.
- Use `npx expo install <pkg>` instead of `npm install <pkg>`. It picks the version that matches the Expo SDK (here SDK 57), which prevents most "works on my machine" errors.
- React Native has no HTML: `View`, `Text`, `TextInput`, `Pressable`, and `StyleSheet` (a flexbox-only subset of CSS).
- `Alert.alert` does nothing on web, so I show errors inline instead.
- Expo SDK upgrades often include breaking changes. Always read the versioned docs.

**Firebase / Firestore**
- Pros: no backend server to write or deploy, real-time listeners, generous free tier, and auth available when we need it.
- Cons: a NoSQL document model (no joins), vendor lock-in, and security rules that must be written carefully before launch.
- Transactions are needed for read-then-write logic like seat limits.

**npm**
- `package.json` declares version ranges; `package-lock.json` pins the exact tree. Commit the lockfile and use `npm ci` for reproducible installs.
- `~57.0.27` allows patch updates only; `^13.0.0` allows minor updates.

## Alternatives considered

| Option | Why not (for this project) |
|--------|----------------------------|
| Native Swift / Kotlin | Two separate codebases to write and maintain. |
| Flutter | Mature and fast, but requires learning Dart instead of reusing React/JavaScript. |
| React + Express + MongoDB web app | We'd have to build and host our own API; mobile features like the camera and location are harder. |
| Supabase instead of Firebase | Postgres and SQL are appealing, but Firebase has more Expo examples and needs less setup to get started. |
