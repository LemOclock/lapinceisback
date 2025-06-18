import { Alerte } from '../models/associations.js';


// Créer une alerte
export async function createAlerte(req, res) {
  try {
    const { type_alerte, message, date_lecture, niveau_urgence, budgetId } = req.body;
    const alerte = await Alerte.create({ type_alerte, message, date_lecture, niveau_urgence, budgetId });
    res.status(201).json(alerte);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}


// --------------------------------------------------------------------


// Récupérer toutes les alertes
export async function getAllAlertes(req, res) {
  try {
    const alertes = await Alerte.findAll();
    res.json(alertes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// --------------------------------------------------------------------



// Récupérer une alerte par son id
export async function getAlerteById(req, res) {
  try {
    const alerte = await Alerte.findByPk(req.params.id);
    if (!alerte) return res.status(404).json({ error: 'Alerte non trouvée' });
    res.json(alerte);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// --------------------------------------------------------------------


// Mettre à jour une alerte
export async function updateAlerte(req, res) {
  try {
    const { id } = req.params;
    const { type_alerte, message, date_lecture, niveau_urgence, budgetId } = req.body;
    const alerte = await Alerte.findByPk(id);
    if (!alerte) return res.status(404).json({ error: 'Alerte non trouvée' });
    await alerte.update({ type_alerte, message, date_lecture, niveau_urgence, budgetId });
    res.json(alerte);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// --------------------------------------------------------------------



// Supprimer une alerte
export async function deleteAlerte(req, res) {
  try {
    const { id } = req.params;
    const alerte = await Alerte.findByPk(id);
    if (!alerte) return res.status(404).json({ error: 'Alerte non trouvée' });
    await alerte.destroy();
    res.json({ message: 'Alerte supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}