# 🛍️ Shopping Web Backend

Professional e-commerce backend API for Shopping Web platform.

## 🚀 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **Password**: bcryptjs

## ✨ Features

✅ User Authentication (Register/Login)  
✅ Google OAuth Integration  
✅ Product Management & Filtering  
✅ Order Management  
✅ JWT Token-based Authorization  
✅ Multiple Payment Methods (UPI/COD)  
✅ Secure Password Hashing  
✅ RESTful API Architecture  

## 📦 Installation

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Setup Environment Variables

Create a `.env` file in the backend root:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/shopping-web
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
```

### 3. Install MongoDB

**Option A: Local MongoDB**
```bash
# macOS
brew install mongodb-community
brew services start mongodb-community

# Linux
sudo apt-get install -y mongodb

# Windows
# Download from https://www.mongodb.com/try/download/community
```

**Option B: MongoDB Atlas (Cloud)**