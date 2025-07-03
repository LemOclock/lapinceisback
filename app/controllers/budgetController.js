import validator from 'validator';
import { Budget, Compte, Categorie } from '../models/associations.js'; // Add missing imports

export async function createBudget(req, res) {
  try {
    const { montant_limite, seuil_alerte = 80, nom_budget, compteId, categorieId } = req.body;

    // Validation des champs
    if (!montant_limite || !validator.isFloat(montant_limite.toString(), { min: 0 })) {
      return res.status(400).json({ 
        success: false,
        message: 'Données invalides',
        errors: { montant: 'Le montant limite est requis et doit être un nombre positif.' }
      });
    }
    if (seuil_alerte !== undefined && !validator.isFloat(seuil_alerte.toString(), { min: 0, max: 100 })) {
      return res.status(400).json({ 
        success: false,
        message: 'Données invalides',
        errors: { seuil_alerte: 'Le seuil d\'alerte doit être un nombre entre 0 et 100.' }
      });
    }
    if (!nom_budget || !validator.isLength(nom_budget, { min: 1, max: 100 })) {
      return res.status(400).json({ 
        success: false,
        message: 'Données invalides',
        errors: { nom_budget: 'Le nom du budget est requis (1-100 caractères).' }
      });
    }
    if (!compteId || !validator.isInt(compteId.toString(), { min: 1 })) {
      return res.status(400).json({ 
        success: false,
        message: 'Données invalides',
        errors: { compteId: 'Le compte est requis et doit être un entier positif.' }
      });
    }
    if (!categorieId || !validator.isInt(categorieId.toString(), { min: 1 })) {
      return res.status(400).json({ 
        success: false,
        message: 'Données invalides',
        errors: { categorieId: 'La catégorie est requise et doit être un entier positif.' }
      });
    }

    // Vérifie l'unicité du couple (compteId, categorieId)
    const existing = await Budget.findOne({ where: { compteId, categorieId } });
    if (existing) {
      return res.status(400).json({ 
        success: false,
        message: 'Données invalides',
        errors: { budget: 'Un budget existe déjà pour ce compte et cette catégorie.' }
      });
    }

    const budget = await Budget.create({
      montant_limite,
      seuil_alerte,
      nom_budget,
      compteId,
      categorieId
    });

    const categorie = await Categorie.findByPk(categorieId);
    const categorieName = categorie ? categorie.nom_categorie : "Autre";

    // Updated response format
    res.status(201).json({
      success: true,
      message: 'Budget créé avec succès',
      budget: {
        id: budget.id.toString(),
        nom: budget.nom_budget,
        categorie: categorieName,
        montant: parseFloat(budget.montant_limite),
        mois: req.body.mois || new Date().getMonth() + 1,
        annee: req.body.annee || new Date().getFullYear()
      }
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      message: 'Données invalides',
      errors: { global: error.message }
    });
  }
}


// --------------------------------------------------------------------

// Add this function to your budgetController.js
export async function getUserBudgets(req, res) {
  try {
    // Get user ID from JWT token
    const userId = req.user.id;
    
    // Find all budgets associated with user's accounts
    const budgets = await Budget.findAll({
      include: [
        {
          model: Compte,
          where: { utilisateurId: userId },
          attributes: ['id', 'nom_compte']
        },
        {
          model: Categorie,
          attributes: ['id', 'nom_categorie']
        }
      ]
    });
    
    const budgetsObject = {};
    budgets.forEach(budget => {
      budgetsObject[budget.id] = {
        id: budget.id.toString(),
        nom: budget.nom_budget,
        categorie: budget.Categorie?.nom_categorie || "Autre",
        montant: parseFloat(budget.montant_limite),
        mois: budget.mois || new Date().getMonth() + 1,
        annee: budget.annee || new Date().getFullYear()
      };
    });
    
    res.status(200).json({
      success: true,
      budgets: budgetsObject
    });
  } catch (error) {
    console.error('Error fetching user budgets:', error);
    res.status(500).json({ 
      success: false,
      message: "Erreur lors de la récupération des budgets",
      error: error.message
    });
  }
}

// --------------------------------------------------------------------


export async function getAllBudgets(req, res) {
  try {
    const budgets = await Budget.findAll({
      include: [{
        model: Categorie,
        attributes: ['id', 'nom_categorie']
      }]
    });
    
    res.json({
      success: true,
      budgets: budgets.map(budget => ({
        id: budget.id.toString(),
        nom: budget.nom_budget,
        categorie: budget.Categorie?.nom_categorie || "Autre",
        montant: parseFloat(budget.montant_limite),
        mois: budget.mois || new Date().getMonth() + 1,
        annee: budget.annee || new Date().getFullYear()
      }))
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Erreur lors de la récupération des budgets",
      error: error.message
    });
  }
}


// --------------------------------------------------------------------



export async function getBudgetById(req, res) {
  try {
    const budget = await Budget.findByPk(req.params.id, {
      include: [{
        model: Categorie,
        attributes: ['id', 'nom_categorie']
      }]
    });
    
    if (!budget) {
      return res.status(404).json({ 
        success: false,
        message: 'Budget non trouvé'
      });
    }
    
    res.json({
      success: true,
      budget: {
        id: budget.id.toString(),
        nom: budget.nom_budget,
        categorie: budget.Categorie?.nom_categorie || "Autre",
        montant: parseFloat(budget.montant_limite),
        mois: budget.mois || new Date().getMonth() + 1,
        annee: budget.annee || new Date().getFullYear()
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Erreur lors de la récupération du budget",
      error: error.message
    });
  }
}

// --------------------------------------------------------------------


// Mettre à jour un budget
export async function updateBudget(req, res) {
  try {
    const { id } = req.params;
    const { montant_limite, seuil_alerte, nom_budget, compteId, categorieId } = req.body;
    const budget = await Budget.findByPk(id);
    
    if (!budget) {
      return res.status(404).json({ 
        success: false,
        message: 'Budget non trouvé'
      });
    }
    
    await budget.update({ montant_limite, seuil_alerte, nom_budget, compteId, categorieId });
    
    res.json({
      success: true,
      message: 'Budget modifié avec succès'
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      message: 'Données invalides',
      errors: { global: error.message }
    });
  }
}

// --------------------------------------------------------------------


// Supprimer un budget
export async function deleteBudget(req, res) {
  try {
    const { id } = req.params;
    const budget = await Budget.findByPk(id);
    
    if (!budget) {
      return res.status(404).json({ 
        success: false, 
        message: 'Budget non trouvé' 
      });
    }
    
    await budget.destroy();
    
    res.json({ 
      success: true, 
      message: 'Budget supprimé avec succès' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Erreur lors de la suppression du budget',
      error: error.message 
    });
  }
}