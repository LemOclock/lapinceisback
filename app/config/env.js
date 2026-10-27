import 'dotenv/config';

// Vérifie au démarrage que les variables indispensables sont présentes
const REQUIRED = ['PG_URL', 'JWT_SECRET'];

const missing = REQUIRED.filter((name) => !process.env[name]);
if (missing.length > 0) {
  console.error(`❌ Variables d'environnement manquantes : ${missing.join(', ')}`);
  process.exit(1);
}

if (process.env.JWT_SECRET.length < 32) {
  console.error('❌ JWT_SECRET doit faire au moins 32 caractères.');
  process.exit(1);
}

export const JWT_SECRET = process.env.JWT_SECRET;
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
export const PORT = process.env.PORT || 3000;

// Nombre de reverse proxies devant l'API (Caddy + Nginx en production = 2)
export const TRUST_PROXY = parseInt(process.env.TRUST_PROXY || '1', 10);

// Origines autorisées pour CORS (séparées par des virgules). Vide = même origine uniquement.
export const CORS_ORIGINS = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
