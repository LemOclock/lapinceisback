import validator from 'validator';
import { Op } from 'sequelize';
import { Operation, Categorie } from '../models/associations.js';
import { uploadImage } from '../config/cloudinary.js';
import { findUserCompte, signedAmount } from '../utils/ownership.js';
import { monthRange } from '../utils/dates.js';
import { serverError } from '../middlewares/errorHandler.js';

const CATEGORIE_INCLUDE = { model: Categorie, attributes: ['id', 'nom_categorie', 'icone', 'type_categorie'] };
const isIsoDate = (value) => typeof value === 'string' && validator.isDate(value, { format: 'YYYY-MM-DD', strictMode: true });

// Valide les champs d'une opération. partial = true pour une modification
async function validateOperation(body, partial) {
    const { montant_operation, nom_operation, moyen_paiement, lieu, categorieId, date_operation, type_operation } = body || {};
    const data = {};

    if (type_operation !== undefined || !partial) {
        if (type_operation !== 'revenu' && type_operation !== 'depense') {
            return { error: "Le type d'opération doit être \"revenu\" ou \"depense\"." };
        }
        data.type_operation = type_operation;
    }
    if (montant_operation !== undefined || !partial) {
        if (montant_operation === undefined || montant_operation === null || montant_operation === ''
            || !validator.isDecimal(String(montant_operation), { decimal_digits: '0,2' })
            || parseFloat(montant_operation) === 0 || Math.abs(parseFloat(montant_operation)) >= 1e8) {
            return { error: 'Le montant doit être un nombre non nul (2 décimales max).' };
        }
        data.montant_operation = montant_operation;
    }
    if (nom_operation !== undefined || !partial) {
        if (typeof nom_operation !== 'string' || !validator.isLength(nom_operation.trim(), { min: 1, max: 150 })) {
            return { error: "Le nom de l'opération doit faire 1 à 150 caractères." };
        }
        data.nom_operation = nom_operation.trim();
    }
    if (moyen_paiement !== undefined) {
        if (moyen_paiement !== null && (typeof moyen_paiement !== 'string' || !validator.isLength(moyen_paiement, { max: 30 }))) {
            return { error: 'Le moyen de paiement doit faire 30 caractères maximum.' };
        }
        data.moyen_paiement = moyen_paiement ? moyen_paiement.trim() : null;
    }
    if (lieu !== undefined) {
        if (lieu !== null && (typeof lieu !== 'string' || !validator.isLength(lieu, { max: 100 }))) {
            return { error: 'Le lieu doit faire 100 caractères maximum.' };
        }
        data.lieu = lieu ? lieu.trim() : null;
    }
    if (date_operation !== undefined || !partial) {
        if (!isIsoDate(date_operation)) {
            return { error: "La date de l'opération doit être au format AAAA-MM-JJ." };
        }
        data.date_operation = date_operation;
    }
    if (categorieId !== undefined || !partial) {
        if (categorieId === undefined || categorieId === null || !validator.isInt(String(categorieId), { min: 1 })) {
            return { error: 'La catégorie est requise.' };
        }
        const categorie = await Categorie.findByPk(categorieId);
        if (!categorie) {
            return { error: 'Catégorie non trouvée.' };
        }
        data.categorieId = categorieId;
    }
    return { data };
}

// Récupère une opération appartenant au compte de l'utilisateur
async function findOwnedOperation(req, compte) {
    return Operation.findOne({
        where: { id: req.params.id, compteId: compte.id },
        include: [CATEGORIE_INCLUDE]
    });
}

// --------------------------------------------------------------------

export async function createOperationAccount(req, res) {
    try {
        const compte = await findUserCompte(req.user.id);
        if (!compte) {
            return res.status(404).json({ error: 'Compte non trouvé pour l\'utilisateur.' });
        }

        const { data, error } = await validateOperation(req.body, false);
        if (error) return res.status(400).json({ error });

        let image_operation = null;
        if (req.file) {
            try {
                image_operation = await uploadImage(req.file.buffer);
            } catch (uploadError) {
                console.error(uploadError);
                return res.status(400).json({ error: 'Erreur lors de l\'upload de l\'image.' });
            }
        }

        const operation = await Operation.create({
            ...data,
            montant_operation: signedAmount(data.montant_operation, data.type_operation),
            compteId: compte.id,
            image_operation
        });

        res.status(201).json(operation);
    } catch (error) {
        serverError(res, error);
    }
}

// --------------------------------------------------------------------

export async function getOperationByIdAccount(req, res) {
    try {
        const compte = await findUserCompte(req.user.id);
        if (!compte) return res.status(404).json({ error: 'Compte non trouvé pour l\'utilisateur.' });

        const operation = await findOwnedOperation(req, compte);
        if (!operation) return res.status(404).json({ error: 'Opération non trouvée' });
        res.json(operation);
    } catch (error) {
        serverError(res, error);
    }
}

// --------------------------------------------------------------------

// Toutes les opérations de l'utilisateur connecté
export async function getAllOperationsAccount(req, res) {
    try {
        const compte = await findUserCompte(req.user.id);
        if (!compte) return res.json([]);

        const operations = await Operation.findAll({
            where: { compteId: compte.id },
            include: [CATEGORIE_INCLUDE],
            order: [['date_operation', 'DESC'], ['id', 'DESC']]
        });
        res.json(operations);
    } catch (error) {
        serverError(res, error);
    }
}

// --------------------------------------------------------------------

// Opérations d'un mois : /operations/account/month?month=7&year=2025
export async function getOperationsByMonthAccount(req, res) {
    try {
        const { month, year } = req.query;
        if (!validator.isInt(String(month ?? ''), { min: 1, max: 12 }) || !validator.isInt(String(year ?? ''), { min: 2000, max: 2100 })) {
            return res.status(400).json({ error: 'Paramètres month (1-12) et year requis.' });
        }

        const compte = await findUserCompte(req.user.id);
        if (!compte) return res.json([]);

        const [start, end] = monthRange(parseInt(year, 10), parseInt(month, 10));
        const operations = await Operation.findAll({
            where: {
                compteId: compte.id,
                date_operation: { [Op.gte]: start, [Op.lt]: end }
            },
            include: [CATEGORIE_INCLUDE],
            order: [['date_operation', 'ASC'], ['id', 'ASC']]
        });
        res.json(operations);
    } catch (error) {
        serverError(res, error);
    }
}

// --------------------------------------------------------------------

export async function updateOperationAccount(req, res) {
    try {
        const compte = await findUserCompte(req.user.id);
        if (!compte) {
            return res.status(404).json({ error: 'Compte non trouvé pour l\'utilisateur.' });
        }

        // Trouver l'opération ET vérifier qu'elle appartient au compte
        const operation = await findOwnedOperation(req, compte);
        if (!operation) {
            return res.status(404).json({ error: 'Opération non trouvée ou non autorisée.' });
        }

        const { data, error } = await validateOperation(req.body, true);
        if (error) return res.status(400).json({ error });

        if (req.file) {
            try {
                data.image_operation = await uploadImage(req.file.buffer);
            } catch (uploadError) {
                console.error(uploadError);
                return res.status(400).json({ error: 'Erreur lors de l\'upload de l\'image.' });
            }
        }

        // Le signe du montant suit toujours le type de l'opération
        const type = data.type_operation ?? operation.type_operation;
        const montant = data.montant_operation ?? operation.montant_operation;
        data.montant_operation = signedAmount(montant, type);

        await operation.update(data);
        await operation.reload({ include: [CATEGORIE_INCLUDE] });

        res.status(200).json({
            success: true,
            message: 'Opération modifiée avec succès',
            operation
        });
    } catch (error) {
        serverError(res, error);
    }
}

// --------------------------------------------------------------------

export async function deleteOperationAccount(req, res) {
    try {
        const compte = await findUserCompte(req.user.id);
        if (!compte) {
            return res.status(404).json({ error: 'Compte non trouvé pour l\'utilisateur.' });
        }

        const operation = await findOwnedOperation(req, compte);
        if (!operation) {
            return res.status(404).json({ error: 'Opération non trouvée ou non autorisée.' });
        }

        await operation.destroy();

        res.json({ message: 'Opération supprimée avec succès' });
    } catch (error) {
        serverError(res, error);
    }
}

// ----------------------------------------------------------------

export async function getOperationByDateAccount(req, res) {
    try {
        const { date_operation } = req.query;
        if (!isIsoDate(date_operation)) {
            return res.status(400).json({ error: 'Date requise au format AAAA-MM-JJ.' });
        }

        const compte = await findUserCompte(req.user.id);
        if (!compte) {
            return res.status(404).json({ error: 'Compte non trouvé pour l\'utilisateur.' });
        }

        const operations = await Operation.findAll({
            where: {
                compteId: compte.id,
                date_operation
            },
            include: [CATEGORIE_INCLUDE],
            order: [['id', 'ASC']]
        });

        res.json(operations);
    } catch (error) {
        serverError(res, error);
    }
}
