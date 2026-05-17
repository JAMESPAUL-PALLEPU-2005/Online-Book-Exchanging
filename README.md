# 📚 Online Book Exchange

A web-based book exchange platform built with React and Firebase. Users can browse books using an external API, manage their own listings via Firebase Firestore, and log in with Firebase Authentication.

## ⚙ Tech Stack

- *Frontend*: React.js, React Router  
- *Backend/Database*: Firebase Firestore  
- *Authentication*: Firebase Auth  
- *External API*: [CCBP Book Store API](https://apis.ccbp.in/book-store)

## ✨ Features

- 🔐 Firebase Authentication (Login/Register)
- 📖 Browse books using the CCBP Book Store API
- 🔍 Search books by title
- ➕ Add your own books (stored in Firebase Firestore)
- ❌ Delete your own book listings
- 📋 View all books added by users

## 🚀 Getting Started

### Prerequisites

- Node.js and npm
- Firebase project with Firestore and Authentication enabled

### Setup Instructions

1. *Clone the repository:*

   bash
   git clone https://github.com/JAMESPAUL-PALLEPU-2005/Online-Book-Exchanging.git
   cd OnlineBookExchange
   

2. *Install dependencies:*

   bash
   npm install
   

3. *Set up Firebase:*

   Create a file called firebase.js in the src/ directory and add the following:

   js
   import { initializeApp } from 'firebase/app';
   import { getFirestore } from 'firebase/firestore';
   import { getAuth } from 'firebase/auth';

   const firebaseConfig = {
     apiKey: 'YOUR_API_KEY',
     authDomain: 'YOUR_AUTH_DOMAIN',
     projectId: 'YOUR_PROJECT_ID',
     storageBucket: 'YOUR_STORAGE_BUCKET',
     messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
     appId: 'YOUR_APP_ID',
   };

   const app = initializeApp(firebaseConfig);

   export const firestore = getFirestore(app);
   export const auth = getAuth(app);
   

4. *Start the development server:*

   bash
   npm start
   

## 📝 Notes

- Firebase Firestore is used for storing user-uploaded books.
- Only authenticated users can add or delete books.
- A search bar is available for filtering book titles from the CCBP API.

## 🔜 Future Improvements

- Image uploads for book entries (using Firebase Storage)
- Book lending or request tracking system
- Filters by category, author, or availability
- Pagination and lazy loading
