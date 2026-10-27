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
  mois: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 12 } },
  annee: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 2000, max: 2100 } },
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
      fields: ['compteId', 'categorieId', 'mois', 'annee'] // Un budget par catégorie et par mois
    }
  ]
});
export default Budget;
