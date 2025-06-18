import sequelize from './app/database.js';
import { Utilisateur, Compte, Categorie, Operation, Budget, Alerte } from './app/models/associations.js';
import bcrypt from 'bcrypt';

async function seed() {
  try {
    // Synchronise la base (drop & recreate)
    await sequelize.sync({ force: true });
    console.log('Base synchronisée.');

    // Création des utilisateurs
    const admin = await Utilisateur.create({
      email: 'admin@admin.com',
      mot_de_passe: await bcrypt.hash('admin123', 10),
      prenom: 'Admin',
      nom: 'Super',
      numero_telephone: 600000001,
      role: 'admin'
    });
    const user = await Utilisateur.create({
      email: 'user@lapince.com',
      mot_de_passe: await bcrypt.hash('user123', 10),
      prenom: 'Jean',
      nom: 'Dupont',
      numero_telephone: 600000002,
      role: 'user'
    });
    console.log('Utilisateurs créés.');

    // Création de catégories
    const catAlim = await Categorie.create({
      nom_categorie: 'Alimentation',
      description: 'Courses, restaurants, etc.',
      couleur: '#FF5733',
      icone: 'food'
    });
    const catTrans = await Categorie.create({
      nom_categorie: 'Transport',
      description: 'Bus, train, essence, etc.',
      couleur: '#33C1FF',
      icone: 'car'
    });
    console.log('Catégories créées.');

    // Création d'un compte pour le user
    const compteUser = await Compte.create({
      nom_compte: 'Compte courant',
      banque: 'BNP',
      solde_initial: 1200.00,
      devise: 'EUR',
      utilisateurId: user.id
    });
    console.log('Compte créé.');

    // Création d'opérations
    const op1 = await Operation.create({
      montant_opération: 50.00,
      nom_opération: 'Courses Carrefour',
      compteId: compteUser.id,
      categorieId: catAlim.id,
      image_operation: null,
      moyen_paiement: 'carte',
      lieu: 'Carrefour Paris'
    });
    const op2 = await Operation.create({
      montant_opération: 20.00,
      nom_opération: 'Ticket de bus',
      compteId: compteUser.id,
      categorieId: catTrans.id,
      image_operation: null,
      moyen_paiement: 'espèces',
      lieu: 'RATP'
    });
    console.log('Opérations créées.');

    // Création d'un budget pour alimentation
    const budgetAlim = await Budget.create({
      montant_limite: 300.00,
      seuil_alerte: 80.00,
      nom_budget: 'Budget courses',
      compteId: compteUser.id,
      categorieId: catAlim.id
    });
    // Création d'un budget pour transport
    const budgetTrans = await Budget.create({
      montant_limite: 100.00,
      seuil_alerte: 90.00,
      nom_budget: 'Budget transport',
      compteId: compteUser.id,
      categorieId: catTrans.id
    });
    console.log('Budgets créés.');

    // Création d'alertes
    await Alerte.create({
      type_alerte: 'seuil',
      message: 'Vous avez atteint 80% de votre budget courses.',
      date_lecture: null,
      niveau_urgence: 'warning',
      budgetId: budgetAlim.id
    });
    await Alerte.create({
      type_alerte: 'dépassement',
      message: 'Vous avez dépassé votre budget transport.',
      date_lecture: null,
      niveau_urgence: 'critical',
      budgetId: budgetTrans.id
    });
    console.log('Alertes créées.');

    console.log('Seed terminé avec succès !');
    process.exit(0);
  } catch (error) {
    console.error('Erreur lors du seed :', error);
    process.exit(1);
  }
}

seed();