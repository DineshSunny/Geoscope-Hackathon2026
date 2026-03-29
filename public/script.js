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
  appId: "1:339709550664:web:f82c7fb2a03f3e5c88787d"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

document.addEventListener("DOMContentLoaded", () => {

  const loginBtn = document.getElementById("loginBtn");
  const userInfo = document.getElementById("userInfo");

  // 🔥 CHECK & LOGOUT ONCE (SAFE)
  onAuthStateChanged(auth, async (user) => {

    if (user) {
      console.log("Existing session found → logging out");

      await signOut(auth); // 🔥 clean reset

      loginBtn.style.display = "block";
      loginBtn.disabled = false;
      loginBtn.innerText = "Sign in with Google";
      userInfo.innerHTML = "";

      return; // stop here after logout
    }

    // 🔐 LOGIN (ONLY AFTER CLEAN STATE)
    loginBtn.onclick = async () => {
      try {
        loginBtn.disabled = true;
        loginBtn.innerText = "Signing in...";

        const result = await signInWithPopup(auth, provider);
        const loggedUser = result.user;

        loginBtn.style.display = "none";

        userInfo.innerHTML = `
          <p>Welcome, ${loggedUser.displayName}</p>
          <button id="logoutBtn">Logout</button>
        `;

        document.getElementById("logoutBtn").onclick = async () => {
          await signOut(auth);
          window.location.href = "/index.html";
        };

      } catch (error) {
        console.error("Login error:", error);

        loginBtn.disabled = false;
        loginBtn.innerText = "Sign in with Google";
      }
    };

  });

});