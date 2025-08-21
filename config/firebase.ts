import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAyUlsp_IY5vx7H7sq4Bs0jrLUwKnoSfCU",
  authDomain: "suporte-evo-ggux5j.firebaseapp.com",
  projectId: "suporte-evo-ggux5j",
  storageBucket: "suporte-evo-ggux5j.appspot.com",
  messagingSenderId: "943043470960",
  appId: "1:943043470960:web:138f9a3b894c41e50836b5"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);