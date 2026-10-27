// À brancher avec router.param('id', validateId) : rejette les identifiants non numériques
export default function validateId(req, res, next, id) {
  if (!/^[1-9][0-9]{0,9}$/.test(id)) {
    return res.status(400).json({ success: false, error: 'Identifiant invalide' });
  }
  next();
}
