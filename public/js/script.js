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
  appId: "1:339709550664:web:f82c7fb2a03f3e5c88787d"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// 🔥 Google provider
const provider = new GoogleAuthProvider();
provider.setCustomParameters({
  prompt: "select_account"
});

// 📍 LOCATION FUNCTION (THIS TRIGGERS POPUP)
function requestLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve(position.coords);
      },
      (error) => {
        reject(error);
      }
    );
  });
}

document.addEventListener("DOMContentLoaded", () => {

  const loginBtn = document.getElementById("loginBtn");

  loginBtn.onclick = async () => {
    try {
      loginBtn.disabled = true;
      loginBtn.innerText = "Checking location...";

      // 🔥 STEP 1: ASK LOCATION PERMISSION
      await requestLocation(); // <-- THIS SHOWS "ALLOW LOCATION" POPUP

      loginBtn.innerText = "Signing in...";

      // 🔥 STEP 2: RESET SESSION (clean login)
      try {
        await signOut(auth);
      } catch (e) {}

      // 🔐 STEP 3: GOOGLE LOGIN
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // ✅ SAVE USER
      localStorage.setItem("user", JSON.stringify({
        name: user.displayName,
        email: user.email
      }));

      // 🚀 REDIRECT
      window.location.href = "/app.html";

    } catch (error) {
      console.error("Login error:", error);

      alert("Location access is required to continue");

      loginBtn.disabled = false;
      loginBtn.innerText = "Sign in with Google";
    }
  };

});