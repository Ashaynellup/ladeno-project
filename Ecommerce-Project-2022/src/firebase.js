import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: "AIzaSyCFb5qLDoz2hpWDnJ2Vf-ie1-3Fvt3F_Ds",
  authDomain: "e-commerce-project-fe192.firebaseapp.com",
  projectId: "e-commerce-project-fe192",
  storageBucket: "e-commerce-project-fe192.appspot.com",
  messagingSenderId: "197203638225",
  appId: "1:197203638225:web:5c6ecf15067f8b047c12f0",
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
export const auth = getAuth(app)
export const storage = getStorage(app)

export default db
