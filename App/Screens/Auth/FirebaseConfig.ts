import { initializeApp } from 'firebase/app';
import { initializeFirestore, persistentLocalCache } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAVW-YqmJF80NSSlFPQxLhjnXpsMMEgq2M",
  authDomain: "movies-b3a77.firebaseapp.com",
  projectId: "movies-b3a77",
  storageBucket: "movies-b3a77.appspot.com",
  messagingSenderId: "314875942156",
  appId: "1:314875942156:android:d85cc14acb4ef34608e529"
};

const app = initializeApp(firebaseConfig);

const db = initializeFirestore(app, {
  localCache: persistentLocalCache()
});

export { app, db };