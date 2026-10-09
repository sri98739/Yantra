// Yantra authentication layer.
//
// - "firebase" mode: real accounts via Firebase Authentication (email/password, Google, GitHub),
//   used as soon as firebase-config.js contains real keys.
// - "demo" mode: a local stand-in so the whole flow works before Firebase is set up.
//   Accounts live only in this browser's storage (PBKDF2-hashed passwords). Not for production.
//
// Both modes expose the same API, so the pages don't care which one is active.
import { firebaseConfig } from "./firebase-config.js";

const SDK = "https://www.gstatic.com/firebasejs/10.12.2/";
const configured = Boolean(firebaseConfig?.apiKey) && !firebaseConfig.apiKey.startsWith("YOUR_");

const ERRORS = {
  "auth/popup-closed-by-user": null,
  "auth/cancelled-popup-request": null,
  "auth/popup-blocked": "Your browser blocked the sign-in popup. Allow popups for this site and try again.",
  "auth/account-exists-with-different-credential":
    "An account with this email already exists. Sign in with the method you used first.",
  "auth/email-already-in-use": "That email is already registered. Try logging in instead.",
  "auth/invalid-email": "That email address doesn't look right.",
  "auth/invalid-credential": "Incorrect email or password.",
  "auth/wrong-password": "Incorrect email or password.",
  "auth/user-not-found": "Incorrect email or password.",
  "auth/user-disabled": "This account has been disabled. Contact support.",
  "auth/too-many-requests": "Too many failed attempts. Please wait a moment and try again.",
  "auth/weak-password": "Please choose a stronger password (at least 8 characters).",
  "auth/operation-not-allowed": "This sign-in method isn't enabled in Firebase yet (Authentication -> Sign-in method).",
  "auth/unauthorized-domain": "This domain isn't authorized in Firebase (Authentication -> Settings -> Authorized domains).",
  "auth/network-request-failed": "Network error. Check your connection and try again.",
  "auth/invalid-api-key": "The Firebase API key is invalid. Check firebase-config.js.",
  "auth/provider-not-configured": "Google and GitHub sign-in need Firebase. Add your project keys to firebase-config.js.",
  "auth/requires-recent-login": "Please sign in again to continue.",
};

function describeError(err) {
  const code = err?.code;
  if (code in ERRORS) return ERRORS[code];
  return err?.message || "Something went wrong. Please try again.";
}

function authError(code) {
  const e = new Error(ERRORS[code] || code);
  e.code = code;
  return e;
}

export const auth = configured ? await createFirebaseAuth() : createDemoAuth();

// ---------------------------------------------------------------------------
// Firebase
// ---------------------------------------------------------------------------
async function createFirebaseAuth() {
  const { initializeApp } = await import(SDK + "firebase-app.js");
  const fb = await import(SDK + "firebase-auth.js");
  const a = fb.getAuth(initializeApp(firebaseConfig));

  const normalize = u => u && {
    uid: u.uid,
    displayName: u.displayName || "",
    email: u.email || "",
    photoURL: u.photoURL || "",
    emailVerified: u.emailVerified,
    provider: u.providerData?.[0]?.providerId || "password",
    createdAt: u.metadata?.creationTime || null,
    lastLoginAt: u.metadata?.lastSignInTime || null,
  };

  const providers = {
    google() {
      const p = new fb.GoogleAuthProvider();
      p.setCustomParameters({ prompt: "select_account" });
      return p;
    },
    github() {
      const p = new fb.GithubAuthProvider();
      p.addScope("read:user");
      p.addScope("user:email");
      return p;
    },
  };

  const persist = remember =>
    fb.setPersistence(a, remember ? fb.browserLocalPersistence : fb.browserSessionPersistence);

  return {
    mode: "firebase",
    describeError,
    ready: new Promise(resolve => {
      const unsub = fb.onAuthStateChanged(a, u => { unsub(); resolve(normalize(u)); });
    }),
    onChange(cb) {
      return fb.onAuthStateChanged(a, u => cb(normalize(u)));
    },
    async signUpEmail({ name, email, password }) {
      await persist(true);
      const { user } = await fb.createUserWithEmailAndPassword(a, email, password);
      await fb.updateProfile(user, { displayName: name });
      await fb.sendEmailVerification(user).catch(() => {});
      return normalize(user);
    },
    async signInEmail({ email, password, remember = true }) {
      await persist(remember);
      const { user } = await fb.signInWithEmailAndPassword(a, email, password);
      return normalize(user);
    },
    async signInWith(name, { remember = true } = {}) {
      await persist(remember);
      const { user } = await fb.signInWithPopup(a, providers[name]());
      return normalize(user);
    },
    async resetPassword(email) {
      try {
        await fb.sendPasswordResetEmail(a, email);
      } catch (err) {
        // Don't reveal whether an account exists for this email.
        if (err.code !== "auth/user-not-found") throw err;
      }
    },
    async resendVerification() {
      if (a.currentUser) await fb.sendEmailVerification(a.currentUser);
    },
    async refresh() {
      if (!a.currentUser) return null;
      await a.currentUser.reload();
      return normalize(a.currentUser);
    },
    signOut: () => fb.signOut(a),
  };
}

// ---------------------------------------------------------------------------
// Demo (local, browser-only)
// ---------------------------------------------------------------------------
function createDemoAuth() {
  const USERS = "yantra.demo.users";
  const SESSION = "yantra.demo.session";
  const ATTEMPTS = "yantra.demo.attempts";
  const MAX_ATTEMPTS = 5;
  const LOCK_MS = 30_000;
  const listeners = new Set();

  const read = (store, key, fallback) => {
    try { return JSON.parse(store.getItem(key)) ?? fallback; } catch { return fallback; }
  };
  const write = (store, key, value) => {
    try { store.setItem(key, JSON.stringify(value)); } catch {}
  };
  const remove = (store, key) => { try { store.removeItem(key); } catch {} };

  const users = () => read(localStorage, USERS, {});
  const saveUsers = u => write(localStorage, USERS, u);

  const toHex = buf => [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
  async function hash(password, saltHex) {
    const salt = new Uint8Array(saltHex.match(/../g).map(h => parseInt(h, 16)));
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
    const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations: 150_000, hash: "SHA-256" }, key, 256);
    return toHex(bits);
  }

  const normalize = r => r && {
    uid: r.uid,
    displayName: r.name,
    email: r.email,
    photoURL: "",
    emailVerified: true,
    provider: "password",
    createdAt: r.createdAt,
    lastLoginAt: r.lastLoginAt,
  };

  function current() {
    const email = read(sessionStorage, SESSION, null) || read(localStorage, SESSION, null);
    return email ? normalize(users()[email]) : null;
  }
  function startSession(email, remember) {
    remove(localStorage, SESSION);
    remove(sessionStorage, SESSION);
    write(remember ? localStorage : sessionStorage, SESSION, email);
    const u = current();
    listeners.forEach(cb => cb(u));
    return u;
  }

  function checkLock() {
    const a = read(sessionStorage, ATTEMPTS, { count: 0, until: 0 });
    if (a.until > Date.now()) throw authError("auth/too-many-requests");
    return a;
  }
  function recordFailure(a) {
    a.count += 1;
    if (a.count >= MAX_ATTEMPTS) { a.count = 0; a.until = Date.now() + LOCK_MS; }
    write(sessionStorage, ATTEMPTS, a);
  }

  // Mock accounts for testing, created on first load. Demo mode only.
  const MOCK_USERS = [
    { name: "Demo User", email: "demo@yantra.dev", password: "Demo@1234" },
    { name: "Test Admin", email: "admin@yantra.dev", password: "Admin@1234" },
    { name: "QA Tester", email: "tester@yantra.dev", password: "Tester@1234" },
  ];
  const seeded = (async () => {
    const all = users();
    let changed = false;
    for (const m of MOCK_USERS) {
      if (all[m.email]) continue;
      const salt = toHex(crypto.getRandomValues(new Uint8Array(16)));
      const now = new Date().toUTCString();
      all[m.email] = { uid: crypto.randomUUID(), name: m.name, email: m.email, salt, hash: await hash(m.password, salt), createdAt: now, lastLoginAt: now };
      changed = true;
    }
    if (changed) saveUsers(all);
  })();

  // Sign-out in another tab signs this tab out too.
  window.addEventListener("storage", e => {
    if (e.key === SESSION) { const u = current(); listeners.forEach(cb => cb(u)); }
  });

  return {
    mode: "demo",
    describeError,
    ready: Promise.resolve(current()),
    onChange(cb) { listeners.add(cb); return () => listeners.delete(cb); },
    async signUpEmail({ name, email, password }) {
      await seeded;
      email = email.trim().toLowerCase();
      const all = users();
      if (all[email]) throw authError("auth/email-already-in-use");
      if (password.length < 8) throw authError("auth/weak-password");
      const salt = toHex(crypto.getRandomValues(new Uint8Array(16)));
      const now = new Date().toUTCString();
      all[email] = { uid: crypto.randomUUID(), name, email, salt, hash: await hash(password, salt), createdAt: now, lastLoginAt: now };
      saveUsers(all);
      return startSession(email, true);
    },
    async signInEmail({ email, password, remember = true }) {
      const attempts = checkLock();
      await seeded;
      email = email.trim().toLowerCase();
      const all = users();
      const record = all[email];
      const ok = record && (await hash(password, record.salt)) === record.hash;
      if (!ok) {
        recordFailure(attempts);
        throw authError("auth/invalid-credential");
      }
      remove(sessionStorage, ATTEMPTS);
      record.lastLoginAt = new Date().toUTCString();
      saveUsers(all);
      return startSession(email, remember);
    },
    async signInWith() { throw authError("auth/provider-not-configured"); },
    async resetPassword() { /* Demo mode can't send email. */ },
    async resendVerification() {},
    async refresh() { return current(); },
    async signOut() {
      remove(localStorage, SESSION);
      remove(sessionStorage, SESSION);
      listeners.forEach(cb => cb(null));
    },
  };
}
