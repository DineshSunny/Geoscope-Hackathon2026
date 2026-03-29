import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBHBuDVBkzxDjT1A1LUpmj6sGumu3VYI6w",
  authDomain: "geoscope-4d307.firebaseapp.com",
  projectId: "geoscope-4d307",
  appId: "1:339709550664:web:f82c7fb2a03f3e5c88787d"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// 🔥 GOOGLE PROVIDER
const provider = new GoogleAuthProvider();

// 🔥 FORCE ACCOUNT SELECTION EVERY TIME
provider.setCustomParameters({
  prompt: "select_account"
});

document.addEventListener("DOMContentLoaded", () => {

  const loginBtn = document.getElementById("loginBtn");

  loginBtn.onclick = async () => {
    try {
      loginBtn.disabled = true;
      loginBtn.innerText = "Signing in...";

      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // ✅ Save user locally
      localStorage.setItem("user", JSON.stringify({
        name: user.displayName,
        email: user.email
      }));

      // 🚀 Redirect
      window.location.href = "/app.html";

    } catch (error) {
      console.error("Login error:", error);

      loginBtn.disabled = false;
      loginBtn.innerText = "Sign in with Google";
    }
  };

});