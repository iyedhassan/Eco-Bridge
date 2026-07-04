# EcoBridge AI — Backend Prisma SQLite + Gemini

Cette version utilise SQLite par défaut. Aucun serveur PostgreSQL, XAMPP ou WampServer n’est nécessaire.

## Lancement

```powershell
npm install
Copy-Item .env.example .env -Force
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed
npm run typecheck
npm run dev
```

## Gemini

La clé Gemini doit rester dans `.env` :

```env
GEMINI_API_KEY="votre_cle_gemini"
```

Gemini est utilisé seulement côté backend via `lib/gemini.ts`. Si la clé est vide ou si l’API échoue, EcoBridge utilise automatiquement un fallback métier local.

## Routes IA

- `POST /api/ai/analyze` : analyse une annonce existante avec `listingId` ou un payload d’annonce.
- `POST /api/ai/advisor` : analyse un besoin utilisateur en langage naturel.
- `GET/POST /api/matching` : récupère ou crée des besoins/matches.

## Démo jury

1. Se connecter avec `seller@ecobridge.tn / 123456`.
2. Créer une annonce dans `/listings/new`.
3. Cliquer sur “Analyser avec IA”.
4. Voir le score, CO₂ évité, prix recommandé et risques.
5. Se connecter avec `startup@ecobridge.tn / 123456`.
6. Utiliser `/advisor` avec : “Je cherche des déchets plastiques PET à Sfax pour fabriquer des emballages recyclés.”
7. Envoyer une demande au vendeur.
8. Voir les KPI dans `/dashboard` et `/admin`.
