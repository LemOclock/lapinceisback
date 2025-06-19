import express from 'express';
import dotenv from 'dotenv';
import './app/database.js';
import router from './app/router.js';
import session from 'express-session';
import utilisateurRoutes from './app/routes/utilisateurRoutes.js';
import compteRoutes from './app/routes/compteRoutes.js';
import categorieRoutes from './app/routes/categorieRoutes.js';
import budgetRoutes from './app/routes/budgetRoutes.js';
import operationRoutes from './app/routes/operationRoutes.js';
import alerteRoutes from './app/routes/alerteRoutes.js';
import cors from 'cors';


dotenv.config();


const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(cors({
  origin: 'http://localhost:1234', // ou l’URL de ton front en prod
  credentials: true
}));


app.use(session({
  secret: 'unSecretSuperSecret', // à personnaliser !
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // true si HTTPS uniquement
}));

// Branche chaque groupe de routes sur un préfixe d'URL
app.use('/utilisateurs', utilisateurRoutes);
app.use('/comptes', compteRoutes);
app.use('/categories', categorieRoutes);
app.use('/budgets', budgetRoutes);
app.use('/operations', operationRoutes);
app.use('/alertes', alerteRoutes);


app.use('/', router);


// Importation des routes



// ...après tous les app.use(...)
app.use((req, res) => {
  res.status(404).json({ success: false, message: "La page demandée n'a pas été trouvée." });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur lancé sur le port ${PORT}`);
});