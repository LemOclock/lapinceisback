// À utiliser après isLogged : vérifie que l'utilisateur a le rôle admin
function isAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Accès refusé',
      message: 'Accès réservé aux administrateurs'
    });
  }
  next();
}

export default isAdmin;
