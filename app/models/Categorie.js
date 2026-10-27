import { Model, DataTypes } from 'sequelize';
import sequelize from '../database.js';

class Categorie extends Model {}

Categorie.init({
  nom_categorie: { type: DataTypes.STRING(50), allowNull: false },
  description: { type: DataTypes.STRING(255) },
  couleur: { type: DataTypes.CHAR(7), defaultValue: '#000000' },
  icone: { type: DataTypes.STRING(50) },
  type_categorie: {
    type: DataTypes.ENUM('revenu', 'depense'),
    allowNull: false,
    defaultValue: 'depense'
  }
}, {
  sequelize,
  modelName: 'Categorie',
  tableName: 'categorie',
  timestamps: true
});

export default Categorie;