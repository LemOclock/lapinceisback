// Route inconnue
export function notFound(req, res) {
  res.status(404).json({ success: false, message: "La page demandée n'a pas été trouvée." });
}

// Gestionnaire d'erreurs global : on journalise côté serveur, sans exposer les détails au client
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, error: 'JSON invalide.' });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ success: false, error: 'Requête trop volumineuse.' });
  }
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ success: false, error: 'Image trop volumineuse (5 Mo max).' });
  }
  if (err.message === 'INVALID_FILE_TYPE') {
    return res.status(400).json({ success: false, error: 'Seules les images sont acceptées.' });
  }

  console.error(err);
  res.status(500).json({ success: false, error: 'Erreur interne du serveur.' });
}

// Réponse 500 générique depuis un contrôleur
export function serverError(res, error) {
  console.error(error);
  return res.status(500).json({ success: false, error: 'Erreur interne du serveur.' });
}
