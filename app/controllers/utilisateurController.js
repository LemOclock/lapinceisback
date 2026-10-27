import { Op } from 'sequelize';
import validator from 'validator';
import bcrypt from 'bcrypt';
import sequelize from '../database.js';
import { Utilisateur, Compte, Operation, Budget, Alerte } from '../models/associations.js';
import { PASSWORD_OPTIONS, PASSWORD_MESSAGE, isValidPhone } from '../utils/validationRegister.js';
import { serverError } from '../middlewares/errorHandler.js';

// Valide les champs de profil modifiables et renvoie les données à enregistrer
async function buildProfileUpdate(body, userId) {
  const { email, prenom, nom, numero_telephone } = body || {};
  const data = {};

  if (email !== undefined) {
    if (typeof email !== 'string' || !validator.isEmail(email.trim()) || email.length > 100) {
      return { error: 'Email invalide.' };
    }
    const normalized = email.trim().toLowerCase();
    const existing = await Utilisateur.findOne({ where: { email: normalized, id: { [Op.ne]: userId } } });
    if (existing) return { error: 'Cet email est déjà utilisé.' };
    data.email = normalized;
  }
  if (prenom !== undefined) {
    if (typeof prenom !== 'string' || !validator.isLength(prenom.trim(), { min: 1, max: 50 })) {
      return { error: 'Le prénom doit faire 1 à 50 caractères.' };
    }
    data.prenom = prenom.trim();
  }
  if (nom !== undefined) {
    if (typeof nom !== 'string' || !validator.isLength(nom.trim(), { min: 1, max: 50 })) {
      return { error: 'Le nom doit faire 1 à 50 caractères.' };
    }
    data.nom = nom.trim();
  }
  if (numero_telephone !== undefined) {
    const phone = numero_telephone ? String(numero_telephone).trim() : null;
    if (phone && !isValidPhone(phone)) {
      return { error: 'Numéro de téléphone invalide.' };
    }
    if (phone) {
      const existing = await Utilisateur.findOne({ where: { numero_telephone: phone, id: { [Op.ne]: userId } } });
      if (existing) return { error: 'Ce numéro de téléphone est déjà utilisé.' };
    }
    data.numero_telephone = phone;
  }
  return { data };
}

// Supprime un utilisateur et toutes ses données (compte, opérations, budgets, alertes)
async function destroyUserWithData(utilisateur) {
  await sequelize.transaction(async (transaction) => {
    const comptes = await Compte.findAll({ where: { utilisateurId: utilisateur.id }, transaction });
    const compteIds = comptes.map((compte) => compte.id);

    if (compteIds.length > 0) {
      const budgets = await Budget.findAll({ where: { compteId: compteIds }, transaction });
      const budgetIds = budgets.map((budget) => budget.id);
      if (budgetIds.length > 0) {
        await Alerte.destroy({ where: { budgetId: budgetIds }, transaction });
      }
      await Budget.destroy({ where: { compteId: compteIds }, transaction });
      await Operation.destroy({ where: { compteId: compteIds }, transaction });
      await Compte.destroy({ where: { id: compteIds }, transaction });
    }
    await utilisateur.destroy({ transaction });
  });
}

// -----------------------------------------------------------
// Utilisateur connecté
// -----------------------------------------------------------

export async function getMe(req, res) {
  try {
    const utilisateur = await Utilisateur.findByPk(req.user.id);
    if (!utilisateur) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    res.json(utilisateur);
  } catch (error) {
    serverError(res, error);
  }
}

export async function updateMe(req, res) {
  try {
    const utilisateur = await Utilisateur.findByPk(req.user.id);
    if (!utilisateur) return res.status(404).json({ error: 'Utilisateur non trouvé' });

    const { data, error } = await buildProfileUpdate(req.body, utilisateur.id);
    if (error) return res.status(400).json({ error });

    await utilisateur.update(data);
    res.json(utilisateur);
  } catch (error) {
    serverError(res, error);
  }
}

export async function updateMyPassword(req, res) {
  try {
    const { mot_de_passe_actuel, nouveau_mot_de_passe } = req.body || {};
    if (typeof mot_de_passe_actuel !== 'string' || typeof nouveau_mot_de_passe !== 'string') {
      return res.status(400).json({ error: 'Mot de passe actuel et nouveau mot de passe requis.' });
    }

    const utilisateur = await Utilisateur.findByPk(req.user.id);
    if (!utilisateur) return res.status(404).json({ error: 'Utilisateur non trouvé' });

    const isValid = await bcrypt.compare(mot_de_passe_actuel, utilisateur.mot_de_passe);
    if (!isValid) {
      return res.status(400).json({ error: 'Le mot de passe actuel est incorrect.' });
    }
    if (nouveau_mot_de_passe.length > 72 || !validator.isStrongPassword(nouveau_mot_de_passe, PASSWORD_OPTIONS)) {
      return res.status(400).json({ error: PASSWORD_MESSAGE });
    }

    await utilisateur.update({ mot_de_passe: await bcrypt.hash(nouveau_mot_de_passe, 10) });
    res.json({ success: true, message: 'Mot de passe modifié avec succès' });
  } catch (error) {
    serverError(res, error);
  }
}

export async function deleteMe(req, res) {
  try {
    const utilisateur = await Utilisateur.findByPk(req.user.id);
    if (!utilisateur) return res.status(404).json({ error: 'Utilisateur non trouvé' });

    await destroyUserWithData(utilisateur);
    res.json({ success: true, message: 'Compte supprimé avec succès' });
  } catch (error) {
    serverError(res, error);
  }
}

// -----------------------------------------------------------
// Administration (routes protégées par isAdmin)
// -----------------------------------------------------------

export async function getAllUtilisateurs(req, res) {
  try {
    const utilisateurs = await Utilisateur.findAll({ order: [['id', 'ASC']] });
    res.json(utilisateurs);
  } catch (error) {
    serverError(res, error);
  }
}

export async function getUtilisateurById(req, res) {
  try {
    const utilisateur = await Utilisateur.findByPk(req.params.id);
    if (!utilisateur) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    res.json(utilisateur);
  } catch (error) {
    serverError(res, error);
  }
}

export async function updateUtilisateur(req, res) {
  try {
    const utilisateur = await Utilisateur.findByPk(req.params.id);
    if (!utilisateur) return res.status(404).json({ error: 'Utilisateur non trouvé' });

    const { data, error } = await buildProfileUpdate(req.body, utilisateur.id);
    if (error) return res.status(400).json({ error });

    const { role } = req.body || {};
    if (role !== undefined) {
      if (role !== 'user' && role !== 'admin') {
        return res.status(400).json({ error: 'Rôle invalide.' });
      }
      data.role = role;
    }

    await utilisateur.update(data);
    res.json(utilisateur);
  } catch (error) {
    serverError(res, error);
  }
}

export async function deleteUtilisateur(req, res) {
  try {
    const utilisateur = await Utilisateur.findByPk(req.params.id);
    if (!utilisateur) return res.status(404).json({ error: 'Utilisateur non trouvé' });

    await destroyUserWithData(utilisateur);
    res.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    serverError(res, error);
  }
}
