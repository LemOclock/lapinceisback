import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Utilisateur, Compte } from '../models/associations.js';
import { createUserWithValidation } from '../utils/validationRegister.js';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config/env.js';
import { serverError } from '../middlewares/errorHandler.js';

// Hash factice : permet de garder un temps de réponse identique que l'email existe ou non
const DUMMY_HASH = bcrypt.hashSync('mot-de-passe-factice', 10);

const authController = {

  loginAction: async function (req, res) {
    try {
      const { email, mot_de_passe } = req.body || {};
      if (typeof email !== 'string' || typeof mot_de_passe !== 'string') {
        return res.status(400).json({ success: false, error: 'Email et mot de passe requis' });
      }

      const foundUser = await Utilisateur.findOne({ where: { email: email.trim().toLowerCase() } });
      const isPasswordValid = await bcrypt.compare(mot_de_passe, foundUser ? foundUser.mot_de_passe : DUMMY_HASH);

      if (!foundUser || !isPasswordValid) {
        return res.status(401).json({
          success: false,
          error: 'Mauvais couple identifiant/mot de passe'
        });
      }

      const userAccount = await Compte.findOne({
        where: { utilisateurId: foundUser.id }
      });

      const token = jwt.sign(
        { id: foundUser.id, email: foundUser.email, role: foundUser.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN, algorithm: 'HS256' }
      );

      res.status(200).json({
        token,
        success: true,
        message: 'Connexion réussie',
        redirectUrl: userAccount ? '/dashboard' : '/config',
        user: {
          id: foundUser.id,
          email: foundUser.email,
          prenom: foundUser.prenom,
          nom: foundUser.nom
        }
      });
    } catch (error) {
      serverError(res, error);
    }
  },

  signupAction: async function (req, res) {
    try {
      const newUser = await createUserWithValidation(req.body || {});

      res.status(201).json({
        success: true,
        message: 'Inscription réussie',
        redirectUrl: '/login',
        user: {
          id: newUser.id,
          email: newUser.email,
          prenom: newUser.prenom,
          nom: newUser.nom
        }
      });
    } catch (error) {
      if (error.isValidation) {
        return res.status(400).json({ success: false, error: error.message });
      }
      serverError(res, error);
    }
  },

  // Le JWT est stocké côté client : la déconnexion consiste à le supprimer côté front
  logout: function (req, res) {
    res.status(200).json({
      success: true,
      message: 'Déconnexion réussie',
      redirectUrl: '/'
    });
  },

};

export default authController;
