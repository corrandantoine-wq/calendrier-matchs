# 📍 Carte Clients

Web app (installable sur mobile) qui affiche la **base clients commune de l'équipe** sur une carte et montre **en temps réel** les clients les plus proches de chaque collaborateur.

## Fonctionnalités
- **Comptes collaborateurs** (e-mail + mot de passe). Seules les adresses autorisées par un administrateur ont accès.
- **Base clients commune** : tout le monde voit les mêmes clients. Les ajouts des collègues apparaissent en direct.
- **Favoris personnels** : chacun marque ses clients d'une étoile et peut n'afficher que ses favoris.
- **HubSpot** : chaque client peut être relié à sa fiche HubSpot. La fiche affiche alors des champs du CRM, choisis par l'administrateur, avec un lien « Ouvrir dans HubSpot ».
- **Position en direct**, choix du rayon (1 à 100 km), liste triée par distance, itinéraire Google Maps ou Waze, appel, e-mail.
- **Import et export CSV**, avec géocodage automatique des adresses.
- **Administration** (menu ☰) : gérer les collaborateurs, choisir les champs HubSpot affichés, vider la base.

## Architecture
| Élément | Rôle |
|---|---|
| `index.html`, `app.js`, `style.css` | L'appli (statique, hébergée sur GitHub Pages) |
| `config.js` | Adresse du projet Supabase et clé publique « anon » |
| `supabase/migrations/001_init.sql` | Tables, règles de sécurité et temps réel |
| `supabase/functions/hubspot/` | Passerelle sécurisée vers HubSpot (le jeton HubSpot reste sur le serveur) |

La sécurité repose sur les règles **Row Level Security** de la base :
- Un compte dont l'adresse n'est pas dans `members` ne voit **rien**.
- Les favoris sont visibles par leur seul propriétaire.
- Seuls l'auteur d'un client ou un admin peuvent le supprimer.
- Seuls les admins gèrent les collaborateurs et les champs CRM.

## Installation (une seule fois, environ 20 minutes)

### 1. Créer le projet Supabase
1. Créez un compte sur [supabase.com](https://supabase.com), puis **New project**.
2. Région : choisissez une région **européenne** (Paris ou Frankfurt), pour le RGPD.
3. Notez le mot de passe de la base (il ne servira pas dans l'appli).

### 2. Créer les tables
1. Dans Supabase, ouvrez **SQL Editor → New query**.
2. Collez tout le contenu de `supabase/migrations/001_init.sql`, puis cliquez sur **Run**.
3. Déclarez-vous administrateur. Dans une nouvelle requête, avec **votre** adresse :
   ```sql
   insert into public.members (email, role) values ('prenom.nom@societe.fr', 'admin');
   ```

### 3. Configurer la connexion
1. Ouvrez **Authentication → URL Configuration**.
   - *Site URL* : `https://corrandantoine-wq.github.io/calendrier-matchs/carte-clients/`
   - *Redirect URLs* : ajoutez la même adresse.
2. **Authentication → Sign In / Providers → Email** : laissez « Confirm email » activé.
3. Facultatif mais conseillé : l'envoi d'e-mails intégré à Supabase est limité à quelques messages par heure. Pour une équipe, branchez le serveur d'e-mails de la société dans **Authentication → Emails → SMTP Settings**.

### 4. Relier l'appli au projet
Dans **Project Settings → API**, copiez *Project URL* et la clé *anon public*. Collez-les dans `config.js` :
```js
window.CARTE_CLIENTS_CONFIG = {
  supabaseUrl: 'https://xxxxxxxx.supabase.co',
  supabaseAnonKey: 'eyJhbGciOi...',
};
```
La clé « anon » est faite pour être publique. Ne mettez **jamais** la clé *service_role* dans ce fichier.

### 5. Brancher HubSpot
1. Dans HubSpot, créez une **application privée** : Paramètres → Intégrations → Applications privées (selon votre version : *Development → Legacy apps*).
   - Nom : « Carte Clients ».
   - Scopes : `crm.objects.companies.read` et `crm.schemas.companies.read`.
   - Copiez le **jeton d'accès**.
2. Dans Supabase, ouvrez **Edge Functions → Deploy a new function → Via Editor**.
   - Nom : `hubspot`.
   - Collez le contenu de `supabase/functions/hubspot/index.ts`, puis **Deploy**.
3. Dans **Edge Functions → Secrets**, ajoutez `HUBSPOT_TOKEN` avec le jeton copié.
   - Les clients sont liés aux **entreprises** HubSpot par défaut. Pour les lier aux **contacts**, ajoutez aussi le secret `HUBSPOT_OBJECT` = `contacts`, et les scopes `crm.objects.contacts.read` et `crm.schemas.contacts.read`.

### 6. Mettre en ligne et inviter l'équipe
1. Publiez (fusion dans `main` → GitHub Pages).
2. Connectez-vous : onglet **Créer un compte** avec votre adresse admin, confirmez l'e-mail, puis connectez-vous.
3. Menu ☰ → **Collaborateurs** : ajoutez l'adresse de chaque collègue. Chacun crée ensuite son compte avec cette adresse.
4. Menu ☰ → **Champs HubSpot affichés** : cochez les informations du CRM à montrer sur les fiches.

## Format CSV
Voir `exemple-clients.csv`. Colonnes reconnues automatiquement :
- nom, adresse, code postal, ville, téléphone, e-mail, notes ;
- latitude, longitude ;
- `hubspot_id` : pour relier directement chaque client à sa fiche HubSpot lors de l'import.

## Lancer en local
```bash
cd carte-clients && python3 -m http.server 8000   # puis http://localhost:8000
```
Ajoutez `http://localhost:8000` aux *Redirect URLs* de Supabase pour tester la connexion en local.
