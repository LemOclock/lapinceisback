import { PORT, CORS_ORIGINS, TRUST_PROXY } from './app/config/env.js';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import './app/models/associations.js';
import router from './app/router.js';
import utilisateurRoutes from './app/routes/utilisateurRoutes.js';
import compteRoutes from './app/routes/compteRoutes.js';
import categorieRoutes from './app/routes/categorieRoutes.js';
import budgetRoutes from './app/routes/budgetRoutes.js';
import operationRoutes from './app/routes/operationRoutes.js';
import alerteRoutes from './app/routes/alerteRoutes.js';
import { notFound, errorHandler } from './app/middlewares/errorHandler.js';

const app = express();

// Derrière les reverse proxies : nécessaire pour récupérer la vraie IP du client (rate limit)
app.set('trust proxy', TRUST_PROXY);
app.disable('x-powered-by');

app.use(helmet());
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

if (CORS_ORIGINS.length > 0) {
  app.use(cors({ origin: CORS_ORIGINS }));
}

//--------------------------------------------------------------------------------------

// Branche chaque groupe de routes sur un préfixe d'URL
app.use('/utilisateurs', utilisateurRoutes);
app.use('/comptes', compteRoutes);
app.use('/categories', categorieRoutes);
app.use('/budgets', budgetRoutes);
app.use('/operations', operationRoutes);
app.use('/alertes', alerteRoutes);

app.use('/', router);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Serveur lancé sur le port ${PORT}`);
});
