import validator from 'validator';
import { Compte } from '../models/associations.js';

export async function createCompte(req, res) {
  try {
    const { nom_compte, banque, solde_initial = 0, devise, date_maj_solde, utilisateurId } = req.body;

    // Validation des champs
    if (!nom_compte || !validator.isLength(nom_compte, { min: 1, max: 100 })) {
      return res.status(400).json({ error: 'Le nom du compte est requis (1-100 caractères).' });
    }
    if (banque && !validator.isLength(banque, { min: 1, max: 100 })) {
      return res.status(400).json({ error: 'Le nom de la banque doit faire 1 à 100 caractères.' });
    }
    if (solde_initial !== undefined && !validator.isDecimal(solde_initial.toString())) {
      return res.status(400).json({ error: 'Le solde initial doit être un nombre décimal.' });
    }
    if (!devise || !validator.isLength(devise, { min: 1, max: 3 })) {
      return res.status(400).json({ error: 'La devise est requise (1-3 caractères).' });
    }
    if (date_maj_solde && !validator.isISO8601(date_maj_solde)) {
      return res.status(400).json({ error: 'La date de mise à jour du solde doit être une date valide.' });
    }
    if (!utilisateurId || !validator.isInt(utilisateurId.toString(), { min: 1 })) {
      return res.status(400).json({ error: 'L\'utilisateur associé est requis et doit être un entier positif.' });
    }

    const compte = await Compte.create({ nom_compte, banque, solde_initial, devise, date_maj_solde, utilisateurId });
    res.status(201).json(compte);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}
// --------------------------------------------------------------------

// Récupère tous les comptes
export async function getAllComptes(req, res) {
  try {

    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès réservé aux administrateurs.' });
    }
    const comptes = await Compte.findAll();
    res.json(comptes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// --------------------------------------------------------------------

// Récupère un compte par son id
export async function getCompteById(req, res) {
  try {
    const compte = await Compte.findByPk(req.params.id);
    if (!compte) return res.status(404).json({ error: 'Compte non trouvé' });
    res.json(compte);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// --------------------------------------------------------------------

// Modifie un compte
export async function updateCompte(req, res) {
  try {
    const { id } = req.params;
    const { nom_compte, banque, devise } = req.body;

    const compte = await Compte.findByPk(id);
    if (!compte) return res.status(404).json({ error: 'Compte non trouvé' });

    await compte.update({ nom_compte, banque, devise, solde_initial });
    res.json(compte);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// --------------------------------------------------------------------

export async function deleteCompte(req, res) {
  try {
    const { id } = req.params;
    const compte = await Compte.findByPk(id);
    if (!compte) {
      return res.status(404).json({ error: 'Compte non trouvé' });
    }
    await compte.destroy();
    res.json({ message: 'Compte supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}