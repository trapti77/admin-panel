# 🛠️ Admin Panel Backend

## 📌 Overview

This project is a **backend system for an Admin Panel**, built using **Node.js, Express.js, and MongoDB**.
It provides secure user management features including authentication, profile updates, and account handling.

---

## 🎯 Purpose

* Build a **secure backend system**
* Implement **authentication & user management**
* Practice **real-world backend architecture**

---

## ⚙️ Tech Stack

* Node.js
* Express.js
* MongoDB
* JWT Authentication

---

## ✨ Features

### 🔐 Authentication

* User Registration
* User Login
* Logout functionality
* Refresh Access Token

### 👤 User Management

* Update Account Details
* Change Password
* Update User Avatar
* Update Cover Image

### 🛡️ Security

* JWT-based authentication
* Middleware-based route protection

---

## 🧩 API Controllers

* `registerUser`
* `loginUser`
* `logoutUser`
* `refreshAccessToken`
* `changeCurrentPassword`
* `updateAccountDetails`
* `updateUserAvatar`
* `updateUserCoverImage`

---

## 🏗️ Project Structure

```id="d5h4zq"
src/
│── controllers/
│── routes/
│── models/
│── middleware/
│── utils/
```

---

## 🚀 Run Locally

```bash id="r2c3nt"
npm install
npm run dev
```

---

## 🔐 Authentication Flow

* User registers and logs in
* Server generates **JWT access token**
* Protected routes require valid token
* Refresh token used for session management

---

## 💡 What I Learned

* Building secure authentication systems
* Writing scalable backend structure
* Middleware usage in Express
* Handling user profile updates
* Token-based authentication flow

---

## 🔮 Future Improvements

* Add role-based access control (Admin/User)
* Improve validation & error handling
* Add rate limiting & security enhancements
* Integrate cloud storage for images

---

## 👩‍💻 Author

**Trapti Patel**
