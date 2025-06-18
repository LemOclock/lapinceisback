import { Model, DataTypes } from 'sequelize';
import sequelize from '../database.js';

class Operation extends Model { }

Operation.init({
  montant_opération: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  nom_opération: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  // Clé étrangère vers Compte
  compteId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  // Clé étrangère vers Categorie
  categorieId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  image_operation: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  moyen_paiement: {
    type: DataTypes.STRING(30),
    allowNull: false,
    defaultValue: 'carte'
  },
  lieu: {
    type: DataTypes.STRING(100),
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'Operation',
  tableName: 'operation',
  timestamps: true,
});

export default Operation;