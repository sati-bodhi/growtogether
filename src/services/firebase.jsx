import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {

    apiKey: "AIzaSyBIQYXiElSrmdvghja-RjrcVUN2cneQuOI",
  
    authDomain: "blng-beda9.firebaseapp.com",
  
    projectId: "blng-beda9",
  
    storageBucket: "blng-beda9.firebasestorage.app",
  
    messagingSenderId: "912395233249",
  
    appId: "1:912395233249:web:07266c8ac65f1f5a9814a0"
  
  };  

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
