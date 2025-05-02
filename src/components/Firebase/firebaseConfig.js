import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyAExaNfOomcUNBGWNLd9svyKv0xSNm4axo",
  authDomain: "doancoso3-9fcc2.firebaseapp.com",
  databaseURL: "https://doancoso3-9fcc2-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "doancoso3-9fcc2",
  storageBucket: "doancoso3-9fcc2.appspot.com",
  messagingSenderId: "987883392201",
  appId: "1:987883392201:android:05d0734fb6aa0681ce9118"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database };
