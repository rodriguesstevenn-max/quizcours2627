/* ============================================================
   CONFIGURATION DE QUIZ LIVE  (voir GUIDE.md, étapes 1 à 3)
   ============================================================

   Tant que ce fichier n'est pas rempli, l'appli tourne en MODE DÉMO :
   tout se passe sur votre ordinateur (pratique pour s'entraîner,
   mais les téléphones des étudiants ne peuvent pas se connecter).

   1) Collez ci-dessous les valeurs données par la console Firebase
      (Paramètres du projet > Vos applications > Configuration).
      Ne gardez que ce qui est entre les accolades { }.               */

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDCPtq6OgGLoEL3PVr9r6A2yqX8P7j3eMU",
  authDomain: "quizcours2627.firebaseapp.com",
  databaseURL: "https://quizcours2627-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "quizcours2627",
  storageBucket: "quizcours2627.firebasestorage.app",
  messagingSenderId: "324665041419",
  appId: "1:324665041419:web:fed3d73e6430b222bfdd0e"
};

/* 2) Adresse publique de la page étudiants (GitHub Pages), par exemple :
      "https://monpseudo.github.io/quiz/"
      C'est elle qui s'affiche au tableau et dans le QR code.           */

const STUDENT_URL = "https://rodriguesstevenn-max.github.io/quizcours2627/";
