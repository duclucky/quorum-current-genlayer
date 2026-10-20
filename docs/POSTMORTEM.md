# V1 implementation and verification postmortem

QuorumCurrent completed a locally tested and publicly hosted Projects release on
Studio Dev. This records engineering evidence, not Portal acceptance or an
independent security audit.

## Validated

One deployed contract implements six writes and eight views. Validators interpret
authenticated, immutable member scope text; deterministic code conserves the three
original voices and derives the fixed grant/refund. The live evidence covers a
transitive APPROVED grant, a REJECTED cycle including an inbound origin,
UNCLEAR/RETRYABLE, expiry recovery with missing records, exact native withdrawal
delivery and zero-liability closure. Seven 2 GEN purses were received and withdrawn:
locked, credits and native contract balance are all 0 GEN.

Chrome/OKX proves the sponsor's actual browser funding, member record, semantic
review, withdrawal, recovery and closure controls. The other two registered members
used API signing at the owner's request. Production Chrome reads the same deployed
contract. Production wallet writes are not claimed separately from the local
Chrome/OKX write evidence.

The complete check passes lint, 60 direct tests plus one metadata test, 12 tooling
tests, 33 frontend tests, frontend/API TypeScript and the production build. Public
CI runs the same check. Counts describe collected cases; one direct case separately
enumerates 1,728 graph/ballot combinations.

## Lessons from observed failures

1. Parent finality does not prove asynchronous native delivery. A withdrawal must
   show an exact contract debit, cleared credit, matching recipient message and
   recipient balance increase. The delivery waiter has a regression test.
2. Studio Dev returned a 30-request-per-minute limit. List reads now request only
   canonical summaries sequentially; finality polling is paced. An unknown signed
   hash stays journaled and is inspected before any retry.
3. Native Node ESM requires the compiled serverless import to resolve. The initial
   Vercel deployment failed on an extensionless import; a native startup regression
   reproduced it and the explicit .js import fixed it. Isolated API TypeScript
   configuration then removed the serverless build's unrelated client/test types.
4. A user-reported wallet hash can refer to another contract. The supplied record
   hash was checked against its actual destination/time and excluded. A missed
   collection window was recovered honestly instead of called a successful vote.
5. A script-signed lifecycle does not prove a website payment flow. Browser controls,
   wallet signatures, canonical reloads and actual recipient evidence were verified
   separately. The user guide now states twelve explicit actions and outcomes.

## Limits and next milestone

V1 has three public members, a fixed two-of-three threshold and a fixed 2 GEN purse.
Demo wallets share one operator; there is no independent identity, adoption,
external performance or DAO execution proof. Closing requires zero global credit
liability. Two zero-liability browser histories remain optionally closable.
The owner submitted V1 on 2026-10-20. The authenticated Portal shows Projects,
QuorumCurrent, Pending review and four evidence items. Reviewer acceptance remains
pending and distinct from release verification.

After V1 is accepted, a credible substantial milestone is persistent multi-proposal
delegation charters with snapshot-bound revocation and an authenticated DAO/Safe
execution adapter. That work needs a new specification, evidence authority matrix,
adversarial tests and live consumer enforcement proof; none is claimed by V1.
