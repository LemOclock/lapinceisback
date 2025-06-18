import 'dotenv/config';
import sequelize from './app/database.js';
import './app/models/associations.js'; 

// Fonction pour gérer la migration (suppression + création des tables)
async function main() {
  try {
    // Supprime toutes les tables existantes dans la BDD
    await sequelize.drop();
    // Synchronise les modèles : recrée toutes les tables
    await sequelize.sync();
    console.log('Tables créées');
  } catch (error) {
    console.error('Erreur création BDD :', error);
    process.exit(1);
  } finally {
    // ferme la connexion à la BDD
    await sequelize.close();
  }
}

// lancement de la fonction
main();