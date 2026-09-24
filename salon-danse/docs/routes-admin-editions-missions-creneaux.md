# Routes admin : éditions, missions, créneaux

Routes de Louis, déployées sur le VPS et protégées par `role:admin`. Le front les appelle depuis
`app/services/actions.ts` (écritures) et `app/services/loaders.ts` (lectures). Le format JSON est
traduit dans `app/services/adapters.ts`, et nulle part ailleurs.

## Éditions

| Méthode | Endpoint | Utilisé par le front |
|---|---|---|
| GET | `/admin/editions` | Barre « Édition » de la page Missions. Les stats et la fiche bénévole se limitent à l'édition active |
| GET | `/admin/editions/{id}` | — |
| POST | `/admin/editions` | « + Édition » : `{ nom, date_debut, date_fin, isActive }` |
| PATCH | `/admin/editions/{id}` | « Modifier » (nom, dates), « Rendre active » (`{ isActive: true }`), « Archiver » (`{ isArchived: true }`), « Restaurer et activer » (`{ isArchived: false, isActive: true }`) |
| DELETE | `/admin/editions/{id}` | « Supprimer » |

Une seule édition est active : en activer une désactive les autres (règle du back).

Côté front :

- une édition archivée est rangée dans « Archives » et s'affiche en lecture seule ;
- le bouton « Archiver » n'apparaît que sur une édition qui n'est pas active.

## Missions

| Méthode | Endpoint | Utilisé par le front |
|---|---|---|
| GET | `/admin/missions?edition_id=` | Liste des missions de l'édition affichée, y compris celles sans créneau |
| POST | `/admin/missions` | « + Nouvelle mission » : `{ edition_id, nom, isSensible }` |
| PATCH | `/admin/missions/{id}` | « Modifier » : `{ nom, isSensible }` |
| DELETE | `/admin/missions/{id}` | « Supprimer » |

## Créneaux

| Méthode | Endpoint | Utilisé par le front |
|---|---|---|
| GET | `/admin/creneaux?edition_id=` | Créneaux de l'édition affichée (paginés, pages de 100) |
| POST | `/admin/creneaux` | « + Créneau » : `{ mission_id, jour, heure_debut, heure_fin, capacite_max }` |
| PATCH | `/admin/creneaux/{id}` | « Modifier » : mêmes champs sans `mission_id` |
| DELETE | `/admin/creneaux/{id}` | « Supprimer » |
| GET | `/admin/creneaux/{id}/inscrits` | Page d'un créneau (liste des inscrits) |

## Règles du back, reprises dans l'interface

- Un créneau doit être compris dans les dates de son édition : le choix du jour est limité à ces dates.
- L'heure de fin doit être après l'heure de début, et la capacité d'au moins 1 : le front vérifie avant d'envoyer.
- La capacité ne peut pas descendre sous le nombre de réservations : c'est le back qui refuse, et son message s'affiche.
- Pas de suppression tant que quelque chose dépend de l'élément :
  - une édition qui a des missions ;
  - une mission qui a des créneaux ;
  - un créneau qui a des réservations.

  Le front bloque d'avance, en 2 clics, avec un message qui dit quoi supprimer d'abord.
  Les inscrits se retirent depuis la page du créneau.

## Mot de passe oublié (routes publiques)

| Méthode | Endpoint | Utilisé par le front |
|---|---|---|
| POST | `/forgot-password` | Page `/mot-de-passe-oublie`, étape 1 : `{ email }`. Le back envoie un code par e-mail |
| POST | `/reset-password` | Étape 2 : `{ email, token, password, password_confirmation }`. Déconnecte toutes les sessions du compte, puis renvoie vers la connexion |

Le lien « Mot de passe oublié ? » est sur la page de connexion. Un lien `/mot-de-passe-oublie?email=…&token=…` ouvre directement l'étape 2 : Louis peut le mettre dans l'e-mail.

## Autres routes admin utilisées

- `GET /admin/users/{id}` : fiche bénévole.
- `GET /admin/plannings?role=benevole` : créneaux de chaque bénévole sur la vue d'ensemble, en un appel.
- `PATCH /admin/users/{id}/role` : « Passer admin / Retirer les droits admin ».

## Missions sensibles : validation par un admin

Contrat complet côté back : `docs/validations-admin.md` dans le dépôt de Louis.

- `GET /creneaux` renvoie aussi les créneaux sensibles (`mission.isSensible`). Le planning les affiche avec la mention « Sur validation d'un admin ».
- `POST /reservations` sur une mission sensible → `validation_admin: "en_attente"`. Le front affiche « En attente » (planning, récap, barre du bas).
- Une demande en attente peut être annulée même après validation du planning ; le planning repasse alors en brouillon.
- `GET /admin/validations?statut=en_attente|acceptee` : page Admin › Validations (onglets En attente / Acceptées), bandeau sur la vue d'ensemble.
- `PATCH /admin/reservations/{id}/validation` `{ decision: "acceptee" | "refusee" }` : boutons Accepter (1 clic) et Refuser (2 clics), sur la page Validations, la page d'un créneau et la fiche bénévole. Refus = réservation supprimée, planning du bénévole en brouillon.
- `demandes_en_attente` (`/admin/users`) : pastille « N en attente » dans la liste des bénévoles.

## Reste à faire côté back

- Route publique de l'édition active, pour afficher ses dates aux bénévoles. Aujourd'hui elles sont écrites dans `config.ts`.
- Code d'invitation lié à l'adresse invitée (pas de colonne `email` dans `invitation_codes`).
