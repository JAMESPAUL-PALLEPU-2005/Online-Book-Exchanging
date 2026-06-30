import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import * as realFirestore from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || 'YOUR_API_KEY',
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || 'YOUR_AUTH_DOMAIN',
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || 'online-book-exchange',
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || 'YOUR_STORAGE_BUCKET',
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || 'YOUR_MESSAGING_SENDER_ID',
  appId: process.env.REACT_APP_FIREBASE_APP_ID || 'YOUR_APP_ID',
};

const isMock = !firebaseConfig.apiKey || firebaseConfig.apiKey === 'YOUR_API_KEY';

let app;
let firestoreInstance;
let authInstance;

if (!isMock) {
  try {
    app = initializeApp(firebaseConfig);
    firestoreInstance = getFirestore(app);
    authInstance = getAuth(app);
  } catch (error) {
    console.error("Firebase initialization failed, falling back to mock localStorage mode:", error);
  }
}

// Helper to get local storage collection
const getLocalCollection = (name) => {
  try {
    const data = localStorage.getItem(name);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Local storage error:", e);
    return [];
  }
};

const setLocalCollection = (name, data) => {
  try {
    localStorage.setItem(name, JSON.stringify(data));
  } catch (e) {
    console.error("Local storage error:", e);
  }
};

// Generate UUID simple mock
const generateUuid = () => {
  return 'mock-' + Math.random().toString(36).substr(2, 9);
};

// Mock functions
const mockCollection = (db, name) => ({ db, name, type: 'collection' });
const mockDoc = (db, name, id) => ({ db, name, id, type: 'doc' });
const mockQuery = (collectionRef, ...filters) => ({ collectionRef, filters, type: 'query' });
const mockWhere = (field, op, value) => ({ field, op, value, type: 'where' });

const mockAddDoc = async (collectionRef, data) => {
  const collectionName = collectionRef.name;
  const items = getLocalCollection(collectionName);
  const newItem = { id: generateUuid(), ...data };
  items.push(newItem);
  setLocalCollection(collectionName, items);
  return { id: newItem.id };
};

const mockGetDocs = async (queryRef) => {
  const isQuery = queryRef.type === 'query';
  const collectionName = isQuery ? queryRef.collectionRef.name : queryRef.name;
  let items = getLocalCollection(collectionName);

  if (isQuery && queryRef.filters) {
    queryRef.filters.forEach((filter) => {
      if (filter.type === 'where') {
        const { field, op, value } = filter;
        items = items.filter((item) => {
          const itemVal = item[field];
          if (!itemVal) return false;
          if (op === '==') return itemVal === value;
          if (op === '>=') return itemVal >= value;
          if (op === '<=') return itemVal <= value;
          return true;
        });
      }
    });
  }

  const docs = items.map((item) => ({
    id: item.id,
    data: () => item,
  }));

  return {
    empty: docs.length === 0,
    docs,
    forEach: (callback) => docs.forEach(callback),
  };
};

const mockGetDoc = async (docRef) => {
  const collectionName = docRef.name;
  const items = getLocalCollection(collectionName);
  const item = items.find((i) => i.id === docRef.id);

  return {
    exists: () => !!item,
    data: () => item || null,
  };
};

const mockDeleteDoc = async (docRef) => {
  const collectionName = docRef.name;
  const items = getLocalCollection(collectionName);
  const updatedItems = items.filter((i) => i.id !== docRef.id);
  setLocalCollection(collectionName, updatedItems);
};

// Exports
export const firestore = isMock ? {} : firestoreInstance;
export const auth = isMock ? {} : authInstance;

export const collection = isMock ? mockCollection : realFirestore.collection;
export const doc = isMock ? mockDoc : realFirestore.doc;
export const query = isMock ? mockQuery : realFirestore.query;
export const where = isMock ? mockWhere : realFirestore.where;
export const addDoc = isMock ? mockAddDoc : realFirestore.addDoc;
export const getDocs = isMock ? mockGetDocs : realFirestore.getDocs;
export const getDoc = isMock ? mockGetDoc : realFirestore.getDoc;
export const deleteDoc = isMock ? mockDeleteDoc : realFirestore.deleteDoc;
