# Online Book Exchange

A full-stack community book exchange and sharing application powered completely by **MongoDB Atlas** and **Express.js**.

> **Note:** Firebase has been completely removed from this repository. All authentication, user management, book catalog records, and borrow requests are handled by MongoDB Atlas.

---

## 🚀 Key Features

- **Authentication & Profiles (MongoDB Atlas)**:
  - User signup with unique username, email validation, mobile number normalization, and password protection.
  - Case-insensitive login with **either Username or Email**.
  - User session persistence and header status indicators.
- **Interactive 3D Collector's Book**:
  - Immersive Three.js 3D antique leather-bound interactive book.
  - Dual-page turn mechanics with mouse click, drag, and arrow keys.
  - Antique typography and chapter spreads for masterwork fantasy epics (*A Game of Thrones*, *A Clash of Kings*, *A Storm of Swords*, *A Song of Ice and Fire*, *The Winds of Winter*).
- **Book Catalog**:
  - Add your books to the database for lending.
  - Search available books by title.
  - Request to borrow books from other community members.
- **History & Management**:
  - View all books you've listed.
  - View all books you've requested.
  - Delete books or cancel requests.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, React Router v6, CSS3
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas (`mongoose`)
- **Hosting / Serverless Ready**: Vercel serverless function (`/api/index.js`) & Local Express Server (`server.js`)

---

## ⚙️ Environment Variables

Create a `.env` file in the project root:

```env
MONGODB_URI="your-mongodb-atlas-connection-string"
PORT=5000
```

---

## 🏃 Running Locally

In the project root, run:

```bash
# Install dependencies
npm install

# Run backend and frontend concurrently
npm start
```

- **Frontend**: `http://localhost:3000`
- **Backend API**: `http://localhost:5000` (proxied automatically via package.json)
- **API Health Check**: `http://localhost:5000/api/health`
