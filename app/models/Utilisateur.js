import { Model, DataTypes } from 'sequelize';
import sequelize from '../database.js';

class Utilisateur extends Model { }

Utilisateur.init({
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: { isEmail: true }
  },
  mot_de_passe: { type: DataTypes.STRING(100), allowNull: false },
  prenom: { type: DataTypes.STRING(50), allowNull: false },
  nom: { type: DataTypes.STRING(50), allowNull: false },
  image_utilisateur: { type: DataTypes.STRING(255), allowNull: true },
  numero_telephone: { type: DataTypes.STRING(18), unique: true, allowNull: true },
  role: {
    type: DataTypes.STRING(6),
    defaultValue: 'user',
    allowNull: false,
    validate: { isIn: [['user', 'admin']] }
  }
},

  {
    sequelize,
    modelName: 'Utilisateur',
    tableName: 'utilisateur',
    timestamps: true,
  });

export default Utilisateur;