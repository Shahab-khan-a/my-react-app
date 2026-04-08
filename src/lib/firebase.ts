// firebase initialization helper
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCpa9qT7RNUO-HhCPj9yI6syAaE8FnoTYA",
  authDomain: "app-technext96.firebaseapp.com",
  projectId: "app-technext96",
  storageBucket: "app-technext96.firebasestorage.app",
  messagingSenderId: "502156100653",
  appId: "1:502156100653:web:5cd495616057c0d69b24a4"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
