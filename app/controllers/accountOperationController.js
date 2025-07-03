import { Operation, Compte, Categorie } from '../models/associations.js';
import validator from 'validator';
import { cloudinary } from '../../index.js';



export async function createOperationAccount(req, res) {
    try {
        const compte = await Compte.findOne({
            where: { utilisateurId: req.user.id }
        });
        if (!compte) {
            return res.status(404).json({ error: 'Compte non trouvé pour l\'utilisateur.' });
        }

        const { montant_operation, nom_operation, moyen_paiement, lieu, categorieId, date_operation, type_operation } = req.body;

        let image_operation = null;
        if (req.file) {
            try {
                const uploadPromise = new Promise((resolve, reject) => {
                    cloudinary.uploader.upload_stream(
                        {
                            resource_type: 'image',
                            folder: 'operations',
                            transformation: [{ width: 800, height: 600, crop: 'limit' }]
                        },
                        (error, result) => {
                            if (error) reject(error);
                            else resolve(result);
                        }
                    ).end(req.file.buffer);
                });

                const uploadResult = await uploadPromise;
                image_operation = uploadResult.secure_url;
            } catch (uploadError) {
                return res.status(400).json({ error: 'Erreur lors de l\'upload de l\'image.' });
            }
        }
        if (!montant_operation || !validator.isDecimal(montant_operation.toString()) && montant_operation === 0) {
            return res.status(400).json({ error: 'Le montant de l\'opération doit être un nombre décimal.' });
        }
        if (nom_operation === null && !validator.isLength(nom_operation, { min: 1, max: 150 })) {
            return res.status(400).json({ error: 'Le nom de l\'opération doit faire 1 à 150 caractères.' });
        }
        if (moyen_paiement === null && !validator.isLength(moyen_paiement, { min: 1, max: 30 })) {
            return res.status(400).json({ error: 'Le moyen de paiement doit faire 1 à 30 caractères.' });
        }

        if (!validator.isLength(lieu, { min: 1, max: 100 })) {
            return res.status(400).json({ error: "Le lieu n'est pas reconnu" });
        }
        if (!categorieId) {
            return res.status(400).json({ error: 'La catégorie est requise.' });
        }

        const categorie = await Categorie.findByPk(categorieId);
        if (!categorie) {
            return res.status(404).json({ error: 'Catégorie non trouvée.' });
        }


        if (!validator.isDate(date_operation)) {
            return res.status(400).json({ error: 'La date de l\'opération doit être une date valide.' });
        }

        if (type_operation != 'revenu' && type_operation != 'depense') {
            return res.status(400).json({ error: "L'opération n'est pas valide" });
        }

        const operation = await Operation.create({
            montant_operation,
            nom_operation,
            moyen_paiement,
            lieu,
            date_operation,
            type_operation,
            compteId: compte.id,
            categorieId,
            image_operation
        });

        res.status(201).json(operation);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// --------------------------------------------------------------------

export async function getOperationByIdAccount(req, res) {
    try {
        const operation = await Operation.findByPk(req.params.id);
        if (!operation) return res.status(404).json({ error: 'Opération non trouvée' });
        res.json(operation);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// --------------------------------------------------------------------

export async function getAllOperationsAccount(req, res) {
    try {
        const operations = await Operation.findAll();
        res.json(operations);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}


// --------------------------------------------------------------------

export async function updateOperationAccount(req, res) {
    try {
        const { id } = req.params;

        // Vérifier le compte de l'utilisateur
        const compte = await Compte.findOne({
            where: { utilisateurId: req.user.id }
        });

        if (!compte) {
            return res.status(404).json({ error: 'Compte non trouvé pour l\'utilisateur.' });
        }

        // Trouver l'opération ET vérifier qu'elle appartient au compte
        const operation = await Operation.findOne({
            where: {
                id: id,
                compteId: compte.id // Vérification de propriétaire
            }
        });

        if (!operation) {
            return res.status(404).json({ error: 'Opération non trouvée ou non autorisée.' });
        }

        const { montant_operation, nom_operation, moyen_paiement, lieu, categorieId, date_operation, type_operation } = req.body;

        let image_operation = operation.image_operation; // Garder l'ancienne par défaut

        if (req.file) {
            try {
                const uploadPromise = new Promise((resolve, reject) => {
                    cloudinary.uploader.upload_stream(
                        {
                            resource_type: 'image',
                            folder: 'operations',
                            transformation: [{ width: 800, height: 600, crop: 'limit' }]
                        },
                        (error, result) => {
                            if (error) reject(error);
                            else resolve(result);
                        }
                    ).end(req.file.buffer);
                });

                const uploadResult = await uploadPromise;
                image_operation = uploadResult.secure_url;
            } catch (uploadError) {
                return res.status(400).json({ error: 'Erreur lors de l\'upload de l\'image.' });
            }
        }

        // Validations (seulement si les champs sont fournis)
        if (montant_operation !== undefined) {
            if (!montant_operation || !validator.isDecimal(montant_operation.toString())) {
                return res.status(400).json({ error: 'Le montant de l\'opération doit être un nombre décimal.' });
            }
        }

        if (nom_operation !== undefined) {
            if (!nom_operation || !validator.isLength(nom_operation, { min: 1, max: 150 })) {
                return res.status(400).json({ error: 'Le nom de l\'opération doit faire 1 à 150 caractères.' });
            }
        }

        if (moyen_paiement !== undefined) {
            if (!moyen_paiement || !validator.isLength(moyen_paiement, { min: 1, max: 30 })) {
                return res.status(400).json({ error: 'Le moyen de paiement doit faire 1 à 30 caractères.' });
            }
        }

        if (lieu !== undefined) {
            if (!validator.isLength(lieu, { min: 1, max: 100 })) {
                return res.status(400).json({ error: "Le lieu n'est pas reconnu" });
            }
        }

        if (categorieId !== undefined) {
            if (!categorieId) {
                return res.status(400).json({ error: 'La catégorie est requise.' });
            }

            const categorie = await Categorie.findByPk(categorieId);
            if (!categorie) {
                return res.status(404).json({ error: 'Catégorie non trouvée.' });
            }
        }

        if (date_operation !== undefined) {
            if (!validator.isDate(date_operation)) {
                return res.status(400).json({ error: 'La date de l\'opération doit être une date valide.' });
            }
        }

        if (type_operation !== undefined) {
            if (type_operation != 'revenu' && type_operation != 'depense') {
                return res.status(400).json({ error: "L'opération n'est pas valide" });
            }
        }

        // Préparer les données de mise à jour
        const updateData = {};

        // Vérifier chaque champ et l'ajouter s'il est fourni
        if (montant_operation !== undefined) {
            updateData.montant_operation = montant_operation;
        }

        if (nom_operation !== undefined) {
            updateData.nom_operation = nom_operation;
        }

        if (moyen_paiement !== undefined) {
            updateData.moyen_paiement = moyen_paiement;
        }

        if (lieu !== undefined) {
            updateData.lieu = lieu;
        }

        if (date_operation !== undefined) {
            updateData.date_operation = date_operation;
        }

        if (type_operation !== undefined) {
            updateData.type_operation = type_operation;
        }

        if (categorieId !== undefined) {
            updateData.categorieId = categorieId;
        }

        updateData.image_operation = image_operation;

        await operation.update(updateData);

        res.status(200).json({
            success: true,
            message: 'Opération modifiée avec succès',
            operation
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
// --------------------------------------------------------------------


export async function deleteOperationAccount(req, res) {
    try {
        const { id } = req.params;

        const compte = await Compte.findOne({
            where: { utilisateurId: req.user.id }
        });

        if (!compte) {
            return res.status(404).json({ error: 'Compte non trouvé pour l\'utilisateur.' });
        }

        const operation = await Operation.findOne({
            where: {
                id: id,
                compteId: compte.id
            }
        });

        if (!operation) {
            return res.status(404).json({ error: 'Opération non trouvée ou non autorisée.' });
        }

        await operation.destroy();

        res.json({ message: 'Opération supprimée avec succès' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// ----------------------------------------------------------------

export async function getOperationByDateAccount(req, res) {
    try {
        const compte = await Compte.findOne({
            where: { utilisateurId: req.user.id }
        });

        if (!compte) {
            return res.status(404).json({ error: 'Compte non trouvé pour l\'utilisateur.' });
        }

        const { date_operation } = req.query;
        console.log(date_operation);

        if (!date_operation) {
            return res.status(400).json({ error: 'La date est requise.' });
        }

        if (!validator.isDate(date_operation)) {
            return res.status(400).json({ error: 'Format de date invalide' });
        }

        const operations = await Operation.findAll({
            where: {
                compteId: compte.id,
                date_operation: date_operation
            },
            include: [
                {
                    model: Categorie,
                    attributes: ['nom_categorie', 'icone']
                }
            ],
            order: [['date_operation', 'DESC']]
        });

        res.json(operations);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}