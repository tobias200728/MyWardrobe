import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDHqulPpmpmS0rqHGg8GPdl0YRJhsnTITE",
  authDomain: "mywardrobe-a8eac.firebaseapp.com",
  projectId: "mywardrobe-a8eac",
  storageBucket: "mywardrobe-a8eac.firebasestorage.app",
  messagingSenderId: "54741147283",
  appId: "1:54741147283:web:45242000c876051bbaf766"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);