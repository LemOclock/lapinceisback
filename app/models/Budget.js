import { Model, DataTypes } from 'sequelize';
import sequelize from '../database.js';

class Budget extends Model { }

Budget.init({
  montant_limite: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  seuil_alerte: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 80.00,
    validate: { min: 0, max: 100 }
  },
  nom_budget: { type: DataTypes.STRING(100), allowNull: false },
  compteId: { type: DataTypes.INTEGER, allowNull: false },
  categorieId: { type: DataTypes.INTEGER, allowNull: false }
}, {
  sequelize,
  modelName: 'Budget',
  tableName: 'budget',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['compteId', 'categorieId'] // Contrainte d'unicité
    }
  ]
});
export default Budget; 