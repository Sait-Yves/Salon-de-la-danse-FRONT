# Salon de la Danse 2027 — Front bénévoles

Next.js 16 (App Router). Toutes les requêtes vers l'API Laravel passent côté serveur (`app/services/api.ts`) ; le token est dans un cookie httpOnly.

- `app/services/adapters.ts` : seul fichier qui connaît le format JSON du back.
- `API_URL` : variable d'environnement (voir `.env.example`), à renseigner dans Vercel.
- `API_MOCK=1 npm run dev` : mode démo sans back (admin@salon.test / benevole@salon.test, mot de passe libre, code d'invitation `DANSE2027`).
- Prérequis côté back : une édition active et des créneaux en base, sinon le planning répond 409.
