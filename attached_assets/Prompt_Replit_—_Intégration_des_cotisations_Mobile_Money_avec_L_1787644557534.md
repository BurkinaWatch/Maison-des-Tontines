# OBJECTIF

Tu travailles sur l'application existante **Maison des Tontines**.

L'application possède déjà une architecture de paiement avec notamment :

- `PaymentTransaction`
- `Contribution`
- `PaymentProvider`
- `MockProvider`
- `WaveProvider`
- `WebhookService`
- `Payout`
- `TontineCycle.potReceived`
- écran mobile de paiement des cotisations

NE RECONSTRUIS PAS le système depuis zéro.

Commence par analyser complètement le code existant, le schéma Prisma, les routes backend, les services de paiement et les écrans React Native concernés.

Ton objectif est de transformer le paiement simulé actuel en un **véritable système de collecte de cotisations Mobile Money**, avec **LiquidCash comme provider**, tout en conservant une architecture extensible.

---

# 1. RÈGLE ABSOLUE : NE RIEN CASSER

Avant toute modification :

1. Inspecte l'architecture existante.
2. Identifie précisément les fichiers concernés.
3. Réutilise les abstractions déjà présentes.
4. Ne supprime pas `MockProvider`.
5. Ne supprime pas `WaveProvider`.
6. Ne réécris pas inutilement les écrans existants.
7. Ne crée pas un deuxième système de paiement parallèle.
8. Ne modifie pas les fonctionnalités de tontine qui fonctionnent déjà.
9. Si une modification du schéma Prisma est nécessaire, fais-la avec une migration propre.
10. Après chaque modification importante, vérifie que le projet compile.

---

# 2. ARCHITECTURE CIBLE

L'architecture doit être :

Utilisateur
→ écran "Payer ma cotisation"
→ Backend
→ PaymentTransaction PENDING
→ LiquidCashProvider
→ API LiquidCash
→ Mobile Money
→ confirmation utilisateur
→ webhook LiquidCash
→ vérification serveur
→ PaymentTransaction SUCCESS
→ Contribution PAID
→ mise à jour du cycle
→ mise à jour du réservoir de la tontine.

Le système doit être conçu pour pouvoir ajouter d'autres providers plus tard sans modifier la logique métier des cotisations.

Architecture cible :

PaymentProvider
├── MockProvider
├── WaveProvider
└── LiquidCashProvider

La logique métier doit dépendre de `PaymentProvider`, et non directement de LiquidCash.

---

# 3. INTÉGRATION LIQUIDCASH

Créer un véritable :

`LiquidCashProvider`

en respectant l'interface de paiement déjà présente dans le projet.

IMPORTANT :

NE DEVINE PAS les endpoints, paramètres, headers, signatures ou formats de réponse de LiquidCash.

Utilise uniquement :

- la documentation officielle LiquidCash fournie dans le projet ou disponible via les informations que je fournirai ;
- les credentials de test fournis ;
- les endpoints réellement documentés.

Si une information LiquidCash manque, rends-la configurable via des variables d'environnement et indique clairement ce qui doit être renseigné.

NE HARDCODE JAMAIS :

- API key
- secret
- token
- merchant ID
- webhook secret
- credentials Mobile Money.

---

# 4. VARIABLES D'ENVIRONNEMENT

Prévoir une configuration du type :

LIQUIDCASH_API_URL
LIQUIDCASH_API_KEY
LIQUIDCASH_SECRET
LIQUIDCASH_MERCHANT_ID
LIQUIDCASH_WEBHOOK_SECRET
LIQUIDCASH_ENVIRONMENT

Les noms peuvent être adaptés aux exigences réelles de LiquidCash, mais toutes les données sensibles doivent rester dans les Secrets Replit/Railway.

Ne jamais exposer ces valeurs :

- dans le frontend ;
- dans le bundle React Native ;
- dans GitHub ;
- dans les logs ;
- dans les réponses API.

---

# 5. MODÈLE DE TRANSACTION

Inspecte `PaymentTransaction`.

Si nécessaire, améliore le modèle afin qu'une transaction puisse être reliée sans ambiguïté à :

- l'utilisateur ;
- la tontine ;
- le cycle de tontine ;
- la contribution ;
- la transaction du provider.

La relation logique doit être :

PaymentTransaction
→ User
→ Tontine
→ TontineCycle
→ Contribution

Utilise les relations Prisma existantes lorsqu'elles sont déjà présentes.

Ne crée pas de duplication inutile.

---

# 6. STATUTS DE PAIEMENT

Le système doit distinguer clairement :

PENDING
PROCESSING
SUCCESS
FAILED
CANCELLED
EXPIRED

Le statut métier `Contribution` doit également être cohérent.

IMPORTANT :

Une contribution ne doit devenir `PAID` que lorsque le paiement a été réellement confirmé.

Ne considère JAMAIS :

- l'ouverture de l'écran Mobile Money ;
- l'envoi de la requête ;
- une réponse `200` de création de transaction ;

comme une preuve de paiement.

La preuve définitive doit venir de la confirmation du provider ou d'une vérification serveur du statut.

---

# 7. CRÉATION D'UNE COTISATION

Lorsqu'un membre clique :

"Payer ma cotisation"

le backend doit :

1. vérifier que l'utilisateur est bien membre de la tontine ;
2. vérifier que la cotisation existe ;
3. vérifier son montant ;
4. vérifier qu'elle n'est pas déjà payée ;
5. créer une référence interne unique ;
6. créer `PaymentTransaction` avec statut `PENDING` ;
7. appeler `LiquidCashProvider` ;
8. enregistrer l'identifiant retourné par LiquidCash ;
9. retourner au frontend uniquement les informations nécessaires au parcours de paiement.

Ne jamais faire confiance au montant envoyé par le frontend.

Le backend doit déterminer lui-même le montant officiel de la cotisation.

---

# 8. RÉFÉRENCE DE TRANSACTION

Chaque paiement doit avoir une référence unique et traçable.

Exemple :

MDT-20260825-XXXXXX

La référence doit permettre de retrouver :

- utilisateur ;
- tontine ;
- cycle ;
- contribution ;
- transaction provider.

La référence interne et la référence LiquidCash doivent être conservées séparément.

---

# 9. WEBHOOK LIQUIDCASH

Implémente un endpoint backend dédié aux webhooks LiquidCash.

Exemple conceptuel :

POST /api/payments/webhooks/liquidcash

L'URL exacte doit respecter l'architecture existante du backend.

Le webhook doit :

1. recevoir l'événement ;
2. vérifier son authenticité selon la documentation LiquidCash ;
3. identifier la transaction ;
4. retrouver `PaymentTransaction` ;
5. vérifier le montant ;
6. vérifier la devise ;
7. vérifier la référence ;
8. vérifier que la transaction appartient bien au contexte attendu ;
9. mettre à jour la transaction ;
10. mettre à jour la contribution ;
11. mettre à jour le cycle ;
12. enregistrer l'événement.

---

# 10. IDEMPOTENCE — OBLIGATOIRE

Le système doit être totalement idempotent.

Si LiquidCash envoie deux fois le même webhook :

NE PAS créditer deux fois la cotisation.

Si le frontend répète la requête :

NE PAS créer deux paiements pour la même cotisation sans raison.

Si le serveur reçoit plusieurs notifications identiques :

UNE SEULE opération comptable doit être appliquée.

Une transaction déjà `SUCCESS` ne doit jamais être recréditée.

Utilise les identifiants uniques disponibles et des contraintes de base de données lorsque pertinent.

---

# 11. RÉSERVOIR DE LA TONTINE

Lorsqu'une cotisation est confirmée :

Contribution = PAID

et le montant doit être correctement pris en compte dans :

`TontineCycle.potReceived`

ou dans le mécanisme financier existant du projet.

IMPORTANT :

Ne fais pas simplement :

`potReceived += amount`

sans protection contre les doublons.

La logique doit être basée sur la transaction comptable confirmée.

Si le projet possède déjà un mécanisme de ledger, réutilise-le.

Sinon, introduis proprement une structure de type `LedgerEntry`.

Une entrée financière confirmée doit contenir au minimum :

- tontine ;
- cycle ;
- montant ;
- type ;
- référence ;
- transaction ;
- date ;
- utilisateur concerné.

---

# 12. ÉCRAN MOBILE

L'écran existant :

`contribution/pay.tsx`

doit être connecté au véritable backend.

Supprime la simulation actuelle du type :

setTimeout(...)

et remplace-la par le véritable workflow API.

Le parcours utilisateur doit être :

### État 1

"Votre cotisation"

Montant :

10 000 FCFA

Bouton :

"Payer ma cotisation"

### État 2

Choix du moyen de paiement selon les options réellement supportées par LiquidCash.

### État 3

"Paiement en cours..."

### État 4

"Vérification du paiement..."

### État 5 — succès

"✅ Cotisation payée"

Afficher :

- montant ;
- date ;
- référence ;
- tontine ;
- cycle.

### État 6 — échec

"❌ Le paiement n'a pas abouti"

Avec possibilité de réessayer.

---

# 13. NE PAS AFFICHER "PAYÉ" TROP TÔT

C'est une règle critique.

Après l'appel initial au provider, l'application peut afficher :

"Paiement initié"

ou

"Paiement en attente"

mais jamais :

"Paiement réussi"

tant que le backend n'a pas confirmé le succès.

Le frontend doit éventuellement interroger le backend pour connaître l'état de la transaction si le webhook n'est pas instantané.

---

# 14. HISTORIQUE DES COTISATIONS

Dans l'espace de la tontine, afficher l'historique réel.

Chaque membre doit pouvoir voir :

- montant ;
- date ;
- cycle ;
- statut ;
- référence.

Exemple :

10 000 FCFA — 25/08/2026 — Cycle août — ✅ PAYÉ

Les informations doivent provenir de la base de données, pas de valeurs fictives.

---

# 15. CAISSE / RÉSERVOIR VÉRIFIABLE

Créer ou améliorer l'écran permettant aux membres autorisés de voir la situation financière de la tontine.

Afficher au minimum :

### Solde / montant collecté

350 000 FCFA

### Cotisations

8 payées
3 en attente
1 en retard

### Historique

Membre
Montant
Date
Statut
Référence

Les membres ne doivent voir que les informations auxquelles leur rôle leur donne accès.

---

# 16. SÉCURITÉ

Appliquer les règles suivantes :

- validation serveur de tous les montants ;
- validation des permissions ;
- validation de l'appartenance à la tontine ;
- vérification des signatures webhook ;
- aucune clé secrète dans React Native ;
- aucune clé secrète dans Git ;
- logs sans données sensibles ;
- protection contre les doublons ;
- protection contre les paiements d'un montant différent ;
- protection contre l'utilisation d'une transaction pour une autre tontine ;
- protection contre la modification arbitraire d'une contribution depuis le frontend.

Ne jamais permettre au frontend de déclarer :

`status = SUCCESS`

ou :

`contribution = PAID`.

---

# 17. MODE TEST

Conserver `MockProvider`.

Ajouter un mécanisme permettant de choisir le provider via configuration :

PAYMENT_PROVIDER=mock

ou :

PAYMENT_PROVIDER=liquidcash

Le développement doit pouvoir continuer sans appeler LiquidCash à chaque test.

Le mode Mock doit rester fonctionnel.

---

# 18. LOGGING

Ajouter des logs utiles mais sécurisés.

Exemple :

[PAYMENT] Payment initiated
[PAYMENT] Provider transaction created
[PAYMENT] Webhook received
[PAYMENT] Transaction confirmed
[PAYMENT] Contribution marked as paid

Ne jamais loguer :

- API keys ;
- secrets ;
- OTP ;
- PIN Mobile Money ;
- tokens ;
- données sensibles complètes.

---

# 19. GESTION DES ERREURS

Prévoir notamment :

- provider indisponible ;
- timeout ;
- transaction inconnue ;
- transaction déjà payée ;
- montant incorrect ;
- webhook invalide ;
- signature invalide ;
- utilisateur non autorisé ;
- cotisation déjà payée ;
- paiement expiré ;
- annulation ;
- erreur réseau côté mobile.

Les erreurs affichées à l'utilisateur doivent être compréhensibles.

Les détails techniques restent côté serveur.

---

# 20. TESTS

Créer ou compléter les tests nécessaires.

Tester au minimum :

### Test 1
Création d'une cotisation.

### Test 2
Création d'un paiement.

### Test 3
Paiement réussi.

### Test 4
Paiement échoué.

### Test 5
Webhook valide.

### Test 6
Webhook invalide.

### Test 7
Webhook reçu deux fois.

Résultat attendu :

UNE SEULE cotisation payée.

### Test 8
Paiement avec montant incorrect.

Résultat :

REFUS.

### Test 9
Tentative de payer une cotisation appartenant à une autre tontine.

Résultat :

REFUS.

### Test 10
Cotisation déjà payée.

Résultat :

pas de deuxième crédit.

---

# 21. COMPATIBILITÉ AVEC L'EXISTANT

Avant de terminer, vérifie que ces fonctionnalités continuent à fonctionner :

- création de tontine ;
- invitation de membres ;
- adhésion ;
- cycles ;
- cotisations ;
- dashboard ;
- historique ;
- authentification ;
- notifications ;
- MockProvider ;
- WaveProvider si déjà fonctionnel.

Ne casse aucune fonctionnalité existante.

---

# 22. IMPORTANT : NE PAS IMPLÉMENTER LE PAYOUT MAINTENANT

Ne mets PAS encore en production le transfert :

Caisse → bénéficiaire.

Le `Payout` existant peut rester préparé pour une future version.

Cette tâche concerne uniquement :

**Membre → Mobile Money → Caisse de la tontine**

Nous implémenterons les décaissements dans une deuxième phase.

---

# 23. APRÈS L'IMPLÉMENTATION

À la fin :

1. lance les migrations Prisma si nécessaires ;
2. vérifie le build backend ;
3. vérifie le build frontend/mobile ;
4. exécute les tests ;
5. vérifie les routes ;
6. vérifie les variables d'environnement ;
7. vérifie les webhooks ;
8. vérifie les permissions ;
9. vérifie l'idempotence.

Puis donne-moi un rapport clair avec :

### Fichiers modifiés

Liste exacte.

### Base de données

Migrations effectuées.

### API

Nouvelles routes.

### LiquidCash

Endpoints réellement utilisés.

### Variables Secrets

Liste des variables nécessaires, SANS révéler leurs valeurs.

### Tests

Tests réussis/échoués.

### Ce qui reste à configurer

Par exemple :

- credentials LiquidCash ;
- URL webhook ;
- environnement sandbox/production ;
- configuration merchant.

---

# RÈGLE FINALE

NE SIMULE PAS un paiement réel en production.

Si les credentials ou endpoints LiquidCash ne sont pas encore disponibles, implémente proprement toute l'architecture jusqu'au point d'intégration et utilise `MockProvider` pour les tests.

NE FABRIQUE PAS d'API LiquidCash.

NE SUPPOSE PAS que `200 OK` signifie paiement réussi.

NE CRÉDITE JAMAIS la caisse sans confirmation fiable du paiement.

L'objectif final est d'obtenir un système dans lequel :

**un membre paie réellement sa cotisation par Mobile Money → LiquidCash confirme la transaction → Maison des Tontines valide automatiquement la cotisation → la caisse de la tontine est mise à jour → tous les membres autorisés peuvent vérifier la transaction.**