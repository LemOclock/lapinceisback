import { Operation } from '../models/associations.js';
import validator from 'validator';

export async function createOperation(req, res) {
  try {
    const { montant_opération, nom_opération, date_modification, moyen_paiement, lieu, compteId, categorieId } = req.body;

    // Validation des champs
    if (
      montant_opération === undefined ||
      !validator.isDecimal(montant_opération.toString())
    ) {
      return res.status(400).json({ error: 'Le montant de l\'opération est requis et doit être un nombre décimal.' });
    }
    if (!nom_opération || !validator.isLength(nom_opération, { min: 1, max: 100 })) {
      return res.status(400).json({ error: 'Le nom de l\'opération est requis (1-100 caractères).' });
    }
    if (date_modification && !validator.isISO8601(date_modification)) {
      return res.status(400).json({ error: 'La date de modification doit être une date valide.' });
    }
    if (moyen_paiement && !validator.isLength(moyen_paiement, { min: 1, max: 50 })) {
      return res.status(400).json({ error: 'Le moyen de paiement doit faire 1 à 50 caractères.' });
    }
    if (lieu && !validator.isLength(lieu, { min: 1, max: 100 })) {
      return res.status(400).json({ error: 'Le lieu doit faire 1 à 100 caractères.' });
    }
    if (!compteId || !validator.isInt(compteId.toString(), { min: 1 })) {
      return res.status(400).json({ error: 'Le compte associé est requis et doit être un entier positif.' });
    }
    if (!categorieId || !validator.isInt(categorieId.toString(), { min: 1 })) {
      return res.status(400).json({ error: 'La catégorie associée est requise et doit être un entier positif.' });
    }

    const operation = await Operation.create({
      montant_opération,
      nom_opération,
      date_modification,
      moyen_paiement,
      lieu,
      compteId,
      categorieId
    });

    res.status(201).json(operation);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}
// --------------------------------------------------------------------

export async function getOperationById(req, res) {
  try {
    const operation = await Operation.findByPk(req.params.id);
    if (!operation) return res.status(404).json({ error: 'Opération non trouvée' });
    res.json(operation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// --------------------------------------------------------------------

export async function getAllOperations(req, res) {
  try {
    const operations = await Operation.findAll();
    res.json(operations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}


// --------------------------------------------------------------------




export async function updateOperation(req, res) {
  try {
    const { id } = req.params;
    const { montant_opération, nom_opération, date_modification, moyen_paiement, lieu, compteId, categorieId } = req.body;

    // Recherche de l'opération à mettre à jour
    const operation = await Operation.findByPk(id);
    if (!operation) {
      return res.status(404).json({ error: "Opération non trouvée." });
    }

    // Validation des champs (seulement si présents dans le body)
    if (montant_opération !== undefined && !validator.isDecimal(montant_opération.toString())) {
      return res.status(400).json({ error: "Le montant de l'opération doit être un nombre décimal." });
    }
    if (nom_opération !== undefined && !validator.isLength(nom_opération, { min: 1, max: 100 })) {
      return res.status(400).json({ error: "Le nom de l'opération doit faire 1 à 100 caractères." });
    }
    if (date_modification !== undefined && !validator.isISO8601(date_modification)) {
      return res.status(400).json({ error: "La date de modification doit être une date valide." });
    }
    if (moyen_paiement !== undefined && !validator.isLength(moyen_paiement, { min: 1, max: 50 })) {
      return res.status(400).json({ error: "Le moyen de paiement doit faire 1 à 50 caractères." });
    }
    if (lieu !== undefined && !validator.isLength(lieu, { min: 1, max: 100 })) {
      return res.status(400).json({ error: "Le lieu doit faire 1 à 100 caractères." });
    }
    if (compteId !== undefined && !validator.isInt(compteId.toString(), { min: 1 })) {
      return res.status(400).json({ error: "Le compte associé doit être un entier positif." });
    }
    if (categorieId !== undefined && !validator.isInt(categorieId.toString(), { min: 1 })) {
      return res.status(400).json({ error: "La catégorie associée doit être un entier positif." });
    }

    // Mise à jour de l'opération
    await operation.update({
      montant_opération,
      nom_opération,
      date_modification,
      moyen_paiement,
      lieu,
      compteId,
      categorieId
    });

    res.status(200).json(operation);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}
// --------------------------------------------------------------------


export async function deleteOperation(req, res) {
  try {
    const { id } = req.params;

    const operation = await Operation.findByPk(id);

    if (!operation) return res.status(404).json({ error: 'Opération non trouvée' });

    await operation.destroy();

    res.json({ message: 'Opération supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

