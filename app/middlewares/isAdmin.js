function isAdmin(req, res, next) {
  if (!req.session.user || req.session.user.role !== 'admin') {
    res.status(403).json({
      success: false,
      error: 'Forbidden',
      message: 'Accès réservé aux administrateurs.'
    });
  } else {
    next();
  }
}

export default isAdmin;