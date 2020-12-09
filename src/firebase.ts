import firebase from "firebase/app";
import "firebase/functions";
import "firebase/firestore";

firebase.initializeApp({
    apiKey: "AIzaSyAeDajuxjFKAYQAl3JWsPGV5KdCa28OLRk",
    authDomain: "minifier-repl.firebaseapp.com",
    databaseURL: "https://minifier-repl.firebaseio.com",
    projectId: "minifier-repl",
    storageBucket: "minifier-repl.appspot.com",
    messagingSenderId: "977703229010",
    appId: "1:977703229010:web:9f00db839d754fe190f18b",
    measurementId: "G-LV8CS7FRKZ",
});

export { firebase };