import validator from 'validator';
import bcrypt from 'bcrypt';
import Utilisateur from "../models/Utilisateur.js";
import { createUserWithValidation } from '../utils/validationRegister.js'



const authController = {

  login: function (req, res) {
    res.status(200).json({
      page: 'login',
      title: 'Connexion'
    });
  },

  loginAction: async function (req, res) {
    try {
      const email = req.body.email.trim().toLowerCase();
      const foundUser = await Utilisateur.findOne({ where: { email } });
      if (foundUser) {
        bcrypt.compare(req.body.mot_de_passe, foundUser.mot_de_passe, function (err, result) {
          if (result) {
            req.session.isLogged = true;
            req.session.userEmail = foundUser.email;
            res.status(200).json({
              success: true,
              message: 'Connexion réussie',
              redirectUrl: '/profil'
            });
          } else {
            res.status(401).json({
              success: false,
              error: 'Mauvais couple identifiant/mot de passe'
            });
          }
        });
      } else {
        throw new Error('Mauvais couple identifiant/mot de passe');
      }
    } catch (error) {
      res.status(401).json({
        success: false,
        error: error.message
      });
    }
  },

  signup: function (req, res) {
    res.status(200).json({
      page: 'register',
      title: 'Inscription'
    });
  },

  signupAction: async function (req, res) {
    try {
      const newUser = await createUserWithValidation(req.body);

      req.session.isLogged = true;
      req.session.userEmail = newUser.email;

      res.status(201).json({
        success: true,
        message: 'Inscription réussie',
        redirectUrl: '/profil',
        user: {
          id: newUser.id,
          email: newUser.email,
          prenom: newUser.prenom,
          nom: newUser.nom
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  },

  logout: function(req, res) {
    req.session.destroy();
    res.status(200).json({
      success: true,
      message: 'Déconnexion réussie',
      redirectUrl: '/'
    });
  },

};

export default authController; 