import validator from 'validator';
import bcrypt from 'bcrypt';
import Utilisateur from '../models/Utilisateur.js';

export const PASSWORD_OPTIONS = { minLength: 12, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 };
export const PASSWORD_MESSAGE = 'Le mot de passe doit comporter au moins 12 caractères et au moins 1 majuscule, 1 minuscule, 1 chiffre et 1 caractère spécial';

// Erreur de validation : son message peut être renvoyé tel quel au client
export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.isValidation = true;
  }
}

const isText = (value, max) => typeof value === 'string' && validator.isLength(value.trim(), { min: 1, max });

export function isValidPhone(value) {
  return typeof value === 'string' && /^\+?[0-9 .-]{6,18}$/.test(value);
}

export async function createUserWithValidation(body) {
    // Validation du mot de passe (bcrypt ignore au-delà de 72 octets)
    if (typeof body.mot_de_passe !== 'string' || body.mot_de_passe.length > 72 || !validator.isStrongPassword(body.mot_de_passe, PASSWORD_OPTIONS)) {
        throw new ValidationError(PASSWORD_MESSAGE);
    }

    // Validation de l'email
    if (typeof body.email !== 'string' || !validator.isEmail(body.email.trim()) || body.email.length > 100) {
        throw new ValidationError('Email invalide.');
    }
    const email = body.email.trim().toLowerCase();

    // Validation du prénom
    if (!isText(body.prenom, 50)) {
        throw new ValidationError("Le prénom est requis (1-50 caractères).");
    }

    // Validation du nom
    if (!isText(body.nom, 50)) {
        throw new ValidationError("Le nom est requis (1-50 caractères).");
    }

    // Validation du téléphone (facultatif)
    const numero_telephone = body.numero_telephone ? String(body.numero_telephone).trim() : null;
    if (numero_telephone && !isValidPhone(numero_telephone)) {
        throw new ValidationError('Numéro de téléphone invalide.');
    }

    // Vérifie si un utilisateur existe déjà avec cet email ou ce téléphone
    const existingUser = await Utilisateur.findOne({ where: { email } });
    if (existingUser) {
        throw new ValidationError('Cet email est déjà utilisé.');
    }
    if (numero_telephone && await Utilisateur.findOne({ where: { numero_telephone } })) {
        throw new ValidationError('Ce numéro de téléphone est déjà utilisé.');
    }

    // Hash du mot de passe
    const hash = await bcrypt.hash(body.mot_de_passe, 10);

    // Création de l'utilisateur (le rôle est toujours "user" à l'inscription)
    return Utilisateur.create({
        email,
        mot_de_passe: hash,
        prenom: body.prenom.trim(),
        nom: body.nom.trim(),
        numero_telephone,
        role: 'user'
    });
}

export { createUserWithValidation as validationRegister };
