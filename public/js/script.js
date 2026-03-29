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

  // 🔥 CLEAN STATE CHECK
  onAuthStateChanged(auth, async (user) => {

    if (user) {
      console.log("Existing session found → logging out");

      await signOut(auth); // reset session
      return;
    }

    // 🔐 LOGIN HANDLER
    loginBtn.onclick = async () => {
      try {
        loginBtn.disabled = true;
        loginBtn.innerText = "Signing in...";

        const result = await signInWithPopup(auth, provider);
        const loggedUser = result.user;

        // ✅ SAVE USER
        localStorage.setItem("user", JSON.stringify({
          name: loggedUser.displayName,
          email: loggedUser.email
        }));

        // 🚀 REDIRECT TO APP
        window.location.href = "/app.html";

      } catch (error) {
        console.error("Login error:", error);

        loginBtn.disabled = false;
        loginBtn.innerText = "Sign in with Google";
      }
    };

  });

});