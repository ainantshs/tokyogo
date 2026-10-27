
document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("login-form");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const message = document.getElementById("login-message");
    const togglePassword = document.getElementById("toggle-password");
    const signupLink = document.getElementById("signup-link");
    const loginButton = loginForm.querySelector(".login-button");
    const loginButtonText = loginButton.querySelector("span:first-child");

    // Show or hide password
    togglePassword.addEventListener("click", function () {
        const isPassword = passwordInput.type === "password";

        passwordInput.type = isPassword ? "text" : "password";
        togglePassword.textContent = isPassword ? "Hide" : "Show";

        togglePassword.setAttribute(
            "aria-label",
            isPassword ? "Hide password" : "Show password"
        );

        togglePassword.setAttribute(
            "aria-pressed",
            String(isPassword)
        );
    });

    // Display a message
    function showMessage(text, type) {
        message.textContent = text;
        message.className = "message " + type;
    }

    // Clear the message when the user edits either field
    emailInput.addEventListener("input", function () {
        showMessage("", "");
    });

    passwordInput.addEventListener("input", function () {
        showMessage("", "");
    });

    // Validate the login form
    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        // Check that the email has a valid format
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email)) {
            showMessage(
                "Please enter a valid email address.",
                "error"
            );

            emailInput.focus();
            return;
        }

        // Check password length
        if (password.length < 6) {
            showMessage(
                "Password must be at least 6 characters.",
                "error"
            );

            passwordInput.focus();
            return;
        }

        /*
         * DEMO LOGIN ONLY
         * This validates the form but does not authenticate
         * an actual registered user.
         */

        showMessage(
            "Demo login successful! Redirecting to your itinerary...",
            "success"
        );

        loginButton.disabled = true;
        loginButtonText.textContent = "Please wait...";

        // Redirect to the homepage itinerary
        window.setTimeout(function () {
            window.location.href = "index.html#itinerary";
        }, 1200);
    });

    // Sign-up page is not connected yet
    signupLink.addEventListener("click", function (event) {
        event.preventDefault();

        showMessage(
            "The sign-up page is not available yet.",
            "info"
        );
    });
});
