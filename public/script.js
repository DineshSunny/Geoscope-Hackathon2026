import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
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

document.addEventListener("DOMContentLoaded", () => {

  const loginBtn = document.getElementById("loginBtn");
  const userInfo = document.getElementById("userInfo");

  // 🔐 LOGIN
  if (loginBtn) {
    loginBtn.onclick = async () => {
      try {
        await signInWithPopup(auth, provider);
      } catch (error) {
        console.error("Login error:", error);
      }
    };
  }

  // 🔄 AUTH STATE LISTENER
  onAuthStateChanged(auth, (user) => {

    if (user) {
      console.log("User logged in:", user.displayName);

      // 🔥 Hide login button
      if (loginBtn) loginBtn.style.display = "none";

      // Show user UI
      userInfo.innerHTML = `
        <p>Welcome, ${user.displayName}</p>
        <button id="enterBtn">Enter App 🚀</button>
        <button id="logoutBtn">Logout</button>
      `;

      // Enter App
      document.getElementById("enterBtn").onclick = () => {
        window.location.href = "/app.html";
      };

      // Logout
      document.getElementById("logoutBtn").onclick = () => {
        signOut(auth).then(() => {
          console.log("Logged out");
          location.reload();
        });
      };

    } else {
      console.log("No user logged in");

      // 🔥 Show login button again
      if (loginBtn) loginBtn.style.display = "block";

      userInfo.innerHTML = "";
    }

  });

});