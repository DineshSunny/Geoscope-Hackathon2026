import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged
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

// 🔥 WAIT FOR PAGE LOAD
document.addEventListener("DOMContentLoaded", () => {

  const loginBtn = document.getElementById("loginBtn");

  if (loginBtn) {
    loginBtn.addEventListener("click", async () => {
      try {
        await signInWithPopup(auth, provider);
      } catch (error) {
        console.error("Login error:", error);
      }
    });
  }

  // AFTER LOGIN
  onAuthStateChanged(auth, (user) => {
    if (user) {
      document.getElementById("userInfo").innerHTML = `
        <p>Welcome, ${user.displayName}</p>
        <button id="enterBtn">Enter App 🚀</button>
      `;

      document.getElementById("enterBtn").onclick = () => {
        window.location.href = "/app.html";
      };
    }
  });

});