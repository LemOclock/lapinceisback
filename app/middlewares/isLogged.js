function isLogged(req, res, next) {
  if (!req.session.isLogged) {
    res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Vous n\'êtes pas autorisé à accéder à la page demandée.'
    });
  }
  else {
    next();
  }
}

export default isLogged;