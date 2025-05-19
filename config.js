const firebaseConfig = {
  apiKey: "AIzaSyCLEaHPBo832WpXuLg-JytYqCYpxTELmzY",
  authDomain: "datakomen.firebaseapp.com",
  projectId: "datakomen",
  storageBucket: "datakomen.appspot.com",
  messagingSenderId: "167872028984",
  appId: "1:167872028984:web:93bd698219fb0627e7a1cd"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();