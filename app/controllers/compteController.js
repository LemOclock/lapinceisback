import validator from 'validator';
import sequelize from '../database.js';
import { Compte, Operation, Budget, Alerte } from '../models/associations.js';
import { serverError } from '../middlewares/errorHandler.js';

const DEVISES = ['EUR', 'USD', 'GBP'];

// Ajoute le solde courant (solde initial + somme des opérations) au compte
async function withSolde(compte) {
  const total = await Operation.sum('montant_operation', { where: { compteId: compte.id } });
  const solde = parseFloat(compte.solde_initial || 0) + parseFloat(total || 0);
  return { ...compte.toJSON(), solde_courant: solde.toFixed(2) };
}

// Valide les champs du compte. partial = true pour une modification (champs facultatifs)
function validateCompte(body, partial) {
  const { nom_compte, banque, devise, solde_initial } = body || {};
  const data = {};

  if (nom_compte !== undefined || !partial) {
    if (typeof nom_compte !== 'string' || !validator.isLength(nom_compte.trim(), { min: 1, max: 50 })) {
      return { error: 'Le nom du compte est requis (1-50 caractères).' };
    }
    data.nom_compte = nom_compte.trim();
  }
  if (banque !== undefined && banque !== '') {
    if (typeof banque !== 'string' || !validator.isLength(banque.trim(), { max: 50 })) {
      return { error: 'Le nom de la banque doit faire 50 caractères maximum.' };
    }
    data.banque = banque.trim();
  }
  if (devise !== undefined) {
    if (!DEVISES.includes(devise)) {
      return { error: 'Devise non supportée.' };
    }
    data.devise = devise;
  }
  if (solde_initial !== undefined && solde_initial !== '') {
    if (!validator.isDecimal(String(solde_initial), { decimal_digits: '0,2' }) || Math.abs(parseFloat(solde_initial)) >= 1e8) {
      return { error: 'Le solde initial doit être un nombre (2 décimales max).' };
    }
    data.solde_initial = solde_initial;
  }
  return { data };
}

// Récupère un compte en vérifiant qu'il appartient à l'utilisateur (ou que celui-ci est admin)
async function findOwnedCompte(req) {
  const compte = await Compte.findByPk(req.params.id);
  if (!compte) return null;
  if (compte.utilisateurId !== req.user.id && req.user.role !== 'admin') return null;
  return compte;
}

export async function createCompte(req, res) {
  try {
    const existingCompte = await Compte.findOne({
      where: { utilisateurId: req.user.id }
    });

    if (existingCompte) {
      return res.status(409).json({
        success: false,
        error: 'Vous avez déjà un compte créé. Un seul compte par utilisateur est autorisé.'
      });
    }

    const { data, error } = validateCompte(req.body, false);
    if (error) return res.status(400).json({ success: false, error });

    const compte = await Compte.create({ ...data, utilisateurId: req.user.id });

    res.status(201).json({
      success: true,
      message: 'Compte créé avec succès',
      data: compte
    });
  } catch (error) {
    serverError(res, error);
  }
}

// --------------------------------------------------------------------

// Récupère tous les comptes (admin)
export async function getAllComptes(req, res) {
  try {
    const comptes = await Compte.findAll({ order: [['id', 'ASC']] });
    res.json(comptes);
  } catch (error) {
    serverError(res, error);
  }
}

// --------------------------------------------------------------------

export async function getCompteById(req, res) {
  try {
    const compte = await findOwnedCompte(req);
    if (!compte) return res.status(404).json({ error: 'Compte non trouvé' });
    res.json(await withSolde(compte));
  } catch (error) {
    serverError(res, error);
  }
}

// --------------------------------------------------------------------

export async function updateCompte(req, res) {
  try {
    const compte = await findOwnedCompte(req);
    if (!compte) return res.status(404).json({ error: 'Compte non trouvé' });

    const { data, error } = validateCompte(req.body, true);
    if (error) return res.status(400).json({ success: false, error });

    await compte.update(data);
    res.json(await withSolde(compte));
  } catch (error) {
    serverError(res, error);
  }
}

// --------------------------------------------------------------------

export async function deleteCompte(req, res) {
  try {
    const compte = await findOwnedCompte(req);
    if (!compte) return res.status(404).json({ error: 'Compte non trouvé' });

    await sequelize.transaction(async (transaction) => {
      const budgets = await Budget.findAll({ where: { compteId: compte.id }, transaction });
      const budgetIds = budgets.map((budget) => budget.id);
      if (budgetIds.length > 0) {
        await Alerte.destroy({ where: { budgetId: budgetIds }, transaction });
      }
      await Budget.destroy({ where: { compteId: compte.id }, transaction });
      await Operation.destroy({ where: { compteId: compte.id }, transaction });
      await compte.destroy({ transaction });
    });

    res.json({ message: 'Compte supprimé avec succès' });
  } catch (error) {
    serverError(res, error);
  }
}

// --------------------------------------------------------------------

export async function getCompteByUserId(req, res) {
  try {
    const compte = await Compte.findOne({
      where: { utilisateurId: req.user.id }
    });

    if (!compte) {
      return res.status(404).json({ error: 'Aucun compte trouvé pour cet utilisateur.' });
    }

    res.json(await withSolde(compte));
  } catch (error) {
    serverError(res, error);
  }
}
