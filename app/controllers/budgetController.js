import validator from 'validator';
import { Budget } from '../models/associations.js';

export async function createBudget(req, res) {
  try {
    const { montant_limite, seuil_alerte = 80, nom_budget, compteId, categorieId } = req.body;

    // Validation des champs
    if (!montant_limite || !validator.isFloat(montant_limite.toString(), { min: 0 })) {
      return res.status(400).json({ error: 'Le montant limite est requis et doit être un nombre positif.' });
    }
    if (seuil_alerte !== undefined && !validator.isFloat(seuil_alerte.toString(), { min: 0, max: 100 })) {
      return res.status(400).json({ error: 'Le seuil d\'alerte doit être un nombre entre 0 et 100.' });
    }
    if (!nom_budget || !validator.isLength(nom_budget, { min: 1, max: 100 })) {
      return res.status(400).json({ error: 'Le nom du budget est requis (1-100 caractères).' });
    }
    if (!compteId || !validator.isInt(compteId.toString(), { min: 1 })) {
      return res.status(400).json({ error: 'Le compte est requis et doit être un entier positif.' });
    }
    if (!categorieId || !validator.isInt(categorieId.toString(), { min: 1 })) {
      return res.status(400).json({ error: 'La catégorie est requise et doit être un entier positif.' });
    }

    // Vérifie l'unicité du couple (compteId, categorieId)
    const existing = await Budget.findOne({ where: { compteId, categorieId } });
    if (existing) {
      return res.status(400).json({ error: 'Un budget existe déjà pour ce compte et cette catégorie.' });
    }

    const budget = await Budget.create({
      montant_limite,
      seuil_alerte,
      nom_budget,
      compteId,
      categorieId
    });

    res.status(201).json(budget);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// --------------------------------------------------------------------


export async function getAllBudgets(req, res) {
  try {
    const budgets = await Budget.findAll();
    res.json(budgets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}


// --------------------------------------------------------------------



export async function getBudgetById(req, res) {
  try {
    const budget = await Budget.findByPk(req.params.id);
    if (!budget) return res.status(404).json({ error: 'Budget non trouvé' });
    res.json(budget);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}


// --------------------------------------------------------------------


// Mettre à jour un budget
export async function updateBudget(req, res) {
  try {
    const { id } = req.params;
    const { montant_limite, seuil_alerte, nom_budget, compteId, categorieId } = req.body;
    const budget = await Budget.findByPk(id);
    if (!budget) return res.status(404).json({ error: 'Budget non trouvé' });
    await budget.update({ montant_limite, seuil_alerte, nom_budget, compteId, categorieId });
    res.json(budget);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}


// --------------------------------------------------------------------


// Supprimer un budget
export async function deleteBudget(req, res) {
  try {
    const { id } = req.params;
    const budget = await Budget.findByPk(id);
    if (!budget) return res.status(404).json({ error: 'Budget non trouvé' });
    await budget.destroy();
    res.json({ message: 'Budget supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}