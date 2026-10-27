import { Alerte } from '../models/associations.js';
import { serverError } from '../middlewares/errorHandler.js';

// Toutes ces routes sont réservées aux admins (voir alerteRoutes.js)

const NIVEAUX = ['info', 'warning', 'critical'];

function pickAlerte(body) {
  const { type_alerte, message, date_lecture, niveau_urgence, budgetId } = body || {};
  return { type_alerte, message, date_lecture, niveau_urgence, budgetId };
}

function validateAlerte(data, partial) {
  if (!partial && (!data.type_alerte || !data.message)) {
    return 'Champs obligatoires manquants (type_alerte, message).';
  }
  if (data.type_alerte !== undefined && (typeof data.type_alerte !== 'string' || data.type_alerte.length > 30)) {
    return 'type_alerte invalide (30 caractères max).';
  }
  if (data.message !== undefined && (typeof data.message !== 'string' || data.message.length > 500)) {
    return 'message invalide (500 caractères max).';
  }
  if (data.niveau_urgence !== undefined && !NIVEAUX.includes(data.niveau_urgence)) {
    return 'niveau_urgence invalide.';
  }
  return null;
}

export async function createAlerte(req, res) {
  try {
    const data = pickAlerte(req.body);
    const error = validateAlerte(data, false);
    if (error) return res.status(400).json({ error });

    const alerte = await Alerte.create(data);
    res.status(201).json(alerte);
  } catch (error) {
    serverError(res, error);
  }
}

// --------------------------------------------------------------------

export async function getAllAlertes(req, res) {
  try {
    const alertes = await Alerte.findAll({ order: [['id', 'ASC']] });
    res.json(alertes);
  } catch (error) {
    serverError(res, error);
  }
}

// --------------------------------------------------------------------

export async function getAlerteById(req, res) {
  try {
    const alerte = await Alerte.findByPk(req.params.id);
    if (!alerte) return res.status(404).json({ error: 'Alerte non trouvée' });
    res.json(alerte);
  } catch (error) {
    serverError(res, error);
  }
}

// --------------------------------------------------------------------

export async function updateAlerte(req, res) {
  try {
    const alerte = await Alerte.findByPk(req.params.id);
    if (!alerte) return res.status(404).json({ error: 'Alerte non trouvée' });

    const data = pickAlerte(req.body);
    const error = validateAlerte(data, true);
    if (error) return res.status(400).json({ error });

    await alerte.update(data);
    res.json(alerte);
  } catch (error) {
    serverError(res, error);
  }
}

// --------------------------------------------------------------------

export async function deleteAlerte(req, res) {
  try {
    const alerte = await Alerte.findByPk(req.params.id);
    if (!alerte) return res.status(404).json({ error: 'Alerte non trouvée' });
    await alerte.destroy();
    res.json({ message: 'Alerte supprimée avec succès' });
  } catch (error) {
    serverError(res, error);
  }
}
