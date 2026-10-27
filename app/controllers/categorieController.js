import validator from 'validator';
import { Categorie, Operation, Budget } from '../models/associations.js';
import { serverError } from '../middlewares/errorHandler.js';

// Valide les champs d'une catégorie. partial = true pour une modification
function validateCategorie(body, partial) {
  const { nom_categorie, description, couleur, icone, type_categorie } = body || {};
  const data = {};

  if (nom_categorie !== undefined || !partial) {
    if (typeof nom_categorie !== 'string' || !validator.isLength(nom_categorie.trim(), { min: 1, max: 50 })) {
      return { error: 'Le nom de la catégorie est requis (1-50 caractères).' };
    }
    data.nom_categorie = nom_categorie.trim();
  }
  if (description !== undefined) {
    if (typeof description !== 'string' || !validator.isLength(description, { max: 255 })) {
      return { error: 'La description doit faire 255 caractères maximum.' };
    }
    data.description = description;
  }
  if (couleur !== undefined) {
    if (typeof couleur !== 'string' || !/^#[0-9A-Fa-f]{6}$/.test(couleur)) {
      return { error: 'La couleur doit être au format #RRGGBB.' };
    }
    data.couleur = couleur;
  }
  if (icone !== undefined) {
    if (typeof icone !== 'string' || !validator.isLength(icone, { max: 50 })) {
      return { error: "L'icône doit faire 50 caractères maximum." };
    }
    data.icone = icone;
  }
  if (type_categorie !== undefined) {
    if (type_categorie !== 'revenu' && type_categorie !== 'depense') {
      return { error: 'Le type doit être "revenu" ou "depense".' };
    }
    data.type_categorie = type_categorie;
  }
  return { data };
}

// Créer une catégorie (admin)
export async function createCategorie(req, res) {
  try {
    const { data, error } = validateCategorie(req.body, false);
    if (error) return res.status(400).json({ error });

    const categorie = await Categorie.create(data);
    res.status(201).json(categorie);
  } catch (error) {
    serverError(res, error);
  }
}

// --------------------------------------------------------------------

// Récupérer toutes les catégories (ordre stable)
export async function getAllCategories(req, res) {
  try {
    const categories = await Categorie.findAll({ order: [['id', 'ASC']] });
    res.json(categories);
  } catch (error) {
    serverError(res, error);
  }
}

// --------------------------------------------------------------------

// Récupérer une catégorie par son id
export async function getCategorieById(req, res) {
  try {
    const categorie = await Categorie.findByPk(req.params.id);
    if (!categorie) return res.status(404).json({ error: 'Catégorie non trouvée' });
    res.json(categorie);
  } catch (error) {
    serverError(res, error);
  }
}

// --------------------------------------------------------------------

// Mettre à jour une catégorie (admin)
export async function updateCategorie(req, res) {
  try {
    const categorie = await Categorie.findByPk(req.params.id);
    if (!categorie) return res.status(404).json({ error: 'Catégorie non trouvée' });

    const { data, error } = validateCategorie(req.body, true);
    if (error) return res.status(400).json({ error });

    await categorie.update(data);
    res.json(categorie);
  } catch (error) {
    serverError(res, error);
  }
}

// --------------------------------------------------------------------

// Supprimer une catégorie (admin) : refusé si elle est encore utilisée
export async function deleteCategorie(req, res) {
  try {
    const categorie = await Categorie.findByPk(req.params.id);
    if (!categorie) return res.status(404).json({ error: 'Catégorie non trouvée' });

    const [nbOperations, nbBudgets] = await Promise.all([
      Operation.count({ where: { categorieId: categorie.id } }),
      Budget.count({ where: { categorieId: categorie.id } })
    ]);
    if (nbOperations > 0 || nbBudgets > 0) {
      return res.status(409).json({ error: 'Catégorie utilisée par des opérations ou des budgets.' });
    }

    await categorie.destroy();
    res.json({ message: 'Catégorie supprimée avec succès' });
  } catch (error) {
    serverError(res, error);
  }
}
