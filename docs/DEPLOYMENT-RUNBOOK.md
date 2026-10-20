# Studio Dev lifecycle runbook

Inspect before any write. `node scripts/deploy.mjs inspect` verifies chain 61997,
existing role separation and balances in GEN. Project `.env` overrides the
authorized parent `.env`. This run reuses three existing EOAs; no new keys or
faucet are needed. All three demonstration actors share one operator.

`node scripts/deploy.mjs smoke` checks the exact source constructor, public
schema and payable creation metadata without signing or depositing value.
`node scripts/deploy.mjs deploy` reuses a matching active identity or resumes
the journaled deployment hash. The current source must be committed and clean.
The SDK estimates a real fee deposit from the current Studio policy. Never count
FINALIZED without successful execution and a canonical protocol-version read.

Bounded first value smoke: `create cascade`, then verify the canonical 2 GEN
purse, native contract balance and own-member metadata before continuing.

```powershell
node scripts/lifecycle.mjs create cascade
node scripts/lifecycle.mjs record cascade
node scripts/lifecycle.mjs review cascade
node scripts/lifecycle.mjs state cascade
node scripts/lifecycle.mjs withdraw 1
node scripts/lifecycle.mjs close cascade
```

Commands retain case IDs/deadlines and operation hashes in the selected network
evidence folder. Recording is legal only before its deadline; review only from
that deadline until expiry. The command reports a not-yet-legal time instead of
signing early. Repeat `review` only after checking the current attempt and source
failure class. Three UNCLEAR attempts exhaust review but not sponsor recovery.

Run `cycle` to prove all origins entering a cycle abstain and the fixed threshold
does not shrink. Run `unclear` to prove ambiguity cannot settle, then recover at
expiry. Run `partial` with one member only to prove unilateral expiry recovery.
Withdraw sponsor refunds with role 0 and beneficiary grants with role 1. An empty
credit is a no-op in the operator script; duplicate contract writes still reject.

Every external value exit requires an exact native contract debit, cleared own
credit, recipient balance evidence and public child/receipt confirmation. Parent
finality alone is insufficient. A failed or ambiguous operation is inspected by
its saved hash; no blanket replay, duplicate funding or automatic redeployment.
Archive a superseded revision with its status/reason and recovery proof; abandon
a broken revision explicitly and never send it more GEN.

Script-signed proof is distinct from a browser wallet workflow. Every claimed
browser action must also be exercised through its actual UI control, selected
wallet, real SDK adapter, finality tracking and canonical reload. Missing browser
or native-delivery evidence remains pending.
