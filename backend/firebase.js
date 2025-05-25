// firebase.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDWhSFhSAqRzFcLvpOie-YYyUwgRYT49G0",
  authDomain: "royalpaws-hub.firebaseapp.com",
  databaseURL: "https://royalpaws-hub-default-rtdb.firebaseio.com",
  projectId: "royalpaws-hub",
  storageBucket: "royalpaws-hub.appspot.com",
  messagingSenderId: "1011783729597",
  appId: "1:1011783729597:web:2db5a405b4729aa57552d4"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db };
