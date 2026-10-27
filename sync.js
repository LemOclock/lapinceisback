import 'dotenv/config';
import sequelize from './app/database.js';
import './app/models/associations.js';

// Par défaut : crée uniquement les tables manquantes (sans toucher aux existantes).
// Avec --alter : adapte les tables existantes au modèle (à lancer manuellement, après sauvegarde).
const alter = process.argv.includes('--alter');

async function main() {
  try {
    console.log(alter ? '🚀 Synchronisation avec ALTER' : '🚀 Synchronisation (création des tables manquantes)');

    await sequelize.sync({ alter, force: false });

    console.log('✅ Base de données synchronisée');
  } catch (error) {
    console.error('❌ Erreur BDD :', error);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

main();
