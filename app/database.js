import 'dotenv/config';
import { Sequelize } from 'sequelize';

// configure et export la connexion à la base de données PostgreSQL (variable PG_URL du .env)
const sequelize = new Sequelize(process.env.PG_URL, {
  dialect: 'postgres',
  logging: process.env.DB_LOGGING === 'true' ? console.log : false
});

export default sequelize;
