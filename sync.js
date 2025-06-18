import 'dotenv/config';
import pg from 'pg';
import sequelize from './app/database.js';
import './app/models/associations.js'; 

// Création de la BDD directement 
async function createDatabaseIfNotExists() {
  const client = new pg.Client({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    password: process.env.PGPASSWORD,
    database: 'postgres', 
    port: process.env.PGPORT,
  });

  try {
    await client.connect();
    await client.query(`CREATE DATABASE ${process.env.PGDATABASE}`);
    console.log('Base de données créée !');
  } catch (e) {
    if (e.code === '42P04') {
      console.log('La base existe déjà.');
    } else {
      console.error('Erreur création BDD :', e);
      process.exit(1);
    }
  } finally {
    await client.end();
  }
}


// avant de lancer le sync.js crée lapincebdd dans postgres 
// Fonction  pour gérer la migration (suppression + création des tables)
async function main() {
   await createDatabaseIfNotExists();
  try {
    // Supprime toutes les tables existantes dans la BDD
    await sequelize.drop();
    // Synchronise les modèles : recrée toutes les tables
    await sequelize.sync();
    console.log('Table créees');
  } catch (error) {
    console.error('Errorrrrrrrrrrrrr :', error);
  } finally {
    // ferme la connexion à la BDD
    await sequelize.close();
  }
}

// lancement de la function
main();