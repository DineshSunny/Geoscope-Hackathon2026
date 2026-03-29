import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBHBuDVBkzxDjT1A1LUpmj6sGumu3VYI6w",
  authDomain: "geoscope-4d307.firebaseapp.com",
  projectId: "geoscope-4d307",
  storageBucket: "geoscope-4d307.firebasestorage.app",
  messagingSenderId: "339709550664",
  appId: "1:339709550664:web:f82c7fb2a03f3e5c88787d"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

document.addEventListener("DOMContentLoaded", async () => {

  // 🔥 REDIRECT IF PAGE REFRESHED
  if (performance.navigation.type === 1) {
    window.location.href = "/index.html";
  }

  const loginBtn = document.getElementById("loginBtn");
  const userInfo = document.getElementById("userInfo");

  // 🔥 FORCE LOGOUT ON LOAD
  try {
    await signOut(auth);
  } catch (e) {}

  // 🔐 LOGIN
  loginBtn.onclick = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      loginBtn.style.display = "none";

      userInfo.innerHTML = `
        <p>Welcome, ${user.displayName}</p>
        <button id="logoutBtn">Logout</button>
      `;

      // 🔓 LOGOUT → GO TO INDEX PAGE
      document.getElementById("logoutBtn").onclick = async () => {
        await signOut(auth);
        window.location.href = "/index.html";
      };

    } catch (error) {
      console.error("Login error:", error);
    }
  };

});