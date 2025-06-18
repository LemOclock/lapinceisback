// Middleware pour vérifier si l'utilisateur est admin ou propriétaire du compte
function isOwner(req, res, next) {
  // Vérifie si l'utilisateur connecté est admin
  const isAdmin = req.session.user.role === 'admin';

  // Vérifie si l'utilisateur connecté agit sur son propre compte
  // req.session.user.id : id de l'utilisateur connecté (stocké en session)
  // req.params.id : id présent dans l'URL (ex: /utilisateur/7)
  // On compare les deux pour s'assurer que l'utilisateur ne modifie/supprime que son propre compte
  const isOwner = req.session.user.id === Number(req.params.id);

  // Si l'utilisateur est admin OU propriétaire du compte, on laisse passer la requête
  if (isAdmin || isOwner) {
    next();
  } else {
    // Sinon, on bloque l'accès
    res.status(403).json({ error: 'Accès interdit.' });
  }
}

export default isOwner;