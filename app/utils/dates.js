// Bornes d'un mois au format YYYY-MM-DD : [début inclus, début du mois suivant exclu]
export function monthRange(annee, mois) {
  const pad = (n) => String(n).padStart(2, '0');
  const nextYear = mois === 12 ? annee + 1 : annee;
  const nextMonth = mois === 12 ? 1 : mois + 1;
  return [`${annee}-${pad(mois)}-01`, `${nextYear}-${pad(nextMonth)}-01`];
}

// Format DD/MM/YYYY à partir d'une date YYYY-MM-DD (sans décalage de fuseau horaire)
export function formatDate(date) {
  if (!date) return "";
  const [year, month, day] = String(date).slice(0, 10).split('-');
  return `${day}/${month}/${year}`;
}
