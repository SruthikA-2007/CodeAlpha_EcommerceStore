# 🛒 CodeAlpha E-Commerce Store

Welcome to the **CodeAlpha E-Commerce Store**, a premium, full-stack e-commerce web application built using **Node.js**, **Express.js**, **MongoDB**, and **EJS**. 

This application features a modern, responsive layout styled with Bootstrap 5 and a custom design system, offering features like user authentication, product catalog management, a persistent shopping cart, seamless order placement, and a protected administrative dashboard.

---

## 🌟 Key Features

### 👤 User Authentication
* **Secure Auth:** Secure user signup and login utilizing session-based authentication and password hashing with `bcryptjs`.
* **Session Persistence:** Remembers user session details and active carts across page reloads.

### 🛍️ Product Catalog & Search
* **Dynamic Grid:** Beautiful, responsive grid showcasing product names, ratings, pricing, and high-quality images.
* **Product Details:** Dedicated product pages showing descriptions, pricing, review stats, and instant "Add to Cart" triggers.

### 🛒 Shopping Cart & Checkout
* **Live Shopping Cart:** View, add, update quantities, or remove items directly in a session-persistent shopping cart.
* **Order Processing:** Interactive checkout form collecting shipping addresses and generating successful orders.
* **Order History:** Complete history log showcasing previous orders for logged-in accounts.

### 👑 Protected Admin Dashboard
* **Product Management:** Complete CRUD system to add, edit, or delete items in the store catalog.
* **Dashboard Overview:** Comprehensive dashboard to monitor inventory and catalog items.

---

## 💻 Tech Stack

* **Runtime:** Node.js
* **Backend Framework:** Express.js
* **Database:** MongoDB Atlas (Cloud Database)
* **ORM:** Mongoose
* **Session & Storage:** `express-session` & `connect-mongo` (saves sessions directly in the MongoDB cluster)
* **View Engine:** EJS (Embedded JavaScript)
* **Styling:** Bootstrap 5 & Custom CSS

---

## 📁 Project Directory Structure

```text
CodeAlpha_EcommerceStore/
├── middleware/          # Protected route authorization middleware
├── models/              # Mongoose Database Schemas (User, Product, Order)
├── public/              # Static assets (images, custom CSS stylesheets)
├── routes/              # Express endpoint routers (auth, products, cart, orders, admin)
├── views/               # EJS template layouts & views (auth, admin, product, cart)
├── .env                 # Environment variables config
├── package.json         # Node.js dependencies and metadata
├── seed.js              # Database seed script for initial product catalog
└── server.js            # Main entry point & server setup
```

---

## 🚀 Installation & Setup

Follow these steps to run the project locally on your machine:

### 1. Prerequisites
Ensure you have the following installed on your machine:
* [Node.js](https://nodejs.org/) (v16 or higher recommended)
* A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account or a local MongoDB database server.

### 2. Clone and Install Dependencies
```bash
# Navigate to project folder
cd CodeAlpha_EcommerceStore

# Install all npm dependencies
npm install
```

### 3. Setup Environment Variables
Create a file named `.env` in the root directory (or use the existing `.env`) and add the following configuration:

```env
PORT=3000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/ecommerce?retryWrites=true&w=majority
SESSION_SECRET=your_super_secret_session_key
```
> ⚠️ **Note:** If your MongoDB password contains special characters like `@`, make sure to percent-encode them (e.g., replace `@` with `%40`).

### 4. Seed the Database
Populate your database cluster with initial dummy products (Wireless Headphones, T-Shirts, Coffee Mugs, etc.) by running:
```bash
node seed.js
```

### 5. Run the Server
Start the application server:
```bash
node server.js
```

Once started, open your web browser and navigate to:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 📝 License
This project is developed as part of the CodeAlpha internship and is open source under the [ISC License](LICENSE).
