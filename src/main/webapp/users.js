/* Profile page */
// USER DATA
let user = JSON.parse(localStorage.getItem("user") || "null") || {
    name: "Aiman Hakim",
    email: "aiman@example.com",
    password: "mypassword123"
};


// ELEMENTS

const nameEl = document.getElementById("name");
const emailEl = document.getElementById("email");
const pwEl = document.getElementById("password");

const editName = document.getElementById("editName");
const editPassword = document.getElementById("editPassword");

const editBtn = document.getElementById("editBtn");
const saveBtn = document.getElementById("saveBtn");
const cancelBtn = document.getElementById("cancelBtn");

const saveActions = document.getElementById("saveActions");
const profileActions = document.querySelector(".profile-actions");

const passwordSection = document.getElementById("passwordSection");

const editOverlay = document.getElementById("editOverlay");
const overlay = document.getElementById("overlay");

let showPw = false;


// DISPLAY PROFILE

function displayProfile() {

    nameEl.textContent = user.name;
    emailEl.textContent = user.email;

    document.getElementById("bannerName").textContent = user.name;

    renderPw();

}


// SHOW / HIDE PASSWORD

function renderPw() {

    pwEl.textContent = showPw
        ? user.password
        : "•".repeat(Math.max(user.password.length, 8));

    document.getElementById("togglePw").textContent =
        showPw ? "Hide" : "Show";

}

document.getElementById("togglePw").addEventListener("click", () => {

    showPw = !showPw;
    renderPw();

});


// EDIT PROFILE CONFIRMATION

editBtn.addEventListener("click", () => {

    editOverlay.classList.add("show");

});


// CANCEL EDIT CONFIRMATION

document.getElementById("cancelEdit").addEventListener("click", () => {

    editOverlay.classList.remove("show");

});


// CONFIRM EDIT

document.getElementById("confirmEdit").addEventListener("click", () => {

    editOverlay.classList.remove("show");

    startEditProfile();

});


// START EDIT PROFILE

function startEditProfile() {

    // Put current information into input fields (email is not editable)
    editName.value = user.name;
    editPassword.value = user.password;
	editPassword.type = "text";

    // Hide original profile details (email stays visible)
    nameEl.classList.add("hidden");
    passwordSection.classList.add("hidden");

    // Show editable input fields
    editName.classList.remove("hidden");
    editPassword.classList.remove("hidden");

    // Hide Remove Account and Edit Profile buttons
    profileActions.classList.add("hidden");

    // Show Save Changes and Cancel buttons
    saveActions.classList.remove("hidden");

}


// SAVE CHANGES
saveBtn.addEventListener("click", () => {

    const newName = editName.value.trim();
    const newPassword = editPassword.value;

    // Check empty fields
    if (newName === "" || newPassword === "") {
        Swal.fire({
            title: "Oops!",
            text: "Please fill in all fields.",
            icon: "warning",
            confirmButtonColor: "#F28C28",
            background: "#0B1F3A",
            color: "#FFFFFF",
            iconColor: "#F28C28"
        });
        return;
    }

    // Update user information (email is unchanged)
    user.name = newName;
    user.password = newPassword;

    // Save information in localStorage
    localStorage.setItem("user", JSON.stringify(user));

    // Update profile display
    displayProfile();

    // Return to main profile
    exitEditMode();

    // Success popup
    Swal.fire({
        title: "Profile Updated!",
        text: "Your profile has been updated successfully.",
        icon: "success",
        confirmButtonText: "OK",
        confirmButtonColor: "#F28C28",
        background: "#0B1F3A",
        color: "#FFFFFF",
        iconColor: "#F28C28",
        customClass: {
            popup: "navy-popup",
            confirmButton: "orange-button"
        }
    });

});


// CANCEL EDIT

cancelBtn.addEventListener("click", () => {

    // Discard unsaved changes (localStorage is not updated)
    displayProfile();
    exitEditMode();

});


// EXIT EDIT MODE

function exitEditMode() {

    // Show original profile details
    nameEl.classList.remove("hidden");
    passwordSection.classList.remove("hidden");

    // Hide editable input fields
    editName.classList.add("hidden");
    editPassword.classList.add("hidden");
	editPassword.type = "password";   // hide it again

    // Hide Save Changes and Cancel buttons
    saveActions.classList.add("hidden");

    // Show Remove Account and Edit Profile buttons
    profileActions.classList.remove("hidden");

}


// INITIAL DISPLAY

displayProfile();


// DELETE ACCOUNT MODAL

document.getElementById("openDelete").addEventListener("click", () => {

    overlay.classList.add("show");

});

document.getElementById("cancelDelete").addEventListener("click", () => {

    overlay.classList.remove("show");

});

overlay.addEventListener("click", (e) => {

    if (e.target === overlay) {

        overlay.classList.remove("show");

    }

});

document.getElementById("confirmDelete").addEventListener("click", () => {

    localStorage.removeItem("user");

    window.location.href = "index.html";

});


// HAMBURGER MENU

const menuBtn = document.getElementById("menuBtn");
const navLinks = document.getElementById("navLinks");

menuBtn.addEventListener("click", () => {

    navLinks.classList.toggle("open");

});