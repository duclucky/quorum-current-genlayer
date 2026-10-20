# Release audit

Category: Projects. This is a source/test/evidence/claim reconciliation by the
builder, not an independent security audit or a Portal acceptance decision.

## Deployment result

Network: Studio Dev, chain 61997.
Contract: `0x10eb2739Cd3336a69DBfE9cAeA2F9704D50708ce`.
Deployment: `0x04a0916e815cf68a37614724b8823254461eb98c3ba52c33fd68617e32ae7c9e`.
Status: FINALIZED.
Result: SUCCESS.

These values come from the actual RPC receipt, protocol-version view and rendered
Explorer GenVM Execution section, not from deployment intent. Source SHA-256:
`fe8736d2cc4c7d7eeaaccfd463ef88c45ba1cdac47ee9f7370211d11fa9623b8`.
The active identity and Explorer proof are in `evidence/studio-dev/`.

## Four-source reconciliation

| Source | Verified facts | Proof |
| --- | --- | --- |
| Contract | One ASCII `QuorumCurrent` subclass, pinned v0.3 runner family, six writes/eight views, immutable proposal/member domains, deterministic three-origin graph and ledger | contracts/quorum_current.py; metadata test; current linter recognizes 14 methods |
| Tests | 60 direct cases plus one metadata case = 61 Python tests; 12 Node tooling tests; 33 frontend tests. No skipped/xfail tests. One graph case enumerates 1,728 combinations | check-serverless-types.txt; direct collection; native ESM startup and isolated API typecheck |
| Network | APPROVED transitive grant, REJECTED cycle including inbound origin, UNCLEAR/RETRYABLE, missing-member expiry recovery, native delivery and closure | NETWORK-VERIFICATION.md; BROWSER-PAYMENT-VERIFICATION.md; safe per-network receipt/state/balance files |
| Product/claims | Six routes; real selected OKX wallet; finality/retry/zero-credit behavior; six actual browser principal actions, two additional members explicitly API-signed; production canonical read succeeds | local browser artifacts; production/browser-read.json; README and specification claim matrices |

## Authority-to-consequence traces

| Consequential input | Deterministic authority/binding | Semantic boundary | Negative tests | Canonical/network proof |
| --- | --- | --- | --- | --- |
| Funded canonical proposal and destinations | Runtime sponsor, unique ID, three distinct nonzero members, fixed beneficiary, exact 2 GEN and bounded deadlines; immutable decision/domain/version digest | Only interpretation of the exact registered text; no external-performance authenticity claim | wrong purse, immutable ID/isolation, wrong canonical digest/domain/proposal/entity | get_decision/get_accounting; actual create receipts and deployment identity |
| Member-authored scope/target/ballot | Registered sender owns its own slot, exact proposal digest, one record, own transaction timestamp strictly before deadline | Scope applicability only; locked target, ballot, destination and threshold cannot be redefined by prose | wrong actor/digest/duplicate, foreign member binding, stale/future timestamp, valid-byte wrong-binding tripwires and injection | get_member; browser-grant-recorded.json plus the two actual API member receipts |
| Validator applicability vector | Expected delegated IDs exactly once; no extra/missing/duplicate IDs or invalid enums; direct labels derived; snapshot binds exact records | `run_nondet_default` validator checks Return shape and independently re-runs the semantic classifier, then compares normalized applicability meaning | malicious leader/non-Return, malformed coverage/enums, independent semantic replay, invalid purse before mutation | get_attempt/get_resolution; approved grant, cycle verdict and UNCLEAR reviewed files |

Code derives every origin path/root, cycle abstention, fixed-denominator tally and
fixed payee/amount. No model-provided root, dependency, payout or free-text rationale
can authorize a consequence. Invalid vectors reject before mutation or become
non-penalizing RETRYABLE. The ledger remains unchanged in the rejection tests.
Graph reference and outside-scope tests cover derived root/path meaning; arbitrary
fault/downstream classes are outside this contract's output schema.

## Recovery and value audit

All six write safety cards are in the specification. Direct tests cover role,
state, duplicate, accounting and terminal-state guards. Time-bounded writes cover
boundary -1, equality and +1 while phase remains stale. Recovery is available to
the actual sponsor after expiry with 0, 1 or 2 member records and after UNCLEAR.
Withdrawals debit credit before the EVM interface message; actual delivery requires
an exact native contract decrease and a matching recipient increase/message.
Asynchronous delivery is awaited instead of inferring payment from parent finality.

All seven demo purses were 2 GEN. Final received = withdrawn = 14 GEN; locked,
credits and native contract balance = 0 GEN. Two browser histories can still be
closed, but they retain no GEN liability. API cases and the first browser case
already prove closure. No rejected, missing or merely accepted transaction is
counted as a finalized consequence.

## Original checker interpretation

The original checker is run unchanged with Projects, dynamic npm/gltest checks,
the real repository/Explorer URLs and a 927-character description. Its initial
run reported 0 BLOCKER and one formatting warning because it searched for the
literal deployment result line; the real result is recorded above.
The final unchanged Projects invocation completed with exit 0: 0 BLOCKER,
0 WARN, 6 auto-verified OK; both npm run check and gltest tests/ passed.

Two rubric heuristics require manual reconciliation: the legacy custom-validator
detector recognizes `run_nondet(` or a particular function name, whereas this
pinned v0.3 contract correctly uses `run_nondet_default(leader, validator)`.
The frontend detector scans test files too and matches negative-test words such
as mock/fake. Tests and real browser receipts prove production signing, balances,
fees and finality are not simulated. Neither heuristic is bypassed by renaming
code, deleting tests, changing the checker or weakening the deployed contract.

## Honest limits

Three public named members; fixed 2 GEN purse and two-of-three threshold; demo
wallets share one operator. No sybil/identity proof, private ballots, external
service performance, real DAO execution, independent adoption or Portal acceptance
is claimed. Closing requires global credit liability to be zero. Studio Dev is a
development preview; other networks are not certified. CI is verified against the
final public commit in the delivered submission packet, separately from local proof.
