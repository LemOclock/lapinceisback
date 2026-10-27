import validator from 'validator';
import { Op } from 'sequelize';
import { Budget, Compte, Categorie, Operation, Alerte } from '../models/associations.js';
import { findUserCompte } from '../utils/ownership.js';
import { monthRange } from '../utils/dates.js';
import { serverError } from '../middlewares/errorHandler.js';

const invalid = (res, errors) => res.status(400).json({ success: false, message: 'Données invalides', errors });

// Montant dépensé sur la catégorie du budget pendant son mois
async function computeSpent(budget) {
  const [start, end] = monthRange(budget.annee, budget.mois);
  const total = await Operation.sum('montant_operation', {
    where: {
      compteId: budget.compteId,
      categorieId: budget.categorieId,
      type_operation: 'depense',
      date_operation: { [Op.gte]: start, [Op.lt]: end }
    }
  });
  return Math.abs(parseFloat(total || 0));
}

// Format renvoyé au front
async function formatBudget(budget) {
  const montant = parseFloat(budget.montant_limite);
  const depense = await computeSpent(budget);
  return {
    id: budget.id.toString(),
    nom: budget.nom_budget,
    categorie: budget.Categorie?.nom_categorie || "Autre",
    categorieId: budget.categorieId,
    montant,
    mois: budget.mois,
    annee: budget.annee,
    seuil_alerte: parseFloat(budget.seuil_alerte),
    depense,
    pourcentage: montant > 0 ? Math.round((depense / montant) * 100) : 0
  };
}

// Valide les champs d'un budget. partial = true pour une modification
async function validateBudget(body, partial) {
  const { montant_limite, seuil_alerte, nom_budget, categorieId, mois, annee } = body || {};
  const data = {};

  if (montant_limite !== undefined || !partial) {
    if (montant_limite === undefined || montant_limite === null || !validator.isFloat(String(montant_limite), { gt: 0, max: 1e8 })) {
      return { errors: { montant: 'Le montant limite est requis et doit être un nombre positif.' } };
    }
    data.montant_limite = montant_limite;
  }
  if (seuil_alerte !== undefined) {
    if (seuil_alerte === null || !validator.isFloat(String(seuil_alerte), { min: 0, max: 100 })) {
      return { errors: { seuil_alerte: 'Le seuil d\'alerte doit être un nombre entre 0 et 100.' } };
    }
    data.seuil_alerte = seuil_alerte;
  }
  if (nom_budget !== undefined || !partial) {
    if (typeof nom_budget !== 'string' || !validator.isLength(nom_budget.trim(), { min: 1, max: 100 })) {
      return { errors: { nom_budget: 'Le nom du budget est requis (1-100 caractères).' } };
    }
    data.nom_budget = nom_budget.trim();
  }
  if (categorieId !== undefined || !partial) {
    if (categorieId === undefined || categorieId === null || !validator.isInt(String(categorieId), { min: 1 })) {
      return { errors: { categorieId: 'La catégorie est requise.' } };
    }
    const categorie = await Categorie.findByPk(categorieId);
    if (!categorie) {
      return { errors: { categorieId: 'Catégorie non trouvée.' } };
    }
    data.categorieId = categorieId;
  }
  if (mois !== undefined || !partial) {
    if (mois === undefined || mois === null || !validator.isInt(String(mois), { min: 1, max: 12 })) {
      return { errors: { mois: 'Le mois doit être compris entre 1 et 12.' } };
    }
    data.mois = parseInt(mois, 10);
  }
  if (annee !== undefined || !partial) {
    if (annee === undefined || annee === null || !validator.isInt(String(annee), { min: 2000, max: 2100 })) {
      return { errors: { annee: "L'année est invalide." } };
    }
    data.annee = parseInt(annee, 10);
  }
  return { data };
}

// Récupère un budget appartenant au compte de l'utilisateur connecté
async function findOwnedBudget(req) {
  const compte = await findUserCompte(req.user.id);
  if (!compte) return null;
  return Budget.findOne({
    where: { id: req.params.id, compteId: compte.id },
    include: [{ model: Categorie, attributes: ['id', 'nom_categorie'] }]
  });
}

export async function createBudget(req, res) {
  try {
    const compte = await findUserCompte(req.user.id);
    if (!compte) {
      return res.status(404).json({ success: false, message: 'Compte non trouvé pour l\'utilisateur.' });
    }

    const { data, errors } = await validateBudget(req.body, false);
    if (errors) return invalid(res, errors);

    // Vérifie l'unicité (compte, catégorie, mois, année)
    const existing = await Budget.findOne({
      where: { compteId: compte.id, categorieId: data.categorieId, mois: data.mois, annee: data.annee }
    });
    if (existing) {
      return invalid(res, { budget: 'Un budget existe déjà pour cette catégorie ce mois-ci.' });
    }

    const budget = await Budget.create({ ...data, compteId: compte.id });
    await budget.reload({ include: [{ model: Categorie, attributes: ['id', 'nom_categorie'] }] });

    res.status(201).json({
      success: true,
      message: 'Budget créé avec succès',
      budget: await formatBudget(budget)
    });
  } catch (error) {
    serverError(res, error);
  }
}

// --------------------------------------------------------------------

// Budgets de l'utilisateur connecté (objet indexé par id)
export async function getUserBudgets(req, res) {
  try {
    const budgets = await Budget.findAll({
      include: [
        {
          model: Compte,
          where: { utilisateurId: req.user.id },
          attributes: ['id', 'nom_compte']
        },
        {
          model: Categorie,
          attributes: ['id', 'nom_categorie']
        }
      ],
      order: [['id', 'ASC']]
    });

    const budgetsObject = {};
    for (const budget of budgets) {
      budgetsObject[budget.id] = await formatBudget(budget);
    }

    res.status(200).json({
      success: true,
      budgets: budgetsObject
    });
  } catch (error) {
    serverError(res, error);
  }
}

// --------------------------------------------------------------------

// Tous les budgets (admin)
export async function getAllBudgets(req, res) {
  try {
    const budgets = await Budget.findAll({
      include: [{ model: Categorie, attributes: ['id', 'nom_categorie'] }],
      order: [['id', 'ASC']]
    });

    const formatted = [];
    for (const budget of budgets) {
      formatted.push({ ...(await formatBudget(budget)), compteId: budget.compteId });
    }
    res.json({ success: true, budgets: formatted });
  } catch (error) {
    serverError(res, error);
  }
}

// --------------------------------------------------------------------

export async function getBudgetById(req, res) {
  try {
    const budget = await findOwnedBudget(req);
    if (!budget) {
      return res.status(404).json({ success: false, message: 'Budget non trouvé' });
    }
    res.json({ success: true, budget: await formatBudget(budget) });
  } catch (error) {
    serverError(res, error);
  }
}

// --------------------------------------------------------------------

export async function updateBudget(req, res) {
  try {
    const budget = await findOwnedBudget(req);
    if (!budget) {
      return res.status(404).json({ success: false, message: 'Budget non trouvé' });
    }

    const { data, errors } = await validateBudget(req.body, true);
    if (errors) return invalid(res, errors);

    // Vérifie l'unicité si la catégorie ou la période change
    const target = {
      categorieId: data.categorieId ?? budget.categorieId,
      mois: data.mois ?? budget.mois,
      annee: data.annee ?? budget.annee
    };
    const duplicate = await Budget.findOne({
      where: { compteId: budget.compteId, ...target, id: { [Op.ne]: budget.id } }
    });
    if (duplicate) {
      return invalid(res, { budget: 'Un budget existe déjà pour cette catégorie ce mois-ci.' });
    }

    await budget.update(data);

    res.json({
      success: true,
      message: 'Budget modifié avec succès'
    });
  } catch (error) {
    serverError(res, error);
  }
}

// --------------------------------------------------------------------

export async function deleteBudget(req, res) {
  try {
    const budget = await findOwnedBudget(req);
    if (!budget) {
      return res.status(404).json({ success: false, message: 'Budget non trouvé' });
    }

    await Alerte.destroy({ where: { budgetId: budget.id } });
    await budget.destroy();

    res.json({
      success: true,
      message: 'Budget supprimé avec succès'
    });
  } catch (error) {
    serverError(res, error);
  }
}
