import jwt from 'jsonwebtoken';

const SECRET = 'votre_secret_jwt';

function isAdmin(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Accès réservé aux administrateurs.'
      });
    }
    req.user = user;
    next();
  });
}

export default isAdmin;