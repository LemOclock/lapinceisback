import { Compte } from '../models/associations.js';

// Renvoie le compte bancaire de l'utilisateur connecté (ou null)
export function findUserCompte(userId) {
  return Compte.findOne({ where: { utilisateurId: userId } });
}

// Une dépense est toujours stockée en négatif, un revenu en positif
export function signedAmount(montant, type_operation) {
  const value = Math.abs(parseFloat(montant));
  return type_operation === 'depense' ? -value : value;
}
