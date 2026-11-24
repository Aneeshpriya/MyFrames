
const loginForm = document.querySelector("main form");
const passwordInput = document.querySelector("#password");
const togglePassword = document.querySelector("#togglePassword");
const emailInput = document.querySelector("#email");

console.log("Login JS connected successfully");

// =====================================
// Check Existing Login Session
// =====================================

async function checkLoginSession() {
  try {
    const response = await fetch("/api/users/check-session", {
      method: "GET",
      credentials: "same-origin",
      cache: "no-store"
    });

    const data = await response.json();

    if (response.ok && data.loggedIn) {
      window.location.replace("/profile");
    }
  } catch (error) {
    console.error("Session check error:", error);
  }
}

// Check when login page opens or browser Back restores it
window.addEventListener("pageshow", checkLoginSession);

// =====================================
// Normal Email and Password Login
// =====================================

if (loginForm) {
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email) {
      alert("Please enter your email.");
      emailInput.focus();
      return;
    }

    if (!emailInput.checkValidity()) {
      alert("Please enter a valid email address.");
      emailInput.focus();
      return;
    }

    if (!password) {
      alert("Please enter your password.");
      passwordInput.focus();
      return;
    }

    try {
      const response = await fetch("/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        cache: "no-store",
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Login failed. Please try again.");
        return;
      }

      console.log("Logged in user:", data.user);

      // Redirect after successful login
      window.location.replace("/profile");

    } catch (error) {
      console.error("Login error:", error);
      alert("Unable to connect to the server.");
    }
  });
}

// =====================================
// Show / Hide Password
// =====================================

if (togglePassword && passwordInput) {
  togglePassword.addEventListener("click", () => {
    passwordInput.type =
      passwordInput.type === "password" ? "text" : "password";
  });
}
