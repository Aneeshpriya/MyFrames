const signupForm = document.querySelector("#signupForm");

const nameInput = document.querySelector("#name");
const emailInput = document.querySelector("#email");
const phoneInput = document.querySelector("#phone");
const passwordInput = document.querySelector("#password");
const confirmPasswordInput = document.querySelector("#confirmPassword");
const termsInput = document.querySelector("#terms");

const togglePassword = document.querySelector("#togglePassword");
const toggleConfirmPassword = document.querySelector("#toggleConfirmPassword");
const resetConfirmPassword = document.querySelector("#resetConfirmPassword");

console.log("Signup JS connected successfully");


// ==========================================
// PASSWORD SHOW / HIDE
// ==========================================

if (togglePassword && passwordInput) {
  togglePassword.type = "button";

  togglePassword.addEventListener("click", (event) => {
    event.preventDefault();

    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      togglePassword.setAttribute("aria-label", "Hide password");
    } else {
      passwordInput.type = "password";
      togglePassword.setAttribute("aria-label", "Show password");
    }
  });
}


// ==========================================
// CONFIRM PASSWORD SHOW / HIDE
// ==========================================

if (toggleConfirmPassword && confirmPasswordInput) {
  toggleConfirmPassword.type = "button";

  toggleConfirmPassword.addEventListener("click", (event) => {
    event.preventDefault();

    if (confirmPasswordInput.type === "password") {
      confirmPasswordInput.type = "text";
      toggleConfirmPassword.setAttribute(
        "aria-label",
        "Hide confirm password"
      );
    } else {
      confirmPasswordInput.type = "password";
      toggleConfirmPassword.setAttribute(
        "aria-label",
        "Show confirm password"
      );
    }
  });
}


// ==========================================
// CLEAR CONFIRM PASSWORD
// ==========================================

if (resetConfirmPassword && confirmPasswordInput) {
  resetConfirmPassword.type = "button";

  resetConfirmPassword.addEventListener("click", (event) => {
    event.preventDefault();

    confirmPasswordInput.value = "";
    confirmPasswordInput.focus();
  });
}


// ==========================================
// SIGNUP FORM SUBMISSION
// ==========================================

if (signupForm) {
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const phone = phoneInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;


    // ==========================================
    // NAME VALIDATION
    // ==========================================

    if (!name) {
      alert("Please enter your full name.");
      nameInput.focus();
      return;
    }


    // ==========================================
    // EMAIL VALIDATION
    // ==========================================

    if (!email) {
      alert("Please enter your email address.");
      emailInput.focus();
      return;
    }

    if (!emailInput.checkValidity()) {
      alert("Please enter a valid email address.");
      emailInput.focus();
      return;
    }


    // ==========================================
    // PHONE VALIDATION
    // ==========================================

    if (!phone) {
      alert("Please enter your phone number.");
      phoneInput.focus();
      return;
    }

    const phoneRegex = /^[6-9]\d{9}$/;

    if (!phoneRegex.test(phone)) {
      alert("Please enter a valid 10-digit Indian mobile number.");
      phoneInput.focus();
      return;
    }


    // ==========================================
    // PASSWORD VALIDATION
    // ==========================================

    if (!password) {
      alert("Please enter your password.");
      passwordInput.focus();
      return;
    }

    if (password.length < 6) {
      alert("Password must contain at least 6 characters.");
      passwordInput.focus();
      return;
    }

    if (!/[A-Z]/.test(password)) {
      alert("Password must contain at least one uppercase letter.");
      passwordInput.focus();
      return;
    }

    if (!/[a-z]/.test(password)) {
      alert("Password must contain at least one lowercase letter.");
      passwordInput.focus();
      return;
    }

    if (!/[0-9]/.test(password)) {
      alert("Password must contain at least one number.");
      passwordInput.focus();
      return;
    }

    if (!/[!@#$%^&*(),.?":{}|<>_\-+=;`~'[\]\\/]/.test(password)) {
      alert("Password must contain at least one special character.");
      passwordInput.focus();
      return;
    }


    // ==========================================
    // CONFIRM PASSWORD VALIDATION
    // ==========================================

    if (!confirmPassword) {
      alert("Please confirm your password.");
      confirmPasswordInput.focus();
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      confirmPasswordInput.focus();
      return;
    }


    // ==========================================
    // TERMS VALIDATION
    // ==========================================

    if (!termsInput.checked) {
      alert("Please agree to the Terms of Service and Privacy Policy.");
      termsInput.focus();
      return;
    }


    // ==========================================
    // SIGNUP API
    // ==========================================

    try {
      const response = await fetch("/api/users/signup", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          name,
          email,
          phone,
          password,
        }),
      });


      const data = await response.json();


      if (!response.ok) {
        alert(
          data.message ||
          "Signup failed. Please try again."
        );

        return;
      }


      // Save email for OTP verification
      if (data.user && data.user.email) {
        localStorage.setItem(
          "verificationEmail",
          data.user.email
        );
      } else {
        localStorage.setItem(
          "verificationEmail",
          email
        );
      }


      alert(
        "Account created successfully! Please verify your email."
      );


      window.location.href = "/otpverification";


    } catch (error) {
      console.error("Signup error:", error);

      alert(
        "Unable to connect to the server. Please try again."
      );
    }
  });
}