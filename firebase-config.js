// Firebase project settings for Yantra sign-in.
//
// Setup (one time):
//  1. Go to https://console.firebase.google.com -> Add project.
//  2. Project settings -> General -> "Your apps" -> add a Web app (</>), then copy
//     the firebaseConfig values it shows into the object below.
//  3. Build -> Authentication -> Get started -> Sign-in method, and enable:
//       - Email/Password
//       - Google
//       - GitHub: create an OAuth app at https://github.com/settings/developers
//         ("New OAuth App"). Use the callback URL that Firebase shows you
//         (https://<project-id>.firebaseapp.com/__/auth/handler), then paste the
//         GitHub Client ID and Client Secret back into Firebase.
//  4. Authentication -> Settings -> Authorized domains: "localhost" is listed by
//     default. Add your real domain here when you deploy.
//  5. Run the page through the local server (node server.js), not by double-clicking
//     the file. Sign-in popups don't work on file:// pages.

export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};
