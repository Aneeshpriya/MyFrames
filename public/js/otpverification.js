
const otpInputs = document.querySelectorAll(".otp-input");
const otpForm = document.querySelector("#otp-form");

const errorAlert = document.querySelector("#alert-error");
const successAlert = document.querySelector("#alert-success");

const countdownTimer = document.querySelector("#countdown-timer");
const resendBtn = document.querySelector("#resend-btn");

console.log("OTP verification JS connected");

// Identify OTP purpose
const params = new URLSearchParams(window.location.search);
const purpose = params.get("purpose") || "signup";

const isResetPurpose = purpose === "reset";

// Select email storage
const emailStorageKey = isResetPurpose
  ? "resetVerificationEmail"
  : "verificationEmail";

const verificationEmail = localStorage.getItem(emailStorageKey);

// Select API endpoints
const verifyEndpoint = isResetPurpose
  ? "/api/users/verify-reset-otp"
  : "/api/users/verify-otp";

const resendEndpoint = isResetPurpose
  ? "/api/users/resend-reset-otp"
  : "/api/users/resend-otp";

// Countdown duration
const OTP_DURATION = 1 * 60;
// Check required elements
if (
  !otpForm ||
  !errorAlert ||
  !successAlert ||
  !countdownTimer ||
  !resendBtn ||
  otpInputs.length !== 6
) {
  console.error("OTP page elements are missing.");
} else if (!verificationEmail) {

  alert("Email not found. Please try again.");

  window.location.href = isResetPurpose
    ? "/forgot-password"
    : "/signup";

} else {

  // Display email
  const emailContainer = document.querySelector("#verification-email");

  if (emailContainer) {
    emailContainer.textContent = verificationEmail;
  }

  // Hide alerts initially
  errorAlert.style.display = "none";
  successAlert.style.display = "none";

  // Show error message
  function showError(title, message) {
    errorAlert.style.display = "flex";
    successAlert.style.display = "none";

    const titleElement = errorAlert.querySelector(".font-bold");
    const messageElement = errorAlert.querySelector(".text-red-700");

    if (titleElement) {
      titleElement.textContent = title;
    }

    if (messageElement) {
      messageElement.textContent = message;
    }
  }

  // Show success message
  function showSuccess(message) {
    errorAlert.style.display = "none";
    successAlert.style.display = "flex";

    const messageElement = successAlert.querySelector(".font-semibold");

    if (messageElement) {
      messageElement.textContent = message;
    }
  }

  // OTP INPUT NAVIGATION
  otpInputs.forEach((input, index) => {

    input.addEventListener("input", (event) => {

      event.target.value = event.target.value
        .replace(/\D/g, "")
        .slice(0, 1);

      if (event.target.value && index < otpInputs.length - 1) {
        otpInputs[index + 1].focus();
      }

    });

    input.addEventListener("keydown", (event) => {

      if (
        event.key === "Backspace" &&
        !input.value &&
        index > 0
      ) {
        otpInputs[index - 1].focus();
      }

    });

    // Paste six-digit OTP
    input.addEventListener("paste", (event) => {

      event.preventDefault();

      const pastedOTP = event.clipboardData
        .getData("text")
        .replace(/\D/g, "")
        .slice(0, 6);

      pastedOTP.split("").forEach((digit, digitIndex) => {

        if (otpInputs[digitIndex]) {
          otpInputs[digitIndex].value = digit;
        }

      });

      otpInputs[Math.min(pastedOTP.length, otpInputs.length - 1)].focus();

    });

  });

  // OTP COUNTDOWN TIMER
  let countdownSeconds = OTP_DURATION;
  let countdownInterval;

  function updateCountdownDisplay() {

    const minutes = Math.floor(countdownSeconds / 60);
    const seconds = countdownSeconds % 60;

    countdownTimer.textContent =
      `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  }

  function startCountdown() {

    clearInterval(countdownInterval);

    countdownSeconds = OTP_DURATION;

    resendBtn.disabled = true;
    resendBtn.classList.add("opacity-50", "cursor-not-allowed");

    updateCountdownDisplay();

    countdownInterval = setInterval(() => {

      countdownSeconds--;

      updateCountdownDisplay();

      if (countdownSeconds <= 0) {

        clearInterval(countdownInterval);

        countdownTimer.textContent = "00:00";

        resendBtn.disabled = false;
        resendBtn.classList.remove("opacity-50", "cursor-not-allowed");

      }

    }, 1000);

  }

  // Start timer
  startCountdown();

  // VERIFY OTP
  otpForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    let otp = "";

    otpInputs.forEach((input) => {
      otp += input.value.trim();
    });

    if (otp.length !== 6) {

      showError(
        "Invalid OTP",
        "Please enter the complete 6-digit OTP."
      );

      return;
    }

    const verifyButton = document.querySelector("#verify-submit-button");

    if (verifyButton) {
      verifyButton.disabled = true;
    }

    try {

      const response = await fetch(verifyEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: verificationEmail,
          otp: otp,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.success === false) {

        showError(
          "Verification Failed",
          data.message || "Invalid or expired OTP."
        );

        if (verifyButton) {
          verifyButton.disabled = false;
        }

        return;
      }

      showSuccess(
        isResetPurpose
          ? "OTP verified successfully!"
          : "Email verified successfully!"
      );

      clearInterval(countdownInterval);

      // Remove only the email key used for this flow
      localStorage.removeItem(emailStorageKey);

      setTimeout(() => {

        window.location.href = isResetPurpose
          ? "/reset-password"
          : "/login";

      }, 1200);

    } catch (error) {

      console.error("OTP verification error:", error);

      showError(
        "Connection Error",
        "Unable to connect to the server. Please try again."
      );

      if (verifyButton) {
        verifyButton.disabled = false;
      }

    }

  });

  // RESEND OTP
  resendBtn.addEventListener("click", async () => {

    if (resendBtn.disabled) {
      return;
    }

    resendBtn.disabled = true;
    resendBtn.classList.add("opacity-50", "cursor-not-allowed");

    try {

      const response = await fetch(resendEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: verificationEmail,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.success === false) {

        showError(
          "Resend Failed",
          data.message || "Unable to resend OTP. Please try again."
        );

        resendBtn.disabled = false;
        resendBtn.classList.remove("opacity-50", "cursor-not-allowed");

        return;
      }

      showSuccess("New OTP sent successfully!");

      // Clear previous OTP inputs
      otpInputs.forEach((input) => {
        input.value = "";
      });

      otpInputs[0].focus();

      // Restart countdown
      startCountdown();

      console.log("OTP resent successfully");

    } catch (error) {

      console.error("Resend OTP error:", error);

      showError(
        "Connection Error",
        "Unable to connect to the server. Please try again."
      );

      resendBtn.disabled = false;
      resendBtn.classList.remove("opacity-50", "cursor-not-allowed");

    }

  });

}
