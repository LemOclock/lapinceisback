# Déploiement de La Pince (serveur avec Caddy existant)

Architecture :

```
Internet ──443──> Caddy (hôte, HTTPS) ──> 127.0.0.1:8090  web (Nginx : site statique)
                                                            └── /api/* ──> api (Node, réseau Docker)
                                                                            └──> db (PostgreSQL, réseau interne)
```

Seul `127.0.0.1:8090` est publié. La base et l'API n'ont aucun port exposé sur l'hôte.

## 1. Récupérer le code

```bash
mkdir -p ~/lapince && cd ~/lapince
git clone https://github.com/LemOclock/lapinceisback.git
git clone https://github.com/LemOclock/lapinceisfront.git
```

## 2. Configurer les secrets

```bash
cd ~/lapince/lapinceisback/deploy
cp .env.example .env
sed -i "s/^POSTGRES_PASSWORD=.*/POSTGRES_PASSWORD=$(openssl rand -hex 32)/" .env
sed -i "s/^JWT_SECRET=.*/JWT_SECRET=$(openssl rand -hex 32)/" .env
chmod 600 .env
```

Vérifier que `WEB_PORT` (8090 par défaut) est libre : `ss -tlnp | grep 8090`.

## 3. Lancer

```bash
docker compose up -d --build
docker compose ps                 # db "healthy", api et web "running"
docker compose logs api --tail 30 # doit finir par "Serveur lancé sur le port 3000"
curl -s http://127.0.0.1:8090/api/   # {"success":true,"message":"API La Pince opérationnelle"}
```

Au démarrage, l'API crée les tables manquantes et insère les catégories (idempotent).

## 4. Caddy de l'hôte

Ajouter le bloc de `Caddyfile.example` (avec le bon domaine) à `/etc/caddy/Caddyfile`, puis :

```bash
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

Prérequis pour le certificat Let's Encrypt :
- enregistrement DNS **A** du domaine vers l'IPv4 publique ;
- ports **80 et 443** de la box redirigés vers le serveur.

> ⚠️ **Sites internes exposés** : une fois 80/443 ouverts sur la box, tous les blocs du Caddyfile
> deviennent joignables depuis Internet (il suffit d'envoyer le bon nom d'hôte à l'IP publique),
> même si leur DNS pointe vers une IP Tailscale. Restreindre les sites privés, par exemple :
>
> ```
> camera.home.belema.uk {
> 	@externe not remote_ip 100.64.0.0/10 127.0.0.1/8
> 	abort @externe
> 	# ... configuration existante ...
> }
> ```
>
> (ou `bind <IP Tailscale>` dans le bloc). À valider avant d'ouvrir les ports.

## Mise à jour

```bash
cd ~/lapince/lapinceisfront && git pull
cd ~/lapince/lapinceisback && git pull
cd deploy && docker compose up -d --build
```

## Sauvegarde de la base

```bash
cd ~/lapince/lapinceisback/deploy
docker compose exec -T db pg_dump -U lapince -d lapince | gzip > ~/lapince-$(date +%F).sql.gz
```

Restauration :

```bash
gunzip -c ~/lapince-AAAA-MM-JJ.sql.gz | docker compose exec -T db psql -U lapince -d lapince
```

À automatiser avec une tâche cron quotidienne (et copier les sauvegardes hors du serveur).

## Donner le rôle admin

```bash
docker compose exec db psql -U lapince -d lapince -c "UPDATE utilisateur SET role='admin' WHERE email='vous@exemple.fr';"
```
