# Contrat API : missions et créneaux (à ajouter côté back)

Le front est prêt et appelle déjà ces routes. Tant qu'elles n'existent pas, il affiche
« Cette action n'est pas encore disponible sur le serveur. »

Toutes les routes sont sous `/api/admin`, avec un token `admin` (même middleware que les autres routes admin).
Les formats reprennent ceux de `CreneauResource` et des erreurs Laravel déjà utilisées.

## Missions

| Méthode | Endpoint | Corps | Réponse |
|---|---|---|---|
| GET | `/admin/missions` | — (option `?edition_id=`) | `{ data: [ { id, edition_id, nom, isSensible } ] }` |
| POST | `/admin/missions` | `{ nom, isSensible, edition_id? }` | 201 `{ data: mission }` |
| PATCH | `/admin/missions/{id}` | `{ nom?, isSensible? }` | 200 `{ data: mission }` |
| DELETE | `/admin/missions/{id}` | — | 204 |

- `edition_id` absent : prendre l'édition active (`editions.isActive = true`).
- `nom` obligatoire, unique dans l'édition → 422 sur `nom`.
- DELETE : **409** si au moins une réservation existe sur un de ses créneaux
  (`{ "message": "Impossible de supprimer : 3 bénévoles sont inscrits sur cette mission." }`).
  Sinon, supprime la mission **et ses créneaux vides**.
- GET `/admin/missions` renvoie aussi les missions sans créneau (sinon elles sont invisibles dans l'admin).

## Créneaux

| Méthode | Endpoint | Corps | Réponse |
|---|---|---|---|
| POST | `/admin/creneaux` | `{ mission_id, jour, heure_debut, heure_fin, capacite_max }` | 201 `{ data: CreneauResource }` |
| PATCH | `/admin/creneaux/{id}` | mêmes champs, tous facultatifs sauf `mission_id` non modifiable | 200 `{ data: CreneauResource }` |
| DELETE | `/admin/creneaux/{id}` | — | 204 |

Formats : `jour` = `AAAA-MM-JJ`, heures = `HH:MM`, `capacite_max` entier ≥ 1.

Règles (422 avec la clé du champ en cause) :

- `jour` compris entre `date_debut` et `date_fin` de l'édition de la mission → `jour`.
- `heure_fin` > `heure_debut` → `heure_fin`.
- PATCH : `capacite_max` ≥ nombre d'inscrits actuels → `capacite_max`.

DELETE : **409** si le créneau a des inscrits
(`{ "message": "Impossible de supprimer : 2 bénévoles sont inscrits sur ce créneau. Retirez-les d'abord." }`).
L'admin les retire depuis la page du créneau (`DELETE /admin/reservations/{id}`), puis supprime.

## Déjà intégré côté front

- `GET /admin/users/{id}` : fiche bénévole.
- `GET /admin/plannings?role=benevole` : créneaux de chaque bénévole sur la vue d'ensemble, en un appel.
- `GET /admin/creneaux/{id}/inscrits` : page de suivi d'un créneau.
  Le front lit `{ data: { creneau, places_restantes, inscrits: [ { reservation_id, statut, user } ] } }`
  et accepte aussi une liste de réservations avec `user` dedans. Si le format est différent, me l'envoyer.

## Reste à trancher (parcours sensible)

- Réservation d'un créneau sensible par un bénévole → statut « en attente », validation par un admin.
- La place est-elle bloquée pendant l'attente ? Que peut faire le bénévole après un refus ?
