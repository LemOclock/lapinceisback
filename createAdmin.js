// fichier: scripts/createAdmin.js
import Utilisateur from '../projet-la-pince-back/app/models/Utilisateur.js';
import bcrypt from 'bcrypt';


async function createAdmin() {
  const hash1 = await bcrypt.hash('motdepassefort', 10);
  await Utilisateur.create({
    email: 'admin2@admin.com',
    mot_de_passe: hash1,
    prenom: 'Admin',
    nom: 'Super',
    numero_telephone: '0600000000',
    role: 'admin'
  });

  // Nouvel admin
  const hash2 = await bcrypt.hash('Admin1234!Test', 10);
  await Utilisateur.create({
    email: 'admin3@admin.com',
    mot_de_passe: hash2,
    prenom: 'Admin',
    nom: 'Second',
    numero_telephone: '0611111111',
    role: 'admin'
  });

  console.log('Admins créés !');
  process.exit();
}
  

createAdmin();