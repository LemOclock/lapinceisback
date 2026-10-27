import { Op } from 'sequelize';
import validator from 'validator';
import { Operation, Categorie, Budget } from '../models/associations.js';
import { findUserCompte } from '../utils/ownership.js';
import { monthRange, formatDate } from '../utils/dates.js';
import { serverError } from '../middlewares/errorHandler.js';

// Dépenses rattachées à un budget : même catégorie, même mois.
// GET /operations/budget?budget=12            -> mois du budget
// GET /operations/budget?budget=12&month=2025-07
export async function getOperationsByBudget(req, res) {
  try {
    const { month, budget } = req.query;

    if (!budget || !validator.isInt(String(budget), { min: 1 })) {
      return res.status(400).json({ success: false, message: 'Paramètre budget requis.' });
    }

    const compte = await findUserCompte(req.user.id);
    if (!compte) {
      return res.status(404).json({ success: false, message: 'Compte non trouvé pour l\'utilisateur' });
    }

    const budgetRecord = await Budget.findOne({ where: { id: budget, compteId: compte.id } });
    if (!budgetRecord) {
      return res.status(404).json({ success: false, message: 'Budget non trouvé' });
    }

    let annee = budgetRecord.annee;
    let mois = budgetRecord.mois;
    if (month && validator.matches(String(month), /^\d{4}-(0[1-9]|1[0-2])$/)) {
      [annee, mois] = String(month).split('-').map(Number);
    }
    const [start, end] = monthRange(annee, mois);

    const operations = await Operation.findAll({
      where: {
        compteId: compte.id,
        categorieId: budgetRecord.categorieId,
        type_operation: 'depense',
        date_operation: { [Op.gte]: start, [Op.lt]: end }
      },
      include: [{ model: Categorie, attributes: ['id', 'nom_categorie'] }],
      order: [['date_operation', 'DESC'], ['id', 'DESC']]
    });

    res.status(200).json({
      success: true,
      operations: operations.map(operation => ({
        id: operation.id.toString(),
        libelle: operation.nom_operation,
        price: parseFloat(operation.montant_operation),
        date: formatDate(operation.date_operation),
        lieu: operation.lieu || "NON SPÉCIFIÉ",
        categorie: operation.Categorie?.nom_categorie || "Autre",
        type: operation.type_operation,
        moyen_paiement: operation.moyen_paiement,
        image: operation.image_operation
      }))
    });
  } catch (error) {
    serverError(res, error);
  }
}
