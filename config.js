import firebase from 'firebase';
//require('@firebase/firestore')


const firebaseConfig = {
    apiKey: "AIzaSyBMmEUdBhd-K1AtIIARpQ47CfRJEh-eb5w",
    authDomain: "elibrary-12099.firebaseapp.com",
    projectId: "elibrary-12099",
    storageBucket: "elibrary-12099.appspot.com",
    messagingSenderId: "361431043918",
    appId: "1:361431043918:web:e67d23338736301450d81f"
  };

firebase.initializeApp(firebaseConfig);

export default firebase.firestore();
